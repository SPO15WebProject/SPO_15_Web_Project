import { Link } from 'react-router-dom'
import useMovies from '../../hooks/Usemovies'

function MyGroupsPage() {
    
    const { movies: groups, loading, error } = useMovies(
        '/api/db/GetMyGroups'
    )

    if (error) {
        return (
            <p role="alert">
                Omien ryhmien hakeminen epäonnistui.{' '}
                <Link to="/login">Kirjaudu sisään</Link>
            </p>
        )
    }

    if (loading) {
        return <p role="status">Ladataan ryhmiä...</p>
    }

    return (
        <section>
            <h1>Omat ryhmät</h1>
            <Link to="/groups/new">Luo ryhmä</Link>

            {groups.length === 0 ? (
                <p>Et kuulu vielä ryhmään</p>
            ) : (
                <ul>
                    {groups.map((group) => (
                        <li key={group.groupid}>
                        {/* avaa aiemmin tehdyn ryhmäsivun */}
                        <Link to={`/groups/${group.groupid}`}>
                            {group.groupname}
                        </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

export default MyGroupsPage