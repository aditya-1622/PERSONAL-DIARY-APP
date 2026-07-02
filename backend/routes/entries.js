import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const entriesFilePath = path.join(__dirname, "../data/entries.json");

function readEntries() {
  const data = fs.readFileSync(entriesFilePath, "utf-8");
  return JSON.parse(data);
}

function writeEntries(entries) {
  fs.writeFileSync(entriesFilePath, JSON.stringify(entries, null, 2));
}

// Sab routes yahan se protected hain (token chahiye)
router.use(authMiddleware);

// ===== GET all entries (sirf logged-in user ki) =====
router.get("/", (req, res) => {
  const entries = readEntries();
  const userEntries = entries.filter((e) => e.userId === req.userId);
  res.json(userEntries);
});

// ===== CREATE entry =====
router.post("/", (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  const entries = readEntries();

  const newEntry = {
    id: Date.now().toString(),
    userId: req.userId,
    title,
    content,
    createdAt: new Date().toISOString(),
  };

  entries.push(newEntry);
  writeEntries(entries);

  res.status(201).json(newEntry);
});

// ===== UPDATE entry =====
router.put("/:id", (req, res) => {
  const { title, content } = req.body;
  const entries = readEntries();

  const index = entries.findIndex(
    (e) => e.id === req.params.id && e.userId === req.userId
  );

  if (index === -1) {
    return res.status(404).json({ message: "Entry not found" });
  }

  entries[index].title = title || entries[index].title;
  entries[index].content = content || entries[index].content;

  writeEntries(entries);
  res.json(entries[index]);
});

// ===== DELETE entry =====
router.delete("/:id", (req, res) => {
  const entries = readEntries();

  const index = entries.findIndex(
    (e) => e.id === req.params.id && e.userId === req.userId
  );

  if (index === -1) {
    return res.status(404).json({ message: "Entry not found" });
  }

  entries.splice(index, 1);
  writeEntries(entries);

  res.json({ message: "Entry deleted" });
});

export default router;