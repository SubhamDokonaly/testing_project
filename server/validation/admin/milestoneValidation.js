//Imports
const { check, validationResult } = require('express-validator')

//User Validation
module.exports = function (app, io) {
    let data = { status: 0, response: 'Invalid Request' }, validator = {}

    validator.checkId = [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.id').notEmpty().withMessage('Id is required field'),
        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;

                return res.send(data);
            }

            return next();
        }
    ]

    validator.checkScheduleId = [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.scheduleId').notEmpty().withMessage('scheduleId cannot be empty'),
        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;

                return res.send(data);
            }

            return next();
        }
    ]

    validator.updateMilestone = [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.bookingId').notEmpty().withMessage('bookingId cannot be empty'),
        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;

                return res.send(data);
            }

            return next();
        }
    ]
    
    validator.checkBookingId = [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.bookingId').notEmpty().withMessage('bookingId cannot be empty'),
        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;

                return res.send(data);
            }

            return next();
        }
    ]

    validator.checkGetBookingId = [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.bookingId').notEmpty().withMessage('bookingId cannot be empty'),
        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;

                return res.send(data);
            }

            return next();
        }
    ]


    return validator;
}