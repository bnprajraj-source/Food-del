import './Navbar.css'
import { assets } from '../../assets/assets'
import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';


const Navbar = ({setShowLogin}) => {

    const [menu, setMenu] = useState("home")
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const {getTotalCartAmount,token,setToken,clearCart} = useContext(StoreContext);
    const navigate = useNavigate();

    const handleNavClick = (menuName) => {
        setMenu(menuName);
        setMobileMenuOpen(false);
    };

  return (
    <div className='navbar'>
        <Link to='/'><img src={assets.logo} alt="" className="logo" /></Link>

        <div className={`navbar-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <Link to='/' onClick={() => handleNavClick("home")} className={menu === "home" ? "active" : ""}>home</Link>
            <a href='#explore-menu' onClick={() => handleNavClick("menu")} className={menu === "menu" ? "active" : ""}>menu</a>
            <a href='#app-download' onClick={() => handleNavClick("mobile-app")} className={menu === "mobile-app" ? "active" : ""}>mobile-app</a>
            <a href='#footer' onClick={() => handleNavClick("contact us")} className={menu === "contact us" ? "active" : ""}>contact us</a>
        </div>

        <div className="navbar-right">
            <img src={assets.search_icon} alt="" className="search-icon" />
            <div className="navbar-search-icon">
                <Link to='/cart'><img src={assets.basket_icon} alt="" /></Link>
                <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
            </div>
            {token
                ? <div className='navbar-profile'>
                    <img src={assets.profile_icon} alt="" />
                    <ul className="navbar-profile-dropdown">
                        <li onClick={() => navigate('/myorders')}><img src={assets.bag_icon} alt="" /><p>Orders</p></li>
                        <hr />
                        <li onClick={() => {clearCart(); setToken(""); localStorage.removeItem("token")}}><img src={assets.logout_icon} alt="" /><p>Logout</p></li>
                    </ul>
                </div>
                : <button onClick={() => setShowLogin(true)}>Sign In</button>
            }
            <div className="navbar-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <span className={mobileMenuOpen ? 'open' : ''}></span>
                <span className={mobileMenuOpen ? 'open' : ''}></span>
                <span className={mobileMenuOpen ? 'open' : ''}></span>
            </div>
        </div>
    </div>
  )
}

export default Navbar
