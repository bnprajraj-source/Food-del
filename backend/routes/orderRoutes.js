import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create new order
router.post('/', authenticate, async (req, res) => {
  try {
    const { items, totalAmount, deliveryAddress, phone, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    const order = await Order.create({
      userId: req.userId,
      items,
      totalAmount,
      deliveryAddress,
      phone,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Place Order (Stripe Checkout or Mock Payment)
router.post('/place', authenticate, async (req, res) => {
  const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";
  try {
    const { items, amount, address, phone, paymentMethod } = req.body;
    const userId = req.userId;

    const newOrder = new Order({
      userId,
      items,
      totalAmount: amount,
      deliveryAddress: address,
      phone,
      paymentMethod: paymentMethod || "Cash on Delivery"
    });
    await newOrder.save();

    await Cart.findOneAndUpdate({ userId }, { items: [], totalPrice: 0 });

    if (!process.env.STRIPE_SECRET_KEY) {
      await Order.findByIdAndUpdate(newOrder._id, { paymentStatus: "Completed", status: "Confirmed" });
      return res.json({ success: true, session_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}` });
    }

    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: { name: item.name || "Food Item" },
        unit_amount: item.price * 100
      },
      quantity: item.quantity
    }));

    line_items.push({
      price_data: {
        currency: "inr",
        product_data: { name: "Delivery Charges" },
        unit_amount: 200
      },
      quantity: 1
    });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify Payment
router.post('/verify', authenticate, async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true" || success === true) {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "Completed", status: "Confirmed" });
      res.json({ success: true, message: "Payment Successful" });
    } else {
      await Order.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all orders (Admin only)
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const orders = await Order.find().populate('userId').populate('items.foodId').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get orders by user ID (ownership check)
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden: cannot view other users\' orders' });
    }

    const orders = await Order.find({ userId: req.params.userId }).populate('items.foodId').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get order by ID (ownership check)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId').populate('items.foodId');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId._id.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden: cannot view this order' });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update order status (Admin only)
router.put('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { status, paymentStatus, transactionId } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, paymentStatus, transactionId },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel order (ownership check)
router.patch('/:id/cancel', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden: cannot cancel this order' });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled' });
    }

    if (order.status === 'Delivered') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a delivered order' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
