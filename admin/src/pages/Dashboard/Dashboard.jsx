import './Dashboard.css'
import { useEffect, useState, useCallback } from 'react'
import { assets } from '../../assets/assets'
import axios from 'axios'

const Dashboard = () => {
  const url = import.meta.env.VITE_API_URL
  const [stats, setStats] = useState({
    totalFoods: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    try {
      const [foodsRes, ordersRes] = await Promise.all([
        axios.get(`${url}/api/foods/list`),
        axios.get(`${url}/api/orders`)
      ])

      const foods = foodsRes.data.success ? foodsRes.data.data || [] : []
      const orders = ordersRes.data.success ? (ordersRes.data.data || ordersRes.data.orders || []) : []

      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      const pendingOrders = orders.filter(order => order.status === 'Pending').length

      setStats({
        totalFoods: foods.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders
      })

      setRecentOrders(orders.slice(-5).reverse())
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData()
  }, [fetchDashboardData])

  if (loading) {
    return <div className="dashboard"><p>Loading...</p></div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <img src={assets.parcel_icon} alt="" />
          </div>
          <div className="stat-info">
            <h3>{stats.totalFoods}</h3>
            <p>Total Food Items</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <img src={assets.order_icon} alt="" />
          </div>
          <div className="stat-info">
            <h3>{stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <span>₹</span>
          </div>
          <div className="stat-info">
            <h3>₹{stats.totalRevenue.toFixed(2)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <span>!</span>
          </div>
          <div className="stat-info">
            <h3>{stats.pendingOrders}</h3>
            <p>Pending Orders</p>
          </div>
        </div>
      </div>

      <div className="recent-orders">
        <h3>Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p className="no-recent">No recent orders</p>
        ) : (
          <div className="recent-orders-list">
            {recentOrders.map((order) => (
              <div key={order._id} className="recent-order-item">
                <div className="recent-order-info">
                  <p className="recent-order-id">#{order._id?.substring(0, 8) || 'N/A'}</p>
                  <p className="recent-order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="recent-order-details">
                  <p className="recent-order-items">{order.items?.length || 0} items</p>
                  <p className="recent-order-amount">₹{order.totalAmount}</p>
                </div>
                <span className={`recent-order-status ${(order.status || 'pending').toLowerCase().replace(/ /g, '-')}`}>
                  {order.status || 'Unknown'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
