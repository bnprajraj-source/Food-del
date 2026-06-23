import './List.css'
import { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const List = () => {
  const url = import.meta.env.VITE_API_URL
  const navigate = useNavigate()
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchFoods = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/api/foods/list`)
      if (response.data.success) {
        setFoods(response.data.data || [])
      } else {
        toast.error(response.data.message || 'Failed to fetch food items')
      }
    } catch (error) {
      console.error('Error fetching food items:', error)
      toast.error(error.response?.data?.message || error.message || 'Error fetching food items')
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFoods()
  }, [fetchFoods])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await axios.delete(`${url}/api/foods/${id}`)
        if (response.data.success) {
          toast.success('Food item deleted successfully')
          fetchFoods()
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting food item')
      }
    }
  }

  if (loading) {
    return <div className="list"><p>Loading...</p></div>
  }

  return (
    <div className="list">
      <div className="list-header">
        <h2>Food Items List</h2>
        <p className="item-count">Total Items: {foods.length}</p>
      </div>

      {foods.length === 0 ? (
        <div className="no-items">
          <p>No food items found. Add items from the Add Items page.</p>
        </div>
      ) : (
        <div className="list-table-container">
          <table className="list-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((food) => (
                <tr key={food._id}>
                  <td className="image-cell">
                    <img src={`${url}/images/${food.image}`} alt={food.name} />
                  </td>
                  <td>
                    <div className="food-info">
                      <p className="food-name">{food.name}</p>
                      <p className="food-desc">{food.description?.substring(0, 50)}...</p>
                    </div>
                  </td>
                  <td>{food.category}</td>
                  <td className="price">₹{food.price}</td>
                  <td>
                    <span className={`availability ${food.availability ? 'available' : 'unavailable'}`}>
                      {food.availability ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn-edit" onClick={() => navigate(`/edit/${food._id}`)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(food._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default List
