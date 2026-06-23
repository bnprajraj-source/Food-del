import './Orders.css'
import { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'

const Orders = () => {
  const url = import.meta.env.VITE_API_URL
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/api/orders`)
      if (response.data.success) {
        setOrders(response.data.data || response.data.orders || [])
      } else {
        toast.error(response.data.message || 'Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error(error.response?.data?.message || error.message || 'Error fetching orders')
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders()
  }, [fetchOrders])

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`${url}/api/orders/${orderId}`, {
        status: newStatus
      })
      if (response.data.success) {
        toast.success('Order status updated')
        fetchOrders()
      }
    } catch {
      toast.error('Error updating order status')
    }
  }

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  if (loading) {
    return <div className="orders"><p>Loading...</p></div>
  }

  const statusOptions = ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled']

  return (
    <div className="orders">
      <div className="orders-header">
        <h2>Orders</h2>
        <p className="order-count">Total Orders: {orders.length}</p>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header" onClick={() => toggleOrderDetails(order._id)}>
                <div className="order-info">
                  <p className="order-id">Order #{order._id?.substring(0, 8) || 'N/A'}</p>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="order-amount">
                  <p>₹{order.totalAmount}</p>
                </div>
                <span className={`status ${(order.status || 'pending').toLowerCase().replace(/ /g, '-')}`}>
                  {order.status || 'Unknown'}
                </span>
                <span className="expand-icon">
                  {expandedOrder === order._id ? '▼' : '▶'}
                </span>
              </div>

              {expandedOrder === order._id && (
                <div className="order-details">
                  <div className="details-section">
                    <h4>Delivery Address</h4>
                    {order.deliveryAddress ? (
                      <>
                        <p>{order.deliveryAddress.street}</p>
                        <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
                      </>
                    ) : (
                      <p>No address provided</p>
                    )}
                    <p>Phone: {order.phone}</p>
                  </div>

                  <div className="details-section">
                    <h4>Items</h4>
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(order.items || []).map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.foodId?.name || 'Unknown Item'}</td>
                            <td>{item.quantity}</td>
                            <td>₹{item.price}</td>
                            <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="details-section">
                    <h4>Order Details</h4>
                    <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                    <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
                    <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
                  </div>

                  <div className="details-section">
                    <h4>Update Status</h4>
                    <select 
                      value={order.status} 
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className="status-select"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders
