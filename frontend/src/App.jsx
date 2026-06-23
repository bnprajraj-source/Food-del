import { useState } from "react"
import { Route, Routes } from "react-router-dom"
import Navbar from "./Components/Navbar/Navbar"
import Footer from "./Components/Footer/Footer"
import Home from "./Pages/Home/Home"
import Cart from "./Pages/Cart/Cart"
import PlaceOrder from "./Pages/PlaceOrder/PlaceOrder"
import Verify from "./Pages/Verify/Verify"
import MyOrders from "./Pages/MyOrders/MyOrders"
import OrderTracking from "./Pages/OrderTracking/OrderTracking"
import LoginPopup from "./Components/LoginPopup/LoginPopup"

 const App = () => {

  const [showLogin, setShowLogin] = useState(false)
   return (
    <>
    {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
     <div className='app'>
      <Navbar setShowLogin={setShowLogin} /> 
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/cart' element={<Cart/>} />
        <Route path='/order' element={<PlaceOrder/>} />
        <Route path='/verify' element={<Verify/>} />
        <Route path='/myorders' element={<MyOrders/>} />
        <Route path='/order/:id' element={<OrderTracking/>} />
      </Routes>
       
     </div>
     <Footer />
     </>
   )
 }
 
 export default App
 