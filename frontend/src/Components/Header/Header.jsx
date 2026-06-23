
import './Header.css'
import { assets } from '../../assets/assets'
const Header = () => {
  return (
    <div className='header' style={{backgroundImage: `url(${assets.header_img})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat'}}>
      <div className="header-contents"> 
        <h2>Order your favourite food here</h2>
        <p>Choose from a diverse menu featuring a delectable array of dishes crafted with the finest ingredient and culinary expertise. Our mission is to satisfy your craving your dining experience, one delicious, one delicious meal at a time</p>
        <button>View Menu</button>
      </div>
    </div>
  )
}

export default Header 
