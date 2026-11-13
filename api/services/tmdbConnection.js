import axios from 'axios'

// Luodaan yhteinen yhteys TMDB:n rajapintaan.
export const tmdb = () =>
  axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    headers: { Authorization: `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}` },
  })