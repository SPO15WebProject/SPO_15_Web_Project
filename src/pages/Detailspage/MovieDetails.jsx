import { Link, useLocation, useParams } from 'react-router-dom'
import useMovies from '../../hooks/Usemovies'

function MovieDetails() {
    // Luetaan elokuvan ID sivun osoitteesta
    const { id } = useParams()
    const location = useLocation()

    // Hook hakee elokuvan ja katsoo lataus- ja virhetilan
    const { movie, loading, error } = useMovies(`/movies/${id}`)

    // Kortilta saadut tiedot ovat heti käytettävissä
    const passedMovie = location.state?.movie

    // Näytetään vain osoitteen ID:tä vastaavan elokuvan tietoja.
    const previewMovie = passedMovie && String(passedMovie.id) === id
        ? passedMovie
        : null

    const fetchedMovie = movie && String(movie.id) === id
        ? movie
        : null

    // Käytetään uusimpia tietoja tai kortin tietoja
    const displayedMovie = fetchedMovie ?? previewMovie

    const posterUrl = displayedMovie?.poster_path 
        ? `https://image.tmdb.org/t/p/w500${displayedMovie.poster_path}`
        : null

    return (
        <section className="movie-details">
            <Link to="/">Takaisin etusivulle</Link>

            {/* latausviesti siltä varalta jos näytettäviä tietoja ei ole */}
            {loading && !displayedMovie && (
                <p>Ladataan elokuvan tietoja...</p>
            )}

            {/* virhe ilmoitetaan myös silloin, kun kortin tiedot näkyy */ }
            {error && <p role="alert">{error}</p>}

            {/* näytetään tiedot onnistuneen haun jälkeen */}
            {displayedMovie && (
                <>
                    <h1>{displayedMovie.title}</h1>

                    {/* Julisteen tila varattu ennen latautumista */ }
                    <div className="movie-details-poster">
                        {posterUrl ? (
                            <img 
                                src={posterUrl}
                                alt={displayedMovie.title}
                                width="500"
                                height="750" />
                    ) : (
                        <p>Juliste puuttuu</p>
                    )}
                    </div>

                    <p>
                        Vuosi: {displayedMovie.release_date?.slice(0, 4) || 'Ei tiedossa'}
                    </p>

                    <p>
                        Arvosana: {displayedMovie.vote_average?.toFixed(1) ?? 'Ei tiedossa'}
                    </p>
                </>
            )}
        </section>
    )
}

export default MovieDetails