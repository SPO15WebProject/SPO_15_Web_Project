import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import useMovies from '../../hooks/Usemovies'
import GroupHeader from './GroupHeader'
import GroupContent from './GroupContent'
import GroupSidebar from './GroupSidebar'
import './GroupPage.css'

function GroupPage() {
    const { groupId } = useParams()
    const { user, loading: authLoading } = useAuth()

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
        return <p role="alert">Ryhmän tietoja ei löytynyt</p>
    }

    if (loading || !currentGroup) {
        return <p role="status">Ladataan ryhmän tietoja...</p>
    }

    // tarkistetaan löytyykö kirjautunut käyttäjä ryhmän jäsenlistasta
    const isMember = currentGroup.members.some(
        (member) => String(member.userid) === String(user?.userid)
    )

    return (
        <section className="group-page">
            <nav className="group-navigation" aria-label="Ryhmäsivun navigointi">
                <Link to="/profile/groups" className="group-action">Takaisin ryhmiin</Link>
                <Link to="/" className="group-action">Takaisin etusivulle</Link>
            </nav>

            <GroupHeader group={currentGroup} isMember={isMember} />
            
            <div className="group-layout">
                {/* nollaa osion ryhmän vaihtuessa */}
                <GroupContent
                    key={currentGroup.groupid}
                    groupId={currentGroup.groupid}
                    isMember={isMember}
                    authLoading={authLoading}
                />

                <GroupSidebar group={currentGroup} />
            </div>
        </section>
    )
}

export default GroupPage