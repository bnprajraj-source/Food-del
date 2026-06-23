import { useState, useEffect } from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Add from './pages/Add/Add'
import Edit from './pages/Edit/Edit'
import Orders from './pages/Orders/Orders'
import List from './pages/List/List'

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '')

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  const handleSetToken = (newToken) => {
    setToken(newToken)
    localStorage.setItem('adminToken', newToken)
  }

  const handleLogout = () => {
    setToken('')
    localStorage.removeItem('adminToken')
  }

  if (!token) {
    return (
      <>
        <Login setToken={handleSetToken} />
        <ToastContainer />
      </>
    )
  }

  return (
    <div>
      <Navbar onLogout={handleLogout} />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<Add />} />
          <Route path="/edit/:id" element={<Edit />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/list" element={<List />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <ToastContainer />
    </div>
  )
}

export default App
