import Food from '../models/Food.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// add food item
const addFood = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const image_filename = `${req.file.filename}`;

    const food = new Food({
      name,
      description,
      price,
      category,
      image: image_filename,
    });

    await food.save();
    res.status(201).json({ success: true, message: "Food added successfully", food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// list all food
const listFood = async (req, res) => {
  try {
    const foods = await Food.find({});
    res.status(200).json({ success: true, data: foods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// remove food item
const removeFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (food && food.image) {
      fs.unlink(path.join(__dirname, '..', 'uploads', food.image), () => {});
    }
    await Food.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Food removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export { addFood, listFood, removeFood }