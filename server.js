import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  "http://localhost:3000", // Development
  "https://razi.iqsoft.in", // Production
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.json()); // Allow JSON data parsing

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/";
mongoose
  .connect(`${MONGO_URI}data`, { // Append database name
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Define Schema
const ImageSchema = new mongoose.Schema({
  imageUrl: String,
  title: String,
  description: String,
  locateUsUrl: String,
  applyNowUrl: String,
  applyNowButtonName: String,
});

// Define Model (Collection: details)
const Image = mongoose.model("Image", ImageSchema, "details");

// Route to fetch all images
app.get("/api/images", async (req, res) => {
  try {
    const images = await Image.find();
    if (!images.length) {
      return res.status(404).json({ error: "No images found" });
    }
    res.json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

// Route to search images by title
app.get("/api/search", async (req, res) => {
  try {
    const query = req.query.q; // Get search term from frontend

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // Find titles that match the search (case insensitive)
    const results = await Image.find({
      title: { $regex: query, $options: "i" },
    }).sort({ title: 1 }); // Sort alphabetically

    res.json(results);
  } catch (error) {
    console.error("Error fetching search results:", error);
    res.status(500).json({ error: "Failed to fetch search results" });
  }
});

// Route to get a single image by ID
app.get("/api/images/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }
    res.json(image);
  } catch (error) {
    console.error("Error fetching image details:", error);
    res.status(500).json({ error: "Failed to fetch image details" });
  }
});

// Define Banner Schema
const BannerSchema = new mongoose.Schema({
  imageUrl: String, // URL of the banner image
});

// Define Model (Collection: banners)
const Banner = mongoose.model("Banner", BannerSchema, "banners");

// Route to fetch all banners
app.get("/api/banners", async (req, res) => {
  try {
    const banners = await Banner.find();
    if (!banners.length) {
      return res.status(404).json({ error: "No banners found" });
    }
    res.json(banners);
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ error: "Failed to fetch banners" });
  }
});


// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
