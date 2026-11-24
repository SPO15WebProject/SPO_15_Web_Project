import { useState } from 'react'
import GroupLists from './GroupLists'

// välilehtien tunnukset ja nimet
const sections = [
    { id: 'lists', label: 'Elokuvalistat' },
    { id: 'reviews', label: 'Arvostelut' },
    { id: 'discussion', label: 'Keskustelu' }
]

function GroupContent({ groupId, isMember, authLoading }) {
    // valittu osio komponentin omassa tilassa
    const [activeSection, setActiveSection] = useState('lists')

    // arvostelut ja keskustelut ovat vielä kesken
    const memberMessage = authLoading
        ? 'Tarkistetaan...'
        : !isMember
            ? 'Ryhmän sisäiset arvostelut ja keskustelu näkyy vain jäsenille.'
            : 'work in progress'

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
                {/* elokuvalistat tuodaan backendistä */}
                {activeSection === 'lists' ? (
                    <GroupLists groupId={groupId} />
                ) : (
                    <section className="group-panel">
                        <h2>
                            {activeSection === 'reviews' ? 'Ryhmän arvostelut' : 'Keskustelu'}
                        </h2>

                        <p role={authLoading ? 'status' : undefined}>
                            {memberMessage}
                        </p>
                    </section>
                )}
            </div>
        </div>
    )
}

export default GroupContent