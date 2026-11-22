import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './LoginPage.css'


function LoginPage() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')

    const navigate = useNavigate()
    const { login } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const response = await axios.post(
                '/api/db/Login',
                {
                    email,
                    password
                },
                {
                    withCredentials:true //Sallitaan backendin asettaa JWT-cookie kirjautumisen yhetydessä.
                }
            )

            // Tallennetaan käyttäjä contextiin (ei enää localStorageen)
            login(response.data)

            navigate('/')
        } catch (error) {
            console.log(error)

            setMessage(
                error.response?.data?.error ||
                'Kirjautuminen epäonnistui.'
            )
        }
    }

   return (
  <div className="auth-page">
    <div className="auth-card">

      <h1>Kirjaudu sisään</h1>

      <form onSubmit={handleSubmit}>

        <label>Sähköposti</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Salasana</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">
          Kirjaudu sisään
        </button>

      </form>

      {message && (
        <p className="message">
          {message}
        </p>
      )}

    </div>
  </div>
)
}

export default LoginPage