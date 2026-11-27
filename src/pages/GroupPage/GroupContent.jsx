import { useState } from 'react'
import GroupLists from './GroupLists'
import GroupDiscussion from './GroupDiscussion'

// välilehtien tunnukset ja nimet
const sections = [
    { id: 'lists', label: 'Elokuvalistat' },
    { id: 'reviews', label: 'Arvostelut' },
    { id: 'discussion', label: 'Keskustelu' }
]

function GroupContent({ groupId, isMember, isAdmin, authLoading }) {
    // valittu osio komponentin omassa tilassa
    const [activeSection, setActiveSection] = useState('lists')

    // arvostelut vielä kesken
    const memberMessage = authLoading
        ? 'Tarkistetaan...'
        : !isMember
            ? 'Ryhmän sisäiset arvostelut ja keskustelu näkyy vain jäsenille.'
            : 'work in progress'

    const renderSection = () => {
        if (activeSection === 'lists') {
            // elokuvalistat tuodaan backendistä
            return <GroupLists groupId={groupId} />
        }

        // keskustelu ladataan vasta kun tiedetään että käyttäjä on jäsen
        if (activeSection === 'discussion' && isMember && !authLoading) {
            return <GroupDiscussion groupId={groupId} isAdmin={isAdmin} />
        }

        return (
            <section className="group-panel">
                <h2>
                    {activeSection === 'reviews' ? 'Ryhmän arvostelut' : 'Keskustelu'}
                </h2>

                <p role={authLoading ? 'status' : undefined}>
                    {memberMessage}
                </p>
            </section>
        )
    }

    return (
        <div className="group-main">
            <nav className="group-sections" aria-label="Ryhmän sisältö">
                {/* osio vaihtuu klikkaamalla */}
                {sections.map((section) => (
                    <button
                        key={section.id}
                        type="button"
                        className="group-section-button"
                        aria-pressed={activeSection === section.id}
                        aria-controls="group-content"
                        onClick={() => setActiveSection(section.id)}
                    >
                        {section.label}
                    </button>
                ))}
            </nav>

            <div id="group-content">
                {renderSection()}
            </div>
        </div>
    )
}

export default GroupContent