import { useState } from 'react'
import axios from 'axios'

export default function CreateGroupPage() {
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [inviteOnly, setInviteOnly] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    setError('')

    try {
      // Palvelin tunnistaa ryhmän perustajan kirjautumisevästeestä.
      await axios.post('/api/db/CreateGroup', {
        groupName,
        groupDescription,
        inviteOnly
      })

      setMessage('Ryhmä luotiin.')
      setGroupName('')
      setGroupDescription('')
      setInviteOnly(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Ryhmää ei voitu luoda.')
    } finally {
        // Vapauttaa submit-painikkeen myös jos pyyntö epäonnistuu
      setIsSubmitting(false)
    }
  }

  return (
    <div className="account-page">
      <section className="auth-card">
        <h1>Luo ryhmä</h1>

        <form onSubmit={handleSubmit}>
          <label htmlFor="group-name">Ryhmän nimi</label>
          <input
            id="group-name"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            maxLength={255}
            required
          />

          <label htmlFor="group-description">Kuvaus (valinnainen)</label>
          <input
            id="group-description"
            value={groupDescription}
            onChange={(event) => setGroupDescription(event.target.value)}
          />

          <label htmlFor="group-visibility">Ryhmän tyyppi</label>
          <select
            id="group-visibility"
            value={inviteOnly ? 'closed' : 'open'}
            onChange={(event) => setInviteOnly(event.target.value === 'closed')}
          >
            <option value="open">Avoin</option>
            <option value="closed">Suljettu</option>
          </select>

          <button type="submit" disabled={isSubmitting || !groupName.trim()}>
            {isSubmitting ? 'Luodaan…' : 'Luo ryhmä'}
          </button>
        </form>

        {message && <p className="message" role="status">{message}</p>}
        {error && <p className="message" role="alert">{error}</p>}
      </section>
    </div>
  )
}