import { useState } from 'react'
import axios from 'axios'
import './RegisterPage.css'

function RegisterPage() {
const [nickname, setNickname] = useState('')
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [message, setMessage] = useState('')

const handleSubmit = async (e) => {
    e.preventDefault()

    try {
        const response = await axios.post(
            '/api/db/CreateUser',
            {
                nickname,
                email,
                password
            }
        )

        setMessage('Käyttäjä luotu onnistuneesti!')
        console.log(response.data)

    } catch (error) {
        console.log(error)

        setMessage(
            error.response?.data?.error ||
            'Rekisteröityminen epäonnistui.'
        )
    }
}

return (
  <div className="auth-page">
    <div className="auth-card">

      <h1>Rekisteröidy</h1>

      <form onSubmit={handleSubmit}>

        <label>Käyttäjänimi</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />

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
          Rekisteröidy
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

export default RegisterPage