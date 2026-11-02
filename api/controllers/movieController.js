import axios from 'axios'

const tmdb = () =>
  axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    headers: { Authorization: `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}` },
  })

export const getMovie = async (req, res) => {
  try {
    const { data } = await tmdb().get(`/movie/${req.params.id}`)
    res.json(data)
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.message })
  }
}

export const getMovieLogo = async (req, res) => {
  try {
    const { data } = await tmdb().get(`/movie/${req.params.id}/images`)
    const logo = data.logos?.[0]
    if (!logo) return res.status(404).json({ message: 'No logo found' })
    res.json({ url: `https://image.tmdb.org/t/p/original${logo.file_path}` })
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.message })
  }
}