//Imports
const { check, validationResult } = require('express-validator')

//User Validation
module.exports = function (app, io) {
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

    validator.insertSchedule =
        [
            check('data').notEmpty().withMessage('Data cannot be empty'),
            check('data.*.pol').notEmpty().withMessage('pol cannot be empty'),
            check('data.*.pod').notEmpty().withMessage('pod cannot be empty'),
            check('data.*.container').notEmpty().withMessage('container cannot be empty'),
            check('data.*.volume').notEmpty().withMessage('volume cannot be empty'),
            check('data.*.weight').notEmpty().withMessage('weight cannot be empty'),
            check('data.*.vessel').notEmpty().withMessage('vessel cannot be empty'),
            check('data.*.voyage').notEmpty().withMessage('voyage cannot be empty'),
            check('data.*.etd').notEmpty().withMessage('etd cannot be empty'),
            check('data.*.eta').notEmpty().withMessage('eta cannot be empty'),
            check('data.*.bookingCutOff').notEmpty().withMessage('bookingCutOff cannot be empty'),
            check('data.*.originCfsCutOff').notEmpty().withMessage('originCfsCutOff cannot be empty'),
            check('data.*.destinationCfsCutOff').notEmpty().withMessage('destinationCfsCutOff cannot be empty'),
            check('data.*.originCfsName').notEmpty().withMessage('origin Cfs Name cannot be empty'),
            check('data.*.originCfsBranch').notEmpty().withMessage('origin Cfs Branch cannot be empty'),
            check('data.*.destinationCfsName').notEmpty().withMessage('destination Cfs Name cannot be empty'),
            check('data.*.destinationCfsBranch').notEmpty().withMessage('destination Cfs Branch cannot be empty'),
            check('data.*.originCfsClosingtime').notEmpty().withMessage('origin Cfs Closing time cannot be empty'),
            check('data.*.destinationCfsClosingtime').notEmpty().withMessage('destination Cfs Closing time cannot be empty'),
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

    validator.updateSchedule =
        [
            check('data').notEmpty().withMessage('Id cannot be empty'),
            check('data.*.id').notEmpty().withMessage('Id cannot be empty'),
            check('data.*.scheduleId').notEmpty().withMessage('scheduleId cannot be empty'),
            check('data.*.pol').notEmpty().withMessage('pol cannot be empty'),
            check('data.*.pod').notEmpty().withMessage('pod cannot be empty'),
            check('data.*.container').notEmpty().withMessage('container cannot be empty'),
            check('data.*.volume').notEmpty().withMessage('volume cannot be empty'),
            check('data.*.weight').notEmpty().withMessage('weight cannot be empty'),
            check('data.*.vessel').notEmpty().withMessage('vessel cannot be empty'),
            check('data.*.voyage').notEmpty().withMessage('voyage cannot be empty'),
            check('data.*.etd').notEmpty().withMessage('etd cannot be empty'),
            check('data.*.eta').notEmpty().withMessage('eta cannot be empty'),
            check('data.*.bookingCutOff').notEmpty().withMessage('bookingCutOff cannot be empty'),
            check('data.*.originCfsCutOff').notEmpty().withMessage('originCfsCutOff cannot be empty'),
            check('data.*.destinationCfsCutOff').notEmpty().withMessage('destinationCfsCutOff cannot be empty'),
            check('data.*.originCfsName').notEmpty().withMessage('origin Cfs Name cannot be empty'),
            check('data.*.originCfsBranch').notEmpty().withMessage('origin Cfs Branch cannot be empty'),
            check('data.*.destinationCfsName').notEmpty().withMessage('destination Cfs Name cannot be empty'),
            check('data.*.destinationCfsBranch').notEmpty().withMessage('destination Cfs Branch cannot be empty'),
            check('data.*.originCfsClosingtime').notEmpty().withMessage('origin Cfs Closing time cannot be empty'),
            check('data.*.destinationCfsClosingtime').notEmpty().withMessage('destination Cfs Closing time cannot be empty'),
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