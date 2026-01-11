import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { destinationService } from '../services/destinationService'
import '../styles/Destinations.css'

export default function Destinations() {
  const { getUser } = useAuth()
  const user = getUser()
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDestination, setEditingDestination] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    description: '',
    lat: '',
    lng: '',
    img: ''
  })

  useEffect(() => {
    loadDestinations()
  }, [])

  const loadDestinations = async () => {
    try {
      setLoading(true)
      const data = await destinationService.getAllDestinations()
      setDestinations(data)
    } catch (error) {
      console.error('Error loading destinations:', error)
      setMessage({ type: 'error', text: 'Failed to load destinations' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const openModal = (destination = null) => {
    if (destination) {
      setEditingDestination(destination)
      setFormData({
        name: destination.name,
        country: destination.country,
        description: destination.description || '',
        lat: destination.lat || '',
        lng: destination.lng || '',
        img: destination.img || ''
      })
    } else {
      setEditingDestination(null)
      setFormData({
        name: '',
        country: '',
        description: '',
        lat: '',
        lng: '',
        img: ''
      })
    }
    setShowModal(true)
    setMessage({ type: '', text: '' })
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingDestination(null)
    setFormData({
      name: '',
      country: '',
      description: '',
      lat: '',
      lng: '',
      img: ''
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const destinationData = {
        ...formData,
        userId: user._id,
        lat: formData.lat ? parseFloat(formData.lat) : 0,
        lng: formData.lng ? parseFloat(formData.lng) : 0
      }

      if (editingDestination) {
        await destinationService.updateDestination(editingDestination._id, destinationData)
        setMessage({ type: 'success', text: 'Destination updated successfully!' })
      } else {
        await destinationService.createDestination(destinationData)
        setMessage({ type: 'success', text: 'Destination added successfully!' })
      }

      closeModal()
      loadDestinations()
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save destination' 
      })
    }
  }

  const handleDelete = async (destinationId) => {
    if (!window.confirm('Are you sure you want to delete this destination?')) return

    try {
      await destinationService.deleteDestination(destinationId)
      setMessage({ type: 'success', text: 'Destination deleted successfully!' })
      loadDestinations()
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete destination' 
      })
    }
  }

  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="destinations-page">
      {/* Navbar */}
      <nav className="destinations-navbar">
        <div className="container navbar-content">
          <Link to="/dashboard" className="back-link">
            ← Back to Dashboard
          </Link>
          
          <div className="navbar-right">
            <img src="/assets/images/logo.png" alt="Logo" className="navbar-logo" />
            <span className="navbar-brand">TravelBrain</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container destinations-container">
        {/* Header */}
        <div className="destinations-header">
          <div>
            <h1 className="destinations-title">Explore Destinations</h1>
            <p className="destinations-subtitle">Discover amazing places around the world</p>
          </div>
          <button className="btn-primary" onClick={() => openModal()}>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 4a.5.5 0 01.5.5v3h3a.5.5 0 010 1h-3v3a.5.5 0 01-1 0v-3h-3a.5.5 0 010-1h3v-3A.5.5 0 018 4z"/>
            </svg>
            Add Destination
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.1zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search destinations by name or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Message */}
        {message.text && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Destinations Grid */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading destinations...</p>
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 16s6-5.686 6-10A6 6 0 002 6c0 4.314 6 10 6 10zm0-7a3 3 0 110-6 3 3 0 010 6z"/>
            </svg>
            <h3>{searchTerm ? 'No destinations found' : 'No destinations yet'}</h3>
            <p>{searchTerm ? 'Try adjusting your search' : 'Start exploring the world!'}</p>
            {!searchTerm && (
              <button className="btn-primary" onClick={() => openModal()}>
                Add Your First Destination
              </button>
            )}
          </div>
        ) : (
          <div className="destinations-grid">
            {filteredDestinations.map((destination) => (
              <div key={destination._id} className="destination-card">
                <div className="destination-image">
                  {destination.img ? (
                    <img src={destination.img} alt={destination.name} />
                  ) : (
                    <div className="destination-placeholder">
                      <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 16s6-5.686 6-10A6 6 0 002 6c0 4.314 6 10 6 10zm0-7a3 3 0 110-6 3 3 0 010 6z"/>
                      </svg>
                    </div>
                  )}
                  <div className="destination-actions">
                    <button 
                      className="btn-icon"
                      onClick={() => openModal(destination)}
                      title="Edit destination"
                    >
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M12.146.146a.5.5 0 01.708 0l3 3a.5.5 0 010 .708l-10 10a.5.5 0 01-.168.11l-5 2a.5.5 0 01-.65-.65l2-5a.5.5 0 01.11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 01.5.5v.5h.5a.5.5 0 01.5.5v.5h.293l6.293-6.293z"/>
                      </svg>
                    </button>
                    <button 
                      className="btn-icon btn-icon-danger"
                      onClick={() => handleDelete(destination._id)}
                      title="Delete destination"
                    >
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z"/>
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="destination-content">
                  <h3 className="destination-name">{destination.name}</h3>
                  <div className="destination-country">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 16s6-5.686 6-10A6 6 0 002 6c0 4.314 6 10 6 10zm0-7a3 3 0 110-6 3 3 0 010 6z"/>
                    </svg>
                    {destination.country}
                  </div>
                  {destination.description && (
                    <p className="destination-description">{destination.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingDestination ? 'Edit Destination' : 'Add New Destination'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Destination Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Eiffel Tower"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country *</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="e.g., France"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="lat">Latitude *</label>
                  <input
                    type="number"
                    id="lat"
                    name="lat"
                    value={formData.lat}
                    onChange={handleInputChange}
                    placeholder="48.8584"
                    step="any"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lng">Longitude *</label>
                  <input
                    type="number"
                    id="lng"
                    name="lng"
                    value={formData.lng}
                    onChange={handleInputChange}
                    placeholder="2.2945"
                    step="any"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="img">Image URL</label>
                <input
                  type="url"
                  id="img"
                  name="img"
                  value={formData.img}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe this destination..."
                  rows="4"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingDestination ? 'Update Destination' : 'Add Destination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
