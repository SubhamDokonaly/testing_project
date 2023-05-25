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

    validator.insertHoliday =
    [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.portCode').notEmpty().withMessage('Port Code cannot be empty'),
        check('data.*.name').notEmpty().withMessage('Name cannot be empty'),
        check('data.*.date').notEmpty().withMessage('Date cannot be empty'),
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

    validator.updateHoliday =
    [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.id').notEmpty().withMessage('Id cannot be empty'),
        check('data.*.portCode').notEmpty().withMessage('Port Code cannot be empty'),
        check('data.*.name').notEmpty().withMessage('Name cannot be empty'),
        check('data.*.date').notEmpty().withMessage('Date cannot be empty'),
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