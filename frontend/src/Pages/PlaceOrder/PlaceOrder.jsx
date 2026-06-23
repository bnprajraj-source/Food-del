import { useContext, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'

const PlaceOrder = () => {

  const { cartItems, food_list, getTotalCartAmount, url, token, clearCart } = useContext(StoreContext)
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("");

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const bankList = [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Kotak Mahindra Bank",
    "Punjab National Bank",
    "Bank of Baroda",
    "Canara Bank",
    "Union Bank of India",
    "Indian Bank"
  ];

  const placeOrder = async (event) => {
    event.preventDefault();

    const cartFoodItems = food_list.filter((item) => cartItems[item._id] > 0);
    if (cartFoodItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    if (!data.firstName || !data.email || !data.street || !data.city || !data.state || !data.zipCode || !data.country || !data.phone) {
      alert("Please fill all required fields");
      return;
    }

    if (paymentMethod === "UPI" && !upiId) {
      alert("Please enter your UPI ID");
      return;
    }

    if (paymentMethod === "Net Banking" && !selectedBank) {
      alert("Please select a bank");
      return;
    }

    setLoading(true);

    const items = cartFoodItems.map((item) => ({
      foodId: item._id,
      name: item.name,
      price: item.price,
      quantity: cartItems[item._id]
    }));

    const address = {
      street: data.street,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country
    };

    const totalAmount = getTotalCartAmount() + 2;

    try {
      const response = await axios.post(url + "/api/orders/place", {
        items,
        amount: totalAmount,
        address,
        phone: data.phone,
        paymentMethod
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        clearCart();
        window.location.href = response.data.session_url;
      } else {
        alert("Error placing order: " + response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal === 0 ? 0 : 2;
  const total = subtotal + deliveryFee;

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First name' required />
          <input name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last name' />
        </div>
        <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' required />
        <input name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' required />
        <div className="multi-fields">
          <input name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' required />
          <input name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' required />
        </div>
        <div className="multi-fields">
          <input name='zipCode' onChange={onChangeHandler} value={data.zipCode} type="text" placeholder='Zip code' required />
          <input name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' required />
        </div>
        <input name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone number' required />

        <p className="title" style={{ marginTop: "30px" }}>Payment Method</p>
        <div className="payment-methods">
          <label className={`payment-option ${paymentMethod === "Cash on Delivery" ? "active" : ""}`}>
            <input type="radio" name="paymentMethod" value="Cash on Delivery" checked={paymentMethod === "Cash on Delivery"} onChange={(e) => setPaymentMethod(e.target.value)} />
            <span className="payment-label">Cash on Delivery</span>
          </label>
          <label className={`payment-option ${paymentMethod === "UPI" ? "active" : ""}`}>
            <input type="radio" name="paymentMethod" value="UPI" checked={paymentMethod === "UPI"} onChange={(e) => setPaymentMethod(e.target.value)} />
            <span className="payment-label">UPI</span>
          </label>
          <label className={`payment-option ${paymentMethod === "Net Banking" ? "active" : ""}`}>
            <input type="radio" name="paymentMethod" value="Net Banking" checked={paymentMethod === "Net Banking"} onChange={(e) => setPaymentMethod(e.target.value)} />
            <span className="payment-label">Net Banking</span>
          </label>
        </div>

        {paymentMethod === "UPI" && (
          <div className="upi-section">
            <input type="text" placeholder='Enter UPI ID (e.g. name@upi)' value={upiId} onChange={(e) => setUpiId(e.target.value)} required />
          </div>
        )}

        {paymentMethod === "Net Banking" && (
          <div className="netbanking-section">
            <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} required>
              <option value="">Select your bank</option>
              {bankList.map((bank) => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{subtotal}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹{deliveryFee}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{total}</b>
            </div>
          </div>
          <button type='submit' disabled={loading}>
            {loading ? "PROCESSING..." : "PROCEED TO PAYMENT"}
          </button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder
