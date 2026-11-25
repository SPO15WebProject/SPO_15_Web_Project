// ryhmän tiedot saadaan GroupPage-komponentilta propseina
function GroupSidebar({ group }) {
    return (
        <aside className="group-panel group-sidebar">
            <section>
                <h2>Tietoa ryhmästä</h2>

                {/* varateksti jos ryhmälle ei ole annettu kuvausta */}
                <p className="group-description">
                    {group.groupdescription || 'Ryhmällä ei ole kuvausta.'}
                </p>
            </section>

            <section>
                {/* jäsenmäärä saadaan jäsenlistan pituudesta */}
                <h2>Jäsenet ({group.members.length})</h2>

                <ul className="group-members">
                    {/* muodostetaan jokaisesta jäsenestä oma listarivi */}
                    {group.members.map((member) => (
                        <li key={member.userid}>
                            {/* nimimerkin ensimmäinen kirjain toimii tunnuksena */}
                            <span
                                className="group-member-avatar"
                                aria-hidden="true"
                            >
                                {member.nickname.slice(0, 1).toUpperCase()}
                            </span>

                            <div>
                                <span>{member.nickname}</span>

                                {/* admin merkintä tulee backendistä */}
                                {member.isadmin && (
                                    <small> Ylläpitäjä</small>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
        </aside>
    )
}

export default GroupSidebar