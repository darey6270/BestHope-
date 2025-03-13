const express = require('express');
const router = express.Router();
const Deposit = require('../models/depositModel');
const User = require('../models/userModel');
const Referral  = require('../models/referralModel');
const dotenv = require("dotenv").config();
const cloudinary = require('../utils/cloudinary'); // Import Cloudinary configuration
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const {fileSizeFormatter } = require("../utils/fileUpload");
const uploadMiddleware = require("../utils/uploadMiddleware");
const upload = uploadMiddleware("uploads");
const Config=require("../models/Config");

  // DELETE: Delete all deposits
  // router.delete('/all', async (req, res) => {
  //   try {
  //       await Deposit.deleteMany({});
  //       res.status(200).json({ message: "All deposits deleted successfully." });
  //   } catch (error) {
  //       res.status(500).json({ message: error.message });
  //   }
  // });

// PATCH: Update the status of a deposit by ID
router.patch('/:id/status', async (req, res) => {
    try {
        const { status,amount} = req.body;

        // Validate the new status
        const validStatuses = ["pending", "approved", "rejected", "seen"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
        }

        // Find the deposit by ID
        const deposit = await Deposit.findById(req.params.id);
        if (!deposit) {
            return res.status(404).json({ message: 'Deposit not found' });
        }

        // Check if the status is being updated to "approved"
        if (status === "approved") {
            // Find the user associated with the deposit
            const user = await User.findById(deposit.userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Add the deposit amount to the user's balance
            user.balance += amount;
            await user.save(); // Save the updated user balance
        }

        // Update the deposit status
        deposit.status = status;
        const updatedDeposit = await deposit.save();

        res.status(200).json({
            message: `Deposit status updated to ${status}`,
            deposit: updatedDeposit,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// PATCH: Update the status of a deposit by ID
router.patch('/period/:id', async (req, res) => {
    try {
        const { status,notes} = req.body;

        // Validate the new status
        const validStatuses = ["pending", "approved", "declined", "seen"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`});
        }

        // Find the deposit by ID
        const deposit = await Deposit.findById(req.params.id);
        if (!deposit) {
            return res.status(404).json({ message: 'Deposit not found' });
        }

        // Check if the status is being updated to "approved"
        if (status === "approved") {
            // Find the user associated with the deposit
            const user = await User.findById(deposit.userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Add the deposit amount to the user's balance
            // user.balance += amount;
            // await user.save(); // Save the updated user balance
        }


        if (status === "declined") {
            // Find the user associated with the deposit
           deposit.notes=notes;
        }

        // Update the deposit status
        deposit.status = status;
        const updatedDeposit = await deposit.save();

        res.status(200).json({
            message: `Deposit status updated to ${status}`,
            deposit: updatedDeposit,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// CREATE: Add a new deposit
router.post('/',upload.single('image'), async (req, res) => {
    try {
        const { userId, status ,amount,currentPeriod} = req.body;
        const image = req.file ? req.file.path : null;    

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update fields if provided in the request body
        if (currentPeriod !== undefined) user.currentPeriod = currentPeriod;
        
        const updatedUser = await user.save();

        // Create new deposit
        const deposit = new Deposit({
            userId,
            image,
            status,
            amount,
            currentPeriod,
            notes:"",
        });

        const savedDeposit = await deposit.save();
        res.status(201).json(savedDeposit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// CREATE: Add a new deposit
router.post('/ajo',upload.single('image'), async (req, res) => {
    try {
        const { userId, status ,amount} = req.body;
        const current_period = await Config.findOne({ key: "currentPeriod" });
        const currentPeriod=current_period ? current_period.value : "";
        const image = req.file ? req.file.path : null;    

    
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Create new deposit
        const deposit = new Deposit({
            userId,
            image,
            status,
            amount,
            currentPeriod,
            notes:"",
        });

         user.currentPeriod = currentPeriod;
        const updatedUser = await user.save();

        const savedDeposit = await deposit.save();
        res.status(201).json(savedDeposit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// READ: Get all deposits
router.get('/', async (req, res) => {
    try {
        const deposits = await Deposit.find().populate('userId', 'username email');
        res.status(200).json(deposits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/search/:username", async (req, res) => {
  try {
      const { username } = req.params;

      // Find the user by username
      const user = await User.findOne({ username });
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      // Get deposits linked to the user
      const deposits = await Deposit.find({ userId: user._id }).populate('userId', 'username email');

      res.status(200).json(deposits);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});


router.get('/getusercontribution/:id', async (req, res) => { 
    try {
        const _id = req.params.id;
        const currentPeriodConfig = await Config.findOne({ key: "currentPeriod" });
        const currentPeriod = currentPeriodConfig ? currentPeriodConfig.value : "";
        console.log(currentPeriod);

        if (!currentPeriod) {
            return res.status(400).json({ error: 'Current period is not defined in the configuration.' });
        }

        const deposits = await Deposit.find({ _id:_id, currentPeriod: currentPeriod}).populate('userId', 'username email image referral');

        res.status(200).json(deposits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/getregisteruser/:id', async (req, res) => { 
    try {
        const _id=req.params.id;

        const deposits = await Deposit.find({ _id:_id, currentPeriod: "Reg Fee" }).populate('userId', 'username email image referral');

        res.status(200).json(deposits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/info', async (req, res) => { 
  try {
      const {userId,currentPeriod}=req.body;

      const deposits = await Deposit.findOne({ userId, currentPeriod});

      res.status(200).json(deposits);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});



router.get('/getusercontribution', async (req, res) => { 
    try {
        const currentPeriodConfig = await Config.findOne({ key: "currentPeriod" });
        const currentPeriod = currentPeriodConfig ? currentPeriodConfig.value : "";
    
        if (!currentPeriod) {
            return res.status(400).json({ error: 'Current period is not defined in the configuration.' });
        }

        const deposits = await Deposit.find({ currentPeriod: currentPeriod}).populate('userId', 'username email image referral');

        res.status(200).json(deposits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/getregistereduser', async (req, res) => { 
    try {
        
        const users = await Deposit.find({ currentPeriod: "Reg Fee" }).populate('userId', 'username email image referral');

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// READ: Get a single deposit by ID
router.get('/:id', async (req, res) => {
    try {
        const userId=req.params.id;
        const deposit = await Deposit.find({userId});
        if (!deposit) return res.status(404).json({ message: 'No deposit found for this user' });
        res.status(200).json(deposit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE: Update a deposit by ID
router.put('/:id',upload.single('image'), async (req, res) => {
    try {
        const { status } = req.body;
        const image = req.file ? req.file.path : null;

        const deposit = await Deposit.findById(req.params.id);
        if (!deposit) return res.status(404).json({ message: 'Deposit not found' });

        // Update fields if provided in the request body
        if (image !== undefined) deposit.image = image;
        if (status !== undefined) deposit.status = status;

        const updatedDeposit = await deposit.save();
        res.status(200).json(updatedDeposit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE: Delete a deposit by ID
router.delete('/:id', async (req, res) => {
    try {
        const deposit = await Deposit.findByIdAndDelete(req.params.id);
        if (!deposit) return res.status(404).json({ message: 'Deposit not found' });
        res.status(200).json({ message: 'Deposit deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/approveuserajo/:id', async (req, res) => {
    try {
      const id = req.params.id; // Extract userId from the request parameters
      const { userId } = req.body; // Extract userId from the request body
  
      console.log('Request Params ID:', id);
      console.log('Request Body userId:', userId);
  
      // Retrieve the current period from the configuration
      const currentPeriodConfig = await Config.findOne({ key: "currentPeriod" });
      const currentPeriod = currentPeriodConfig ? currentPeriodConfig.value : null;
  
      console.log('Current Period:', currentPeriod);
  
      if (!currentPeriod) {
        return res.status(400).json({ error: 'Current period is not defined in the configuration.' });
      }
  
      // Find the user
      const user = await User.findById(userId);
      console.log('User found:', user);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update the deposit using userId and currentPeriod
      const updatedDeposit = await Deposit.findOneAndUpdate(
        { _id: id, currentPeriod: currentPeriod },
        { status: 'approved' },
        { new: true } // Return the updated document
      );
  
      console.log('Updated Deposit:', updatedDeposit);
  
      if (!updatedDeposit) {
        return res.status(404).json({ error: 'Deposit not found for the given user and period.' });
      }
     
      // Update the deposit using userId and currentPeriod
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId},
        { currentPeriod:currentPeriod,ajoStatus: 'approved' },
        { new: true } 
      );
      // Update the user's currentPeriod
      // user.currentPeriod = currentPeriod;
      // user.ajoStatus = "approved";
      // const updatedUser = await user.save(); // Save the user instance
  
      console.log('Updated User:', updatedUser);
  
      res.status(200).json({
        message: 'Deposit receipt approved successfully',
        deposit: updatedDeposit,
        user: updatedUser,
      });
    } catch (error) {
      console.error('Error approving user deposit:', error); // Log the full error for debugging
      res.status(500).json({ error: 'Failed to approve user deposit receipt', details: error.message });
    }
  });
  

  router.put('/approveregfee/:id', async (req, res) => {
    try {
      const id = req.params.id; // Extract deposit ID
      const { userId } = req.body;
  
      // Validate and fetch user
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      // Check if referring user exists
      const referringUser = await User.findOne({ referral: user.usedReferral });
      if (referringUser) {
        // Fetch or create referral data
        let existingReferral = await Referral.findOne({ userId: referringUser._id });
        const amountPerReferral = 500; // Constant amount per referral
  
        if (existingReferral) {
          // Update referral stats
          const updatedReferralledCount = existingReferral.referralledCount + 1;
          const newTotal = updatedReferralledCount * amountPerReferral;
  
          console.log(`Updating Referral - New Count: ${updatedReferralledCount}, New Total: ${newTotal}`);
  
          existingReferral = await Referral.findByIdAndUpdate(
            existingReferral._id,
            { referralledCount: updatedReferralledCount, amount: amountPerReferral, total: newTotal },
            { new: true }
          );
  
          // Update referring user's referral balance
          const referringUserDoc = await User.findById(referringUser._id);
          if (referringUserDoc) {
            referringUserDoc.referralBalance = newTotal;
            const savedUser = await referringUserDoc.save();
            console.log(`Updated User Referral Balance: ${savedUser.referralBalance}`);
          } else {
            console.error('Referring user not found.');
          }
        } else {
          // Create new referral data
          const initialReferralledCount = 1;
          const initialTotal = initialReferralledCount * amountPerReferral;
  
          console.log(`Creating New Referral - Count: ${initialReferralledCount}, Total: ${initialTotal}`);
  
          existingReferral = await Referral.create({
            userId: referringUser._id,
            referralledCount: initialReferralledCount,
            amount: amountPerReferral,
            total: initialTotal,
          });
  
          // Update referring user's referral balance
          const referringUserDoc = await User.findById(referringUser._id);
          if (referringUserDoc) {
            referringUserDoc.referralBalance = initialTotal;
            const savedUser = await referringUserDoc.save();
            console.log(`Updated User Referral Balance: ${savedUser.referralBalance}`);
          } else {
            console.error('Referring user not found.');
          }
        }
      } else {
        return res.status(400).json({ message: 'Invalid referral code' });
      }
  
      // Approve the deposit
      const updatedDeposit = await Deposit.findOneAndUpdate(
        { _id: id },
        { status: 'approved' },
        { new: true }
      );
  
      if (!updatedDeposit) {
        return res.status(404).json({ error: 'Deposit not found for the given user and period.' });
      }
  
      // Update user status
      user.status = 'approved';
      const updatedUser = await user.save(); // Initialize `updatedUser` properly here
  
      console.log(`Approved Registration Fee for User: ${JSON.stringify(updatedUser)}`);
  
      res.status(200).json({
        message: 'Deposit receipt approved successfully',
        deposit: updatedDeposit,
      });
    } catch (error) {
      console.error('Error approving registration fee:', error);
      res.status(500).json({
        error: 'Failed to approve user deposit receipt',
        details: error.message,
      });
    }
  });
  
  

  router.put('/rejectuserajo/:id', async (req, res) => {
    try {
      const userId = req.params.id; // Extract userId from the request parameters
      const { notes } = req.body;
  
      // Retrieve the current period from the configuration
      const currentPeriodConfig = await Config.findOne({ key: "currentPeriod" });
      const currentPeriod = currentPeriodConfig.value;

      if (!currentPeriod) {
        return res.status(400).json({ error: 'Current period is not defined in the configuration.' });
      }
      console.log(`the code reaches here`);
      // Update the deposit using userId and currentPeriod
      const updatedDeposit = await Deposit.findOneAndUpdate(
        { _id: userId, currentPeriod: currentPeriodConfig.value },
        { status: 'declined' ,notes:notes},
        { new: true } // Return the updated document
      );
  
      if (!updatedDeposit) {
        return res.status(404).json({ error: 'Deposit not found for the given user and period.' });
      }
  
      res.status(200).json({ message: 'Deposit receipt approved successfully', deposit: updatedDeposit });
    } catch (error) {
      res.status(500).json({ error: 'Failed to approve user Deposit receipt', details: error.message });
    }
  });

  router.put('/rejectregfee/:id', async (req, res) => {
    try {
      const id = req.params.id; // Extract userId from the request parameters
      const { notes , userId} = req.body;
      

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
     
  
      // Update the deposit using userId and currentPeriod
      const updatedDeposit = await Deposit.findOneAndUpdate(
        { _id: id, currentPeriod: "Reg Fee" },
        { status: 'declined' , notes:notes},
        { new: true } // Return the updated document
      );
  
      if (!updatedDeposit) {
        return res.status(404).json({ error: 'Deposit not found for the given user and period.' });
      }

      user.status = "declined";

      const updatedUser = await user.save();
  
      res.status(200).json({ message: 'Deposit receipt approved successfully', deposit: updatedDeposit });
    } catch (error) {
      res.status(500).json({ error: 'Failed to approve user Deposit receipt', details: error.message });
    }
  });

  router.get("/getdeposited/receipt/:id", async (req, res) => {  
    try {
        const userId = req.params.id;
        const deposits = await Deposit.findOne({ userId , currentPeriod: "Reg Fee" });
        res.status(200).json(deposits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } }
  );

  router.patch("/updateddeposited/receipt/:id",upload.single('image'), async (req, res) => {  
    try {
        const userId = req.params.id;
        const updatedImage = req.file ? req.file.path : null;

      const updatedDeposit = await Deposit.findOneAndUpdate(
        { userId: userId, currentPeriod: "Reg Fee" },
        { status: 'pending' ,image:updatedImage},
        { new: true } // Return the updated document
      );
  
      if (!updatedDeposit) {
        return res.status(404).json({ error: 'Deposit not found for the given' });
      }else{
        res.status(200).json({ message: 'Deposit receipt updated successfully', deposit: updatedDeposit });
      }

    } catch (error) {
        res.status(500).json({ message: error.message });
    } 
  });

  router.patch("/updateddepositedajo/receipt/:id",upload.single('image'), async (req, res) => {  
    try {
        const userId = req.params.id;
        const updatedImage = req.file ? req.file.path : null;
      
        // Retrieve the current period from the configuration
      const currentPeriodConfig = await Config.findOne({ key: "currentPeriod" });
      const currentPeriod = currentPeriodConfig.value;

      if (!currentPeriod) {
        return res.status(400).json({ error: 'Current period is not defined in the configuration.' });
      }
               
      const updatedDeposit = await Deposit.findOneAndUpdate(
        { userId: userId, currentPeriod:currentPeriod },
        { status: 'pending' ,image:updatedImage},
        { new: true } // Return the updated document
      );
  
      if (!updatedDeposit) {
        return res.status(404).json({ error: 'Deposit not found for the given period' });
      }else{
        res.status(200).json({ message: 'Deposit receipt updated successfully', deposit: updatedDeposit });
      }

    } catch (error) {
        res.status(500).json({ message: error.message });
    } 
  });

  router.get("/getdepositedajo/receipt/:id", async (req, res) => {  
       
     // Retrieve the current period from the configuration
     const currentPeriodConfig = await Config.findOne({ key: "currentPeriod" });
     const currentPeriod = currentPeriodConfig.value;

     if (!currentPeriod) {
       return res.status(400).json({ error: 'Current period is not defined in the configuration.' });
     }

    try {
        const userId = req.params.id;
        const deposits = await Deposit.findOne({ userId , currentPeriod: currentPeriod});
        res.status(200).json(deposits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } }
  );



module.exports = router;
