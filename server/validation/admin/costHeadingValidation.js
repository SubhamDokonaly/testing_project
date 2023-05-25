//Imports
const { check, validationResult } = require('express-validator')

//User Validation
module.exports = function(app, io) {
    let data = { status: 0, response: 'Invalid Request' }, validator = {}

    validator.checkId = [
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

    validator.insertCostHeading =
    [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.sacCode').trim().notEmpty().withMessage('Sac Code cannot be empty'),
        check('data.*.sacCode').trim().isNumeric().withMessage('Sac Code cannot be string'),
        check('data.*.sacCode').trim().isLength({ max: 6 }).withMessage('Sac Code must be of 6 digits maximum'),
        check('data.*.costHeading').trim().notEmpty().withMessage('Cost Heading cannot be empty'),
        check('data.*.country').notEmpty().withMessage('Country cannot be empty'),
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

    validator.updateCostHeading =
    [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.id').notEmpty().withMessage('Id cannot be empty'),
        check('data.*.sacCode').trim().notEmpty().withMessage('Sac Code cannot be empty'),
        check('data.*.sacCode').trim().isNumeric().withMessage('Sac Code cannot be string'),
        check('data.*.sacCode').trim().isLength({ max: 6 }).withMessage('Sac Code must be of 6 digits maximum'),
        check('data.*.costHeading').trim().notEmpty().withMessage('Cost Heading cannot be empty'),
        check('data.*.costHeading').trim().isAlpha().withMessage('Cost Heading cannot have numbers or special characters'),
        check('data.*.country').notEmpty().withMessage('Country cannot be empty'),
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