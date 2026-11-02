import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [movie, setMovie] = useState(null)
  const [image, setImage] = useState(null)
  const movieid = 12

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${API_URL}/`)
      setData(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchMovie = async () => {
    try {
      const res = await axios.get(`${API_URL}/movies/${movieid}`)
      setMovie(res.data)
    } catch (err) {
      console.log(err.message)
    }
  }

  const fetchImage = async () => {
    try {
      const res = await axios.get(`${API_URL}/movies/${movieid}/logo`)
      setImage(res.data.url)
    } catch (err) {
      console.log(err.message)
    }
  }

  useEffect(() => {
    fetchData()
    fetchMovie()
    fetchImage()
  }, [])

  return (
    <>
      <h1>Docker Sample</h1>
      <div className="card">
        {loading && <p>Loading...</p>}

        {data && (
          <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
            <h3>Data from Backend:</h3>
            <ul style={{ textAlign: 'left', margin: '10px 0' }}>
              {data.map((item) => (
                <li key={item.id} style={{ marginBottom: '10px' }}>
                  {`ID: ${item.id} - ${item.description}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div style={{ marginTop: '20px', padding: '10px', background: '#ffebee', color: 'red' }}>
            <h3>Error:</h3>
            <p>{error}</p>
          </div>
        )}

        {movie && (
          <div style={{ marginTop: '20px', padding: '10px', background: '#ffabab' }}>
            <h3>movie:</h3>
            <h1>{movie.original_title}</h1>
          </div>
        )}

        {image && <img src={image} alt={movie?.original_title} />}
      </div>
    </>
  )
}

export default App