const { rateLimit } = require('express-rate-limit')

const limiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 3, // Limit each IP to 100 requests per `window` (here, per 30 minutes)
    message: ["Too many login attempts. Please try again after 30 minutes."],
    skipSuccessfulRequests: true,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

module.exports = limiter