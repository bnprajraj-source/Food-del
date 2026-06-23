import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDB } from './config/db.js'
import userRoutes from './routes/userRoutes.js'
import foodRoutes from './routes/foodRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// app config
const app = express()
const port = 4000

// middlewares
app.use(express.json())
app.use(express.urlencoded({ limit: '16mb', extended: true }))
app.use(cors())

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Food Delivery API is running',
    timestamp: new Date().toISOString(),
  })
})

// Serving static files (Food Images)
app.use('/images', express.static(path.join(__dirname, 'uploads')))

// API Routes
app.use('/api/users', userRoutes)
app.use('/api/foods', foodRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/payments', paymentRoutes)

// API Documentation
app.get('/api/docs', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Food Delivery API Documentation',
    version: '1.0.0',
    endpoints: {
      users: {
        register: 'POST /api/users/register',
        login: 'POST /api/users/login',
        profile: 'GET /api/users/profile/:id',
        updateProfile: 'PUT /api/users/profile/:id',
      },
      foods: {
        getAll: 'GET /api/foods/list',
        getByCategory: 'GET /api/foods/category/:category',
        getById: 'GET /api/foods/:id',
        addFood: 'POST /api/foods',
        updateFood: 'PUT /api/foods/:id',
        deleteFood: 'DELETE /api/foods/:id',
      },
      cart: {
        getCart: 'GET /api/cart',
        addToCart: 'POST /api/cart/add',
        removeFromCart: 'POST /api/cart/remove/:foodId',
        updateQuantity: 'PUT /api/cart/update/:foodId',
        clearCart: 'DELETE /api/cart/clear',
      },
      orders: {
        createOrder: 'POST /api/orders',
        getAll: 'GET /api/orders',
        getUserOrders: 'GET /api/orders/user/:userId',
        getById: 'GET /api/orders/:id',
        updateStatus: 'PUT /api/orders/:id',
        cancelOrder: 'PATCH /api/orders/:id/cancel',
      },
    },
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  })
})

// db connection
connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server started on http://localhost:${port}`)
        })
    })
    .catch((error) => {
        console.error("Failed to start server:", error)
        process.exit(1)
    })