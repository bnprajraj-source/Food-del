import { useContext } from 'react'
import './Cart.css'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom'

const Cart = () => {

  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url, token } = useContext(StoreContext)
  const navigate = useNavigate();

  const cartFoodItems = food_list.filter((item) => cartItems[item._id] > 0);

  if (cartFoodItems.length === 0) {
    return (
      <div className='cart'>
        <div className="cart-empty">
          <h2>Your cart is empty</h2>
          <p>Add items to get started</p>
          <button onClick={() => navigate('/')}>BROWSE MENU</button>
        </div>
      </div>
    )
  }

  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {cartFoodItems.map((item) => (
          <div key={item._id}>
            <div className='cart-items-title cart-items-item'>
              <img src={item.image.startsWith('http') ? item.image : `${url}/images/${item.image}`} alt="" />
              <p>{item.name}</p>
              <p>${item.price}</p>
              <p>{cartItems[item._id]}</p>
              <p>${item.price * cartItems[item._id]}</p>
              <p onClick={() => removeFromCart(item._id)} className='cross'>x</p>
            </div>
            <hr />
          </div>
        ))}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
            </div>
          </div>
          <button onClick={() => {
            if (!token) {
              alert("Please login to proceed to checkout");
            } else {
              navigate('/order');
            }
          }}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, Enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder='promo code' />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
