import './Edit.css'
import { useState, useEffect, useMemo } from 'react'
import { toast } from 'react-toastify'
import { assets } from '../../assets/assets'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Edit = () => {
  const url = import.meta.env.VITE_API_URL
  const { id } = useParams()
  const navigate = useNavigate()
  const [image, setImage] = useState(null)
  const [existingImage, setExistingImage] = useState('')
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Salad',
    availability: true
  })

  const imagePreview = useMemo(() => {
    if (image) {
      return URL.createObjectURL(image)
    }
    return null
  }, [image])

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const response = await axios.get(`${url}/api/foods/${id}`)
        if (response.data.success) {
          const food = response.data.food
          setFormData({
            name: food.name || '',
            description: food.description || '',
            price: food.price || '',
            category: food.category || 'Salad',
            availability: food.availability !== undefined ? food.availability : true
          })
          setExistingImage(food.image || '')
        } else {
          toast.error('Failed to fetch food item')
          navigate('/list')
        }
      } catch (error) {
        console.error('Error fetching food item:', error)
        toast.error('Error fetching food item')
        navigate('/list')
      } finally {
        setLoading(false)
      }
    }
    fetchFood()
  }, [id, url, navigate])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageChange = (e) => {
    setImage(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.description || !formData.price) {
      toast.error('Please fill all required fields')
      return
    }

    const data = new FormData()
    data.append('name', formData.name)
    data.append('description', formData.description)
    data.append('price', formData.price)
    data.append('category', formData.category)
    data.append('availability', formData.availability)
    if (image) {
      data.append('image', image)
    }

    try {
      const response = await axios.put(`${url}/api/foods/${id}`, data)
      if (response.data.success) {
        toast.success('Food item updated successfully')
        navigate('/list')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating food item')
    }
  }

  if (loading) {
    return <div className="edit"><p>Loading...</p></div>
  }

  return (
    <div className="edit">
      <div className="edit-header">
        <h2>Edit Food Item</h2>
        <button className="btn-back" onClick={() => navigate('/list')}>Back to List</button>
      </div>
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="edit-img-upload">
          <label htmlFor="image" className="upload-label">
            <img
              src={imagePreview || (existingImage ? `${url}/images/${existingImage}` : assets.upload_area)}
              alt="Upload"
            />
          </label>
          <input onChange={handleImageChange} type="file" id="image" hidden accept="image/*" />
          <p className="upload-hint">{image ? image.name : 'Click to change image'}</p>
        </div>

        <div className="form-group">
          <label htmlFor="name">Food Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter food name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter food description"
            rows="4"
            required
          ></textarea>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="Salad">Salad</option>
              <option value="Rolls">Rolls</option>
              <option value="Deserts">Deserts</option>
              <option value="Sandwich">Sandwich</option>
              <option value="Cake">Cake</option>
              <option value="Pure Veg">Pure Veg</option>
              <option value="Pasta">Pasta</option>
              <option value="Noodles">Noodles</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Price</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Enter price"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-group checkbox">
          <input
            type="checkbox"
            id="availability"
            name="availability"
            checked={formData.availability}
            onChange={handleInputChange}
          />
          <label htmlFor="availability">Available</label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/list')}>Cancel</button>
          <button type="submit" className="btn-submit">Update Item</button>
        </div>
      </form>
    </div>
  )
}

export default Edit
