
// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const cors = require("cors");
// const rateLimit = require("express-rate-limit");
// const dbconnection = require('./model/dbconnection')


// //db connection
// dbconnection();

// const app = express();
// app.use(express.json());
// app.use(cors());

// // Rate Limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: "Too many requests, please try again later."
// });
// app.use(limiter);




// // User Schema
// const UserSchema = new mongoose.Schema({
//   username: String,
//   email: String,
//   password: String,
//   bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }]
// });
// const User = mongoose.model("UserSchema", UserSchema);

// // Video Schema
// const VideoSchema = new mongoose.Schema({
//   title: String,
//   category: String,
//   url: String,
//   duration: String,
//   difficulty : String,
//   views : String,
//   reviews: [{ user: String, rating: Number, comment: String }]
// });
// const Video = mongoose.model("Video", VideoSchema);

// // Register
// app.post("/register", async (req, res) => {
//   const { username, email, password } = req.body;
//   const hashedPassword = await bcrypt.hash(password, 10);
//   const newUser = new User({ username, email, password: hashedPassword });
//   await newUser.save();
//   res.json({ message: "User registered successfully" });
// });

// // Login
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });
//   if (!user || !(await bcrypt.compare(password, user.password))) {
//     return res.status(401).json({ message: "Invalid credentials" });
//   }
//   const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "5h" });
//   res.json({ token });
// });

// // Middleware for Authentication
// const auth = (req, res, next) => {
//   const token = req.header("Authorization");
//   if (!token) return res.status(401).json({ message: "Access denied" });
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch {
//     res.status(400).json({ message: "Invalid token" });
//   }
// };

// // Video Search & Filter get
// app.get("/videos", async (req, res) => {
//   const { category, title } = req.query;
//   const filter = {};
//   if (category) filter.category = category;
//   if (title) filter.title = new RegExp(title, "i");
//   const videos = await Video.find(filter);
//   res.json(videos);
// });


// // Add Review & Rating post 
// app.post("/videos/:id/review", auth, async (req, res) => {
//   const { rating, comment } = req.body;
//   const video = await Video.findById(req.params.id);
//   if (!video) return res.status(404).json({ message: "Video not found" });
//   video.reviews.push({ user: req.user.userId, rating, comment });
//   await video.save();
//   res.json({ message: "Review added" });
// });


// // Add a New Video (Public Access)
// app.post("/videos", async (req, res) => {
//   const { title, category, url, duration, difficulty, views } = req.body;
//   try {
//     const video = new Video({ title, category, url, duration, difficulty, views, reviews: [] });
//     await video.save();
//     res.json({ message: "Video added successfully", video });
//   } catch (error) {
//     res.status(500).json({ message: "Error adding video", error });
//   }
// });



// // Bookmark a Video
// app.post("/bookmark/:videoId", auth, async (req, res) => {
//   const user = await User.findById(req.user.userId);
//   if (!user) return res.status(404).json({ message: "User not found" });
//   if (!user.bookmarks.includes(req.params.videoId)) {
//     user.bookmarks.push(req.params.videoId);
//     await user.save();
//   }
//   res.json({ message: "Video bookmarked" });
// });

// // Get Bookmarked Videos
// app.get("/bookmarks", auth, async (req, res) => {
//   const user = await User.findById(req.user.userId).populate("bookmarks");
//   res.json(user.bookmarks);
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const dbconnection = require('./model/dbconnection');

// DB connection
dbconnection();

const app = express();
app.use(express.json());
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later."
});
app.use(limiter);

// User Schema
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }]
});
const User = mongoose.model("User", UserSchema);

// Video Schema
const VideoSchema = new mongoose.Schema({
  title: String,
  category: String,
  url: String,
  duration: String,
  difficulty: String,
  views: String,
  reviews: [{ user: String, rating: Number, comment: String }]
});
const Video = mongoose.model("Video", VideoSchema);

// Register
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();
  res.json({ message: "User registered successfully" });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "5h" });
  res.json({ token });
});

// Authentication Middleware
const auth = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access denied" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(400).json({ message: "Invalid token" });
  }
};

// Get Videos (Protected)
app.get("/videos",  async (req, res) => {
  const { category, title } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (title) filter.title = new RegExp(title, "i");
  const videos = await Video.find(filter);
  res.json(videos);
});



// Add Review & Rating (Protected)
app.post("/videos/:id/review", auth, async (req, res) => {
  const { rating, comment } = req.body;
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ message: "Video not found" });
  video.reviews.push({ user: req.user.userId, rating, comment });
  await video.save();
  res.json({ message: "Review added" });
});

// Add a New Video (Protected)
app.post("/videos", auth, async (req, res) => {
  const { title, category, url, duration, difficulty, views } = req.body;
  try {
    const video = new Video({ title, category, url, duration, difficulty, views, reviews: [] });
    await video.save();
    res.json({ message: "Video added successfully", video });
  } catch (error) {
    res.status(500).json({ message: "Error adding video", error });
  }
});

// Bookmark a Video (Protected)
app.post("/bookmark/:videoId", auth, async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (!user.bookmarks.includes(req.params.videoId)) {
    user.bookmarks.push(req.params.videoId);
    await user.save();
  }
  res.json({ message: "Video bookmarked" });
});

// Get Bookmarked Videos (Protected)
app.get("/bookmarks", auth, async (req, res) => {
  const user = await User.findById(req.user.userId).populate("bookmarks");
  res.json(user.bookmarks);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

