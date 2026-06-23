
import './FoodItem.css'
import { assets } from '../../assets/assets.js'
import {  useContext } from 'react'
import { StoreContext } from '../../Context/StoreContext'

const FoodItem = ({ id, name, description, price, image }) => {

  
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);

  return (
    <div className='food-item' id={id}>
    <div className="food-item-img-container">
      <img className='food-item-image' src={image.startsWith('http') ? image : `${url}/images/${image}`} alt="food" />
      {!cartItems[id]
        ? <img className='add' onClick={()=>addToCart(id)} src={assets.add_icon_white} alt="add" />
        : <div className='food-item-counter'>
          <img onClick={()=>removeFromCart(id)} src={assets.remove_icon_red} alt="remove" />
          <p>{cartItems[id]}</p>
          <img onClick={()=>addToCart(id)} src={assets.add_icon_green} alt="add" />
        </div>
      }
    </div>
    <div className="food-item-info">
      <div className="food-item-name-rating">
       <p> {name}</p>
       <img className='food-item-rating' src={assets.rating_starts} alt="rating" />
        </div>
        <p className="food-item-desc">{description}</p>
        <p className="food-item-price">${price} </p>
        </div>
        </div>
    
    
  )
}

export default FoodItem
