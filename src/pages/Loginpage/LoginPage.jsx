import { useState } from 'react'
import axios from 'axios'

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')

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


            localStorage.setItem(
                'user',
                JSON.stringify(response.data)
            )

            window.location.reload()

            setMessage('Kirjautuminen onnistui!')
            console.log(response.data)
        } catch (error) {
            console.log(error)

            setMessage(
                error.response?.data?.error ||
                'Kirjautuminen epäonnistui.'
            )
        }
    }
     
    return (
        <div>
            <h2>Kirjaudu sisään</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Sähköposti</label>
                    <input
                    type="email"
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
                    Kirjaudu sisään
                </button>
            </form>

            {message && <p>{message}</p>}
        </div>
    )
}

    export default LoginPage