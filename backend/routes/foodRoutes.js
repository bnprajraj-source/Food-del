import express from 'express';
import Food from '../models/Food.js';
import multer from 'multer';
import { addFood, listFood, removeFood } from '../controllers/foodController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

const foodRouter = express.Router();

// Get all foods
foodRouter.get('/list', listFood);

// Get foods by category
foodRouter.get('/category/:category', async (req, res) => {
  try {
    const foods = await Food.find({ category: req.params.category });
    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get food by ID
foodRouter.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }

    res.status(200).json({
      success: true,
      food,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add new food (Admin only)
foodRouter.post('/', authenticate, authorize(['admin']), upload.single('image'), addFood);

// Update food (Admin only)
foodRouter.put('/:id', authenticate, authorize(['admin']), upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const food = await Food.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Food updated successfully',
      food,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete food (Admin only)
foodRouter.delete('/:id', authenticate, authorize(['admin']), removeFood);

export default foodRouter;
