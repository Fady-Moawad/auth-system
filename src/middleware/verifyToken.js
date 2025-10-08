const jwt = require("jsonwebtoken");


const verifyToken = (req, res, next) => {
    const token = req.headers;
    if (!token) {
        res.status(400)
        return next('Token is required')
    }
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decode
        next()
    } catch (error) {
        next(error)
    }

}

const verifyTokenAndAuthrization = (req, res, next) => {
    verifyToken(req, res, () => {
        try {
            if (req.user.id !== req.params.id) {
                res.status(403)
                return next('You are not allowed')
            }
            next()
        } catch (error) {
            next(error)
        }
    })
}

const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role !== 'admin') {
            res.status(403)
            return next("You are not allowed")
        }
        next()

    })

}

module.exports = { verifyToken, verifyTokenAndAuthrization,verifyTokenAndAdmin }
