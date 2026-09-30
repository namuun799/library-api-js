import express from "express";

const app = express();
const PORT = 3001;

app.get("/", (req, res) => {
  res.json({
    message: "Library API",
    version: "1.0.0"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime()
  });
});

app.get("/profile", (req, res) => {
  res.json({
    name: "Bat",
    role: "USER",
    email: "bat@example.com"
  });
});

app.get("/books/:id", (req, res) => {
  const id = Number(req.params.id);

  res.json({
    id,
    title: "Node.js Basics"
  });
});

app.get("/about", (req, res) => {
  res.status(200).json({
    name: "library-api-js",
    version: "1.0.0",
    author: "Өөрийн нэр"
  });
});

app.get("/students", (req, res) => {
  res.status(200).json([
    { id: 1, name: "Оюутан 1" },
    { id: 2, name: "Оюутан 2" },
    { id: 3, name: "Оюутан 3" }
  ]);
});

app.get("/courses", (req, res) => {
  res.status(200).json([
    { id: 1, name: "Хичээл 1" },
    { id: 2, name: "Хичээл 2" }
  ]);
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});