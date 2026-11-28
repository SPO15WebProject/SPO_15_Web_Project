import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function LeaveGroupButton({ group, userId }) {
    const navigate = useNavigate()
    const [isLeaving, setIsLeaving] = useState(false)
    const [error, setError] = useState('')

    async function handleLeave() {
        // nykyinen backend poistaa koko ryhmän jos ainoo jäsen poistuu
        const confirmation = group.members.length === 1
            ? 'Olet ryhmän ainoa jäsen. Poistuminen poistaa myös ryhmän. Haluatko jatkaa?'
            : 'Haluatko varmasti poistua ryhmästä?'

        if (!window.confirm(confirmation)) return

        setIsLeaving(true)
        setError('')

        try {
            // käytetään olemassa olevaa reittiä ja omaa käyttäjätunnistetta
            // backend tarkistaa oikeudet kirjautumisevästeestä
            await axios.delete('/api/db/RemoveGroupMember', {
                data: { groupId: group.groupid, userId },
                withCredentials: true
            })

            // palataan omiin ryhmiin onnistuneen poistumisen jälkeen
            navigate('/profile/groups', { replace: true })
        } catch (err) {
            // ainoa ylläpitäjä ei voi poistua
            setError(
                err.response?.status === 409
                    ? 'Et voi poistua ainoana ylläpitäjänä, kun ryhmässä on muita jäseniä.'
                    : 'Ryhmästä poistuminen epäonnistui. Yritä uudelleen.'
            )
        } finally {
            setIsLeaving(false)
        }
    }

    return (
        <div>
            {/* estetään uusi klikkaus pyynnön aikana */}
            <button type="button" onClick={handleLeave} disabled={isLeaving}>
                {isLeaving ? 'Poistutaan...' : 'Poistu ryhmästä'}
            </button>

            {error && <p role="alert">{error}</p>}
        </div>
    )
}

export default LeaveGroupButton