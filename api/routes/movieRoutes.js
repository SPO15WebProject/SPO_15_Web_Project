import { Router } from 'express'
import { getMovie, getMovieLogo } from '../controllers/movieController.js'

const router = Router()

router.get('/:id', getMovie)
router.get('/:id/logo', getMovieLogo)

export default router