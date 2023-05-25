//Imports
const { check, validationResult } = require('express-validator')

//User Validation
module.exports = function(app, io) {
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

    validator.insertCfs =
    [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.countryName').notEmpty().withMessage('Country Name cannot be empty'),
        check('data.*.gateway').notEmpty().withMessage('Gateway cannot be empty'),
        check('data.*.destination').notEmpty().withMessage('Destination cannot be empty'),
        check('data.*.type').notEmpty().withMessage('Type cannot be empty'),
        check('data.*.cfsBranch').notEmpty().withMessage('CFS Branch cannot be empty'),
        check('data.*.cfsName').notEmpty().withMessage('CFS Name cannot be empty'),
        check('data.*.fullName').notEmpty().withMessage('fullName cannot be empty'),
        check('data.*.email').notEmpty().withMessage('email cannot be empty'),
        check('data.*.address').notEmpty().withMessage('address cannot be empty'),
        check('data.*.mobileNo').notEmpty().withMessage('mobileNo cannot be empty'),
        check('data.*.createdBy').notEmpty().withMessage('Created By cannot be empty'),
        (req, res, next) => {
            const errors = validationResult(req).array()
            if (errors.length > 0) {

                return res.send({ status: 0, response: errors[0].msg })
            }

            return next()
        }
    ]

    validator.updateCfs =
    [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.id').notEmpty().withMessage('Id cannot be empty'),
        check('data.*.countryName').notEmpty().withMessage('Country Name cannot be empty'),
        check('data.*.gateway').notEmpty().withMessage('Gateway cannot be empty'),
        check('data.*.destination').notEmpty().withMessage('Destination cannot be empty'),
        check('data.*.type').notEmpty().withMessage('Type cannot be empty'),
        check('data.*.cfsBranch').notEmpty().withMessage('CFS Branch cannot be empty'),
        check('data.*.cfsName').notEmpty().withMessage('CFS Name cannot be empty'),
        check('data.*.fullName').notEmpty().withMessage('fullName cannot be empty'),
        check('data.*.email').notEmpty().withMessage('email cannot be empty'),
        check('data.*.address').notEmpty().withMessage('address cannot be empty'),
        check('data.*.mobileNo').notEmpty().withMessage('mobileNo cannot be empty'),
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

    validator.updatePassword =
    [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.id').notEmpty().withMessage('Id cannot be empty'),
        check('data.*.password').notEmpty().withMessage('Password cannot be empty'),
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