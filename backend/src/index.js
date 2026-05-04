const express = require("express");
require('dotenv').config();

const app = express();

const cors = require('cors');

app.use(cors());

app.use(express.json());

// Routes
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

const PORT = process.env.PORT || 3000;

app.get("/test", (req, res) => {
  console.log("TEST API HIT");
  res.send("OK");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

