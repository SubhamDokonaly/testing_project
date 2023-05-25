//Imports
const { check, validationResult } = require('express-validator')

//User Validation
module.exports = function(app, io) {
    let data = { status: 0, response: 'Invalid Request' }, validator = {}

    validator.checkId = [
        check('data').notEmpty().withMessage('data cannot be empty'),
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

    validator.insertLane =
    [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.portName').notEmpty().withMessage('Port Name cannot be empty'),
        check('data.*.portCode').trim().notEmpty().withMessage('Port Code cannot be empty'),
        check('data.*.portCode').trim().isAlpha().withMessage('Port Code cannot have numbers or special characters'),
        check('data.*.portCode').trim().isLength({ min: 5, max: 5 }).withMessage('Port Code must be of 5 characters'),
        check('data.*.type').notEmpty().withMessage('Type cannot be empty'),
        check('data.*.country').notEmpty().withMessage('Country cannot be empty'),
        check('data.*.fee').notEmpty().withMessage('Fee cannot be empty'),
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

    validator.updateLane =
    [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.id').notEmpty().withMessage('Id cannot be empty'),
        check('data.*.portName').notEmpty().withMessage('Port Name cannot be empty'),
        check('data.*.portCode').trim().notEmpty().withMessage('Port Code cannot be empty'),
        check('data.*.portCode').trim().isAlpha().withMessage('Port Code cannot have numbers or special characters'),
        check('data.*.portCode').trim().isLength({ min: 5, max: 5 }).withMessage('Port Code must be of 5 characters'),
        check('data.*.type').notEmpty().withMessage('Type cannot be empty'),
        check('data.*.country').notEmpty().withMessage('Country cannot be empty'),
        check('data.*.fee').notEmpty().withMessage('Fee cannot be empty'),
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