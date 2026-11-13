import { useState } from 'react'
import axios from 'axios'

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
    <div>
        <h2>Rekisteröidy</h2>

        <form onSubmit={handleSubmit}>
            <div>
                <label>Käyttäjänimi</label>
                <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                />
            </div>

            <div>
                <label>Sähköposti</label>
                <input type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div>
                <label>Salasana</label>
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button type="submit">
            Rekisteröidy
            </button>
        </form>

        {message && <p>{message}</p>}
    </div>
    )
}

export default RegisterPage