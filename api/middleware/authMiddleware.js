import jwt from 'jsonwebtoken'

//Middleware tarkistaa käyttäjän JWT-tokenin
//ennenkuin pääsy suojattuihin reitteihin sallitaan.

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token //Luetaan JWT-token selaimen lähettämästä cookiesta.

    if (!token) {
        return res.status(401).json({
            error: 'Kirjautuminen vaaditaan.'
        })
    }

    try {
        const decoded = jwt.verify( //Tarkistetaan JWT-tokenin aitous ja voimassaolo.
            token,
            process.env.JWT_SECRET
        )

        req.user = decoded //Käyttäjän tiedot tallennetaan request-objektiin.

        next()
    } catch (error) {
        return res.status(401).json({
            error: 'Virheellinen token'
        })
    }
}

export default authMiddleware