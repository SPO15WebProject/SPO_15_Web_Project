import { Link, useParams } from 'react-router-dom'
import useMovies from '../../hooks/Usemovies'

function GroupPage() {
    const { groupId } = useParams()

    //useMovies hook hakee datan
    //tehdään palautetusta arvosta ryhmä
    const { movies: group, loading, error } = useMovies(
        `/api/db/GetGroupById/${groupId}`
    )

    //varmistetaan että ryhmä vastaa osoitteen id:tä
    const currentGroup = group && String(group.groupid) === groupId
        ? group
        : null

    if (error) {
        return (
            <p role="alert">
                Ryhmän tietoja ei löytynyt
            </p>
        )
    }

    if (loading || !currentGroup) {
        return <p role="status">Ladataan ryhmän tietoja...</p>
    }

    return (
        <section className="group-page">
            <Link to="/">Takaisin etusivulle</Link>

            <article className="group-panel">
                <h1>{currentGroup.groupname}</h1>
                <p>{currentGroup.groupdescription || 'Ryhmällä ei ole kuvausta.'}</p>
                <p>{currentGroup.inviteonly ? 'Suljettu ryhmä' : 'Avoin ryhmä'}</p>

                {/* jäsenien määrä haetaan palvelimen avulla */ }
                <h2>Jäsenet ({currentGroup.members.length})</h2>

                <ul className="group-members">
                    {currentGroup.members.map((member) => (
                        <li key={member.userid}>
                            {member.nickname}
                            {member.isadmin && ' - Ylläpitäjä'}
                        </li>
                    ))}
                </ul>
            </article>
        </section>
    )
}

export default GroupPage