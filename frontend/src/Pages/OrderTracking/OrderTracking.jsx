import { useContext, useEffect, useState, useCallback } from 'react'
import './OrderTracking.css'
import { StoreContext } from '../../Context/StoreContext'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const statusSteps = ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered'];

const OrderTracking = () => {

  const { id } = useParams();
  const { url, token } = useContext(StoreContext);
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const response = await axios.get(url + `/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setOrder(response.data.order);
      }
    } catch (error) {
      console.log("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  }, [url, token, id]);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrder();
  }, [token, navigate, fetchOrder]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      const response = await axios.patch(url + `/api/orders/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setOrder(prev => ({ ...prev, status: 'Cancelled' }));
      }
      } catch {
      alert("Error cancelling order");
    } finally {
      setCancelling(false);
    }
  };

  const getStepIndex = (status) => {
    const idx = statusSteps.indexOf(status);
    return idx >= 0 ? idx : -1;
  };

  if (loading) {
    return (
      <div className='order-tracking'>
        <div className="order-tracking-loading">
          <div className="spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className='order-tracking'>
        <div className="order-tracking-empty">
          <h2>Order not found</h2>
          <button onClick={() => navigate('/myorders')}>BACK TO ORDERS</button>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'Cancelled';
  const isDelivered = order.status === 'Delivered';
  const canCancel = !isCancelled && !isDelivered;

  return (
    <div className='order-tracking'>
      <h2>Order Tracking</h2>

      <div className="tracking-card">
        <div className="tracking-header">
          <div>
            <p className="tracking-order-id">Order #{order._id.substring(0, 8)}</p>
            <p className="tracking-date">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          <p className={`tracking-status ${isCancelled ? 'status-cancelled' : isDelivered ? 'status-delivered' : ''}`}>
            {order.status}
          </p>
        </div>

        {!isCancelled && (
          <div className="tracking-progress">
            {statusSteps.map((step, idx) => (
              <div key={step} className={`tracking-step ${idx <= currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}>
                <div className="step-dot">
                  {idx < currentStep ? '✓' : idx === currentStep ? '●' : '○'}
                </div>
                <p className="step-label">{step}</p>
                {idx < statusSteps.length - 1 && <div className={`step-line ${idx < currentStep ? 'filled' : ''}`}></div>}
              </div>
            ))}
          </div>
        )}

        {isCancelled && (
          <div className="tracking-cancelled-banner">
            <p>This order has been cancelled.</p>
          </div>
        )}
      </div>

      <div className="tracking-details-grid">
        <div className="tracking-detail-card">
          <h4>Items Ordered</h4>
          {order.items.map((item, idx) => (
            <div key={idx} className="tracking-item">
              <p className="tracking-item-name">{item.foodId?.name || 'Food Item'} x{item.quantity}</p>
              <p className="tracking-item-price">₹{item.price * item.quantity}</p>
            </div>
          ))}
          <hr />
          <div className="tracking-item">
            <p className="tracking-item-name"><b>Delivery Fee</b></p>
            <p className="tracking-item-price">₹2</p>
          </div>
          <div className="tracking-item">
            <p className="tracking-item-name"><b>Total</b></p>
            <p className="tracking-item-price"><b>₹{order.totalAmount}</b></p>
          </div>
        </div>

        <div className="tracking-detail-card">
          <h4>Delivery Address</h4>
          {order.deliveryAddress ? (
            <>
              <p>{order.deliveryAddress.street}</p>
              <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
              <p>{order.deliveryAddress.country}</p>
            </>
          ) : (
            <p>No address provided</p>
          )}
        </div>

        <div className="tracking-detail-card">
          <h4>Payment Info</h4>
          <p><strong>Method:</strong> {order.paymentMethod}</p>
          <p><strong>Status:</strong> <span className={order.paymentStatus === 'Completed' ? 'paid' : 'unpaid'}>{order.paymentStatus}</span></p>
          <p><strong>Phone:</strong> {order.phone}</p>
        </div>
      </div>

      {canCancel && (
        <div className="tracking-actions">
          <button className="cancel-order-btn" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? "CANCELLING..." : "CANCEL ORDER"}
          </button>
        </div>
      )}
    </div>
  )
}

export default OrderTracking
