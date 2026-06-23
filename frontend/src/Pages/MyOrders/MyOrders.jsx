import { useContext, useEffect, useState, useCallback } from 'react'
import './MyOrders.css'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import axios from 'axios'

const MyOrders = () => {

  const { url, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;

      const response = await axios.get(url + `/api/orders/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.log("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [url, token]);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, [token, navigate, fetchOrders]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Confirmed': return 'status-confirmed';
      case 'Out for Delivery': return 'status-transit';
      case 'Delivered': return 'status-delivered';
      case 'Cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  if (loading) {
    return (
      <div className='my-orders'>
        <div className="my-orders-loading">
          <div className="spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className='my-orders'>
        <div className="my-orders-empty">
          <h2>No orders yet</h2>
          <p>When you place an order, it will appear here.</p>
          <button onClick={() => navigate('/')}>BROWSE MENU</button>
        </div>
      </div>
    );
  }

  return (
    <div className='my-orders'>
      <h2>My Orders</h2>
      <div className="my-orders-list">
        {orders.map((order) => (
          <div key={order._id} className='my-orders-item'>
            <div className="my-orders-item-header">
              <div className="my-orders-parcel">
                <img src={assets.parcel_icon} alt="" />
              </div>
              <div className="my-orders-item-info">
                {order.items.map((item, idx) => (
                  <p key={idx} className='my-orders-item-name'>
                    {item.foodId?.name || "Food Item"} x{item.quantity}
                    {idx < order.items.length - 1 ? ", " : ""}
                  </p>
                ))}
              </div>
              <p className="my-orders-item-amount">₹{order.totalAmount}</p>
            </div>
            <div className="my-orders-item-bottom">
              <p className="my-orders-date">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}
              </p>
              <p className={`my-orders-status ${getStatusClass(order.status)}`}>
                {order.status}
              </p>
              <p className="my-orders-payment">
                {order.paymentStatus === "Completed" ? "Paid" : "Pending"}
              </p>
              <button
                className="my-orders-track-btn"
                onClick={() => navigate(`/order/${order._id}`)}
              >
                Track Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyOrders
