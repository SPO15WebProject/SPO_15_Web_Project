import { Link } from 'react-router-dom'
import useMovies from '../../hooks/Usemovies'
import './GroupPage.css'

function MyGroupsPage() {
    // haetaan ryhmät useMovies hookin avulla
    // imetään hookin palauttama movies-arvo tässä groups-muuttujaksi
    const { movies: groups, loading, error } = useMovies(
        '/api/db/GetMyGroups'
    )

    // virhe jos haku ei onnistu
    if (error) {
        return (
            <p role="alert">
                Omien ryhmien hakeminen epäonnistui.{' '}
                <Link to="/login">Kirjaudu sisään</Link>
            </p>
        )
    }

    // 
    if (loading) {
        return <p role="status">Ladataan ryhmiä...</p>
    }

    return (
        <section className="group-page">
            <div className="group-panel">
                {/* otsikko ja uuden ryhmän luontilinkki samalla rivillä */}
                <header className="group-page-header">
                    <h1>Omat ryhmät</h1>

                    <Link to="/groups/new" className="group-action">
                        Luo ryhmä
                    </Link>
                </header>
                {groups.length === 0 ? (
                    <p>Et kuulu vielä ryhmään.</p>
                ) : (
                    <ul className="group-list">
                        {groups.map((group) => (
                            <li key={group.groupid}>
                                <Link
                                    to={`/groups/${group.groupid}`}
                                    className="group-list-link"
                                >
                                    {group.groupname}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    )
}

export default MyGroupsPage