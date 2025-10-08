const { body } = require('express-validator')

const validate = () => {
    return [
        body('name')
            .notEmpty()
            .withMessage("name is required!")
        , body('email')
            .notEmpty().withMessage("email is required!")
            .isEmail().withMessage("Invalid email format")

        , body("password")
            .notEmpty()
            .isLength({ min: 3 })
            .matches(/^(?=.*[!@#$%^&*])[A-Za-z\u0621-\u064A0-9!@#$%^&*]+$/)
            .withMessage("password at leats 3 chars")
    ]
}

module.exports = validate