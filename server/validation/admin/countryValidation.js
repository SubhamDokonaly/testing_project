//Imports
const { check, validationResult } = require('express-validator')

//User Validation
module.exports = function (app, io) {
    let data = { status: 0, response: 'Invalid Request' }, validator = {}

    validator.checkId = [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.id').notEmpty().withMessage('Id cannot be empty'),
        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;

                return res.send(data);
            }

            return next();
        }
    ]

    validator.insertCountry =
        [
            check('data').notEmpty().withMessage('Data cannot be empty'),
            check('data.*.countryName').notEmpty().trim().withMessage('Country Name cannot be empty'),
            check('data.*.countryCode').notEmpty().trim().withMessage('Country Code cannot be empty'),
            check('data.*.countryCode').isAlpha().isLength({ min: 2, max: 2 }).withMessage('Country Code should be Alphabets & Should be 2 char'),
            check('data.*.region').notEmpty().trim().withMessage('Region cannot be empty'),
            check('data.*.currency').notEmpty().trim().isAlpha().withMessage('Currency cannot be empty & Currency Format only Alfa '),
            check('data.*.currency').isLength({ min: 3, max: 3 }).withMessage('Currency Only accept 3 char.'),
            check('data.*.rate').notEmpty().trim().withMessage('Rate cannot be empty'),
            check('data.*.phCode').notEmpty().trim().withMessage('Phone Code cannot be empty'),
            check('data.*.phNumberFormat').notEmpty().trim().isNumeric().withMessage('Phone Number Format cannot be empty & should be Only Numeric'),
            check('data.*.createdBy').notEmpty().withMessage('Created By cannot be empty'),
            check('data.*.status').notEmpty().withMessage('Status cannot be empty'),
            (req, res, next) => {
                const errors = validationResult(req).array()
                if (errors.length > 0) {

                    return res.send({ status: 0, response: errors[0].msg })
                }

                return next()
            }
        ]

    validator.updateCountry =
        [
            check('data').notEmpty().withMessage('Id cannot be empty'),
            check('data.*.id').notEmpty().trim().withMessage('Id cannot be empty'),
            check('data.*.countryName').notEmpty().trim().withMessage('Country Name cannot be empty'),
            check('data.*.countryCode').notEmpty().trim().withMessage('Country Code cannot be empty'),
            check('data.*.countryCode').isAlpha().isLength({ min: 2, max: 2 }).withMessage('Country Code should be Alphabets & Should be 2 char'),
            check('data.*.region').notEmpty().trim().withMessage('Region cannot be empty'),
            check('data.*.currency').notEmpty().trim().withMessage('Currency cannot be empty'),
            check('data.*.rate').notEmpty().trim().withMessage('Rate cannot be empty'),
            check('data.*.phCode').notEmpty().trim().withMessage('Phone Code cannot be empty'),
            check('data.*.phNumberFormat').trim().notEmpty().withMessage('Phone Number Format cannot be empty'),
            check('data.*.createdBy').notEmpty().withMessage('Created By cannot be empty'),
            check('data.*.status').notEmpty().withMessage('Status cannot be empty'),
            (req, res, next) => {
                const errors = validationResult(req).array()
                if (errors.length > 0) {

                    return res.send({ status: 0, response: errors[0].msg })
                }

                return next()
            }
        ]

    return validator;
}