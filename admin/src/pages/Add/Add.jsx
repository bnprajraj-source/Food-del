
import './Add.css'
import { useState, useMemo } from 'react'
import { toast } from 'react-toastify'
import { assets } from '../../assets/assets'
import axios from 'axios'

const Add = () => {
  const url = import.meta.env.VITE_API_URL
  const [image, setImage] = useState(null)
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

    if (!image) {
      toast.error('Please select an image')
      return
    }

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
    data.append('image', image)

    try {
      const response = await axios.post(`${url}/api/foods/`, data)
      if (response.data.success) {
        toast.success('Food item added successfully')
        setFormData({
          name: '',
          description: '',
          price: '',
          category: 'Salad',
          availability: true
        })
        setImage(null)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding food item')
    }
  }

  return (
    <div className="add">
      <form onSubmit={handleSubmit} className="add-form">
        <div className="add-img-upload">
          <label htmlFor="image" className="upload-label">
            <img src={imagePreview || assets.upload_area} alt="Upload" />
          </label>
          <input onChange={handleImageChange} type="file" id="image" hidden accept="image/*" />
          <p className="upload-hint">{image ? image.name : 'Upload food image'}</p>
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

        <button type="submit" className="btn-submit">Add Item</button>
      </form>
    </div>
  )
}

export default Add
