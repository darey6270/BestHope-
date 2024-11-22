const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoute = require("./routes/userRoute");
const errorHandler = require("./middleWare/errorMiddleware");
const cookieParser = require("cookie-parser");
const path = require("path");
const referralRoutes = require('./routes/referralRoute');
const randomRoutes = require('./routes/randomRoute');
const userReferralRoutes = require("./routes/userReferralRoute");
const selectedUserRoutes = require('./routes/selectedUserRoute');
const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes Middleware
app.use("/api/users", userRoute);
app.use('/api/withdrawals', require('./controllers/withdrawalController'));
app.use('/api/accounts', require('./controllers/accountController'));
app.use('/api/deposits', require('./controllers/depositControlller'));
app.use('/api/posters', require('./controllers/posterController'));
app.use('/api/referrals', referralRoutes);
app.use('/api/randoms', randomRoutes);
app.use("/api/user-referrals", userReferralRoutes);
app.use('/api/selectedUsers', selectedUserRoutes);


// Routes
app.get("/", (req, res) => {
  res.send("Home Page");
});

// Error Middleware
app.use(errorHandler);
// Connect to DB and start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI).then(() => {
    app.listen(PORT, () => {
      console.log(`Server Running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));