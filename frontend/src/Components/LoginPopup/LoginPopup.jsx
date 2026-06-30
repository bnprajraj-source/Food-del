import  { useState, useContext } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
const LoginPopup = ({setShowLogin}) => {

    const {url, setToken} = useContext(StoreContext);

    const [currState, setCurrState] = useState("Login")

    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    })

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    

    const onLogin = async (event) => {
        event.preventDefault();
        let newUrl = url;
        if(currState === "Login"){
            newUrl += "/api/users/login"
        }
        else{
            newUrl += "/api/users/register"
        }

        try {
            const response = await axios.post(newUrl, data);

            if(response.data.success){
                const newToken = response.data.token;
                setToken(newToken);
                localStorage.setItem("token", newToken);

                const guestCart = JSON.parse(localStorage.getItem("cartItems") || "{}");
                const items = Object.entries(guestCart).filter(([, qty]) => qty > 0);
                if (items.length > 0) {
                    for (const [foodId, quantity] of items) {
                        try {
                            await axios.post(url + "/api/cart/add", { foodId, quantity }, {
                                headers: { Authorization: `Bearer ${newToken}` }
                            });
                        } catch { /* ignore individual failures */ }
                    }
                    localStorage.removeItem("cartItems");
                }

                setShowLogin(false)
            }
            else{
                alert(response.data.message)
            }
        } catch (error) {
            if(error.response && error.response.data && error.response.data.message){
                alert(error.response.data.message)
            } else {
                alert("Something went wrong. Please try again.")
            }
        }
    }
  return (
    <div className='login-popup'>
        <form onSubmit={onLogin} className="login-popup-container">
            <div className="login-popup-title">
                <h2>{currState}</h2>
                <img onClick={()=> setShowLogin(false)} src={assets.cross_icon} alt=""  />
            </div>
            <div className="login-popup-inputs">
                {currState === "Sign Up" && <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your name' required />}
                <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Your email' required />
                <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Password' required />
            </div>
            <button>{currState === "Sign Up" ? "Create account" : "Login"}</button>
            <div className="login-popup-condition">
                <input type="checkbox" required />
                <p>By continuing, I agree to the terms of use & privacy policy.</p>
            </div>
            {currState === "Login"
                ? <p>Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span></p>
                : <p>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>
            }
        </form>
    </div>
  )
}

export default LoginPopup
