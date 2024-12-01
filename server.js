const dotenv = require("dotenv").config();
const express = require("express");
const session = require('express-session');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const { Server } = require("socket.io");

const userRoute = require("./routes/userRoute");
const referralRoutes = require('./routes/referralRoute');
const randomRoutes = require('./routes/randomRoute');
const userReferralRoutes = require("./routes/userReferralRoute");
const selectedUserRoutes = require('./routes/selectedUserRoute');
const Chat=require("./models/Chat");
const UnpaidSelectedUser = require("./models/unpaidSelectedUserModel");

const app = express();
const http = require("http").createServer(app);
const io = new Server(http, { cors: { origin: "*" } });

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Session setup
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

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
app.use('/api/socials', require('./controllers/socialController'));
app.use('/api/unpaidSelectedUsers', UnpaidSelectedUser);


// Socket.IO Events
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a specific chat room
  socket.on("joinRoom", (chatId) => {
    socket.join(chatId);
    console.log(`User joined room: ${chatId}`);
  });

  // Handle sending messages
  socket.on("sendMessage", async (data) => {
    const { chatId, sender, text } = data;

    // Save the message to MongoDB
    const message = new Chat({ chatId, sender, text });
    await message.save();

    // Emit the message to all users in the chat room
    io.to(chatId).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Routes
app.get("/", (req, res) => {
  res.send("Home Page");
});


// Connect to DB and start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI).then(() => {
    http.listen(PORT, () => {
      console.log(`Server Running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
