import './Login.css'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { assets } from '../../assets/assets'
import axios from 'axios'

const Login = ({ setToken }) => {
  const url = import.meta.env.VITE_API_URL
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post(`${url}/api/users/login`, { email, password })
      if (response.data.success) {
        const data = response.data
        if (data.user && data.user.role === 'admin') {
          setToken(data.token)
          toast.success('Login successful')
        } else {
          toast.error('Access denied. Admin only.')
        }
      } else {
        toast.error(response.data.message || 'Login failed')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="login">
      <div className="login-container">
        <form onSubmit={onSubmitHandler} className="login-form">
          <div className="login-logo">
            <img src={assets.logo} alt="" />
          </div>
          <h2>Admin Panel</h2>
          <div className="login-input">
            <p>Email</p>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="admin@email.com"
              required
            />
          </div>
          <div className="login-input">
            <p>Password</p>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              required
            />
          </div>
          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    </div>
  )
}

export default Login
