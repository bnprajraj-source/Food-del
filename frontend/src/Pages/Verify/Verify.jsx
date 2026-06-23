import { useContext, useEffect, useState, useCallback } from 'react'
import './Verify.css'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'

const Verify = () => {

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { url, token } = useContext(StoreContext);
  const [status, setStatus] = useState("verifying");

  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");

  const verifyPayment = useCallback(async () => {
    try {
      const response = await axios.post(url + "/api/orders/verify", {
        orderId,
        success
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStatus("success");
      } else {
        setStatus("failed");
      }
    } catch {
      setStatus("failed");
    }
  }, [url, token, orderId, success]);

  useEffect(() => {
    if (orderId && success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      verifyPayment();
    } else {
      setStatus("failed");
    }
  }, [orderId, success, verifyPayment]);

  return (
    <div className='verify'>
      {status === "verifying" && (
        <div className="verify-spinner">
          <div className="spinner"></div>
          <p>Verifying your payment...</p>
        </div>
      )}
      {status === "success" && (
        <div className="verify-result">
          <div className="verify-icon success">&#10003;</div>
          <h2>Payment Successful!</h2>
          <p>Your order has been placed successfully.</p>
          <p className="verify-order-id">Order ID: {orderId}</p>
          <button onClick={() => navigate('/')}>BACK TO HOME</button>
        </div>
      )}
      {status === "failed" && (
        <div className="verify-result">
          <div className="verify-icon failed">&#10007;</div>
          <h2>Payment Failed</h2>
          <p>Something went wrong with your payment.</p>
          <button onClick={() => navigate('/cart')}>BACK TO CART</button>
        </div>
      )}
    </div>
  )
}

export default Verify
