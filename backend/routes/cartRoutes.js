import express from 'express';
import Cart from '../models/Cart.js';
import Food from '../models/Food.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get cart
router.get('/', authenticate, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.userId }).populate('items.foodId');

    if (!cart) {
      cart = await Cart.create({ userId: req.userId, items: [] });
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add item to cart
router.post('/add', authenticate, async (req, res) => {
  try {
    const { foodId, quantity } = req.body;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }

    let cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      cart = await Cart.create({
        userId: req.userId,
        items: [
          {
            foodId,
            name: food.name,
            price: food.price,
            quantity,
            image: food.image,
          },
        ],
        totalPrice: food.price * quantity,
      });
    } else {
      const existingItem = cart.items.find((item) => item.foodId.toString() === foodId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          foodId,
          name: food.name,
          price: food.price,
          quantity,
          image: food.image,
        });
      }

      // Recalculate total price
      cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove item from cart
router.post('/remove/:foodId', authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item.foodId.toString() !== req.params.foodId);
    cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update quantity
router.put('/update/:foodId', authenticate, async (req, res) => {
  try {
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find((item) => item.foodId.toString() === req.params.foodId);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.foodId.toString() !== req.params.foodId);
    } else {
      item.quantity = quantity;
    }

    cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Clear cart
router.delete('/clear', authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
