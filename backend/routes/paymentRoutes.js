import express from 'express';
import Order from '../models/Order.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Process payment (mock implementation)
router.post('/process', authenticate, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID required' });
    }

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Mock payment processing
    const transactionId = `TXN${Date.now()}`;

    // Update order with payment info
    order.paymentStatus = 'Completed';
    order.transactionId = transactionId;
    order.status = 'Confirmed';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      transactionId,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get payment history
router.get('/history', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .select('totalAmount paymentStatus createdAt status transactionId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify payment (authenticated)
router.get('/verify/:transactionId', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({ transactionId: req.params.transactionId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.status(200).json({
      success: true,
      paymentStatus: order.paymentStatus,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Refund payment
router.post('/refund', authenticate, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Order is not paid' });
    }

    order.paymentStatus = 'Refunded';
    order.status = 'Cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
