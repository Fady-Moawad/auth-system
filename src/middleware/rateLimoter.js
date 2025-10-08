const { rateLimit } = require('express-rate-limit')

const limiter = rateLimit({
    windowMs:2 * 24 * 60 * 60 * 1000, // 2 days
    max: 3, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message:  "Too many forget password attempts. Please try again after 2 days.",
})

module.exports = limiter