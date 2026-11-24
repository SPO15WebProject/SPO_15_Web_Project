import { Link } from 'react-router-dom'
import GroupCard from './GroupCard'
import useMovies from '../../hooks/Usemovies'
import './GroupPage.css'

function MyGroupsPage() {
    // haetaan ryhmät ja nimetään movies-arvo groups-muuttujaksi
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
        <section className="group-page">
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
                    {/* välitetään jokaisen ryhmän tiedot omalle kortille */}
                    {groups.map((group) => (
                        <li key={group.groupid}>
                            <GroupCard group={group} />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

export default MyGroupsPage