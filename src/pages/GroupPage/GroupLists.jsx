import Icon from '../../components/Icon/Icon'
import useMovies from '../../hooks/Usemovies'

function GroupLists({ groupId }) {
    //  movies-arvo listsiksi
    const { movies: lists, loading, error } = useMovies(
        `/api/db/GetListsByGroup/${groupId}`
    )

    if (error) {
        return (
            <p role="alert">
                Ryhmän elokuvalistojen hakeminen epäonnistui.
            </p>
        )
    }

    if (loading) {
        return <p role="status">Ladataan elokuvalistoja...</p>
    }

    return (
        <>
            <h2>Yhteiset elokuvalistat</h2>

            {/* tyhjä lista = ryhmään ole vielä jaettu listoja */}
            {lists.length === 0 ? (
                <p className="group-empty">
                    Ryhmällä ei ole vielä yhteisiä elokuvalistoja.
                </p>
            ) : (
                <ul className="group-movie-lists">
                    {lists.map((list) => (
                        <li key={list.listid} className="group-panel group-movie-list">
                            <Icon name="film" size={30} />

                            <div>
                                <h3>{list.listname}</h3>

                                {/* kuvaus näytetään vain jos sellainen löytyy */}
                                {list.listdescription && (
                                    <p>{list.listdescription}</p>
                                )}

                                {/* elokuvien määrä ja listan jakajan username */}
                                <p className="group-list-meta">
                                    {list.moviecount}{' '}
                                    {list.moviecount === 1 ? 'elokuva' : 'elokuvaa'}

                                    {list.nickname && (
                                        <> · Jakanut {list.nickname}</>
                                    )}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </>
    )
}

export default GroupLists