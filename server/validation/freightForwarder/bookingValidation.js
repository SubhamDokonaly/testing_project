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

    validator.checkDataId = [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.id').notEmpty().withMessage('Id is required field'),
        check('data.*.scheduleId').notEmpty().withMessage('scheduleId is required field'),
        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;

                return res.send(data);
            }

            return next();
        }
    ]
    validator.searchBooking = [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.pol').notEmpty().withMessage('pol cannot be empty'),
        check('data.*.pod').notEmpty().withMessage('pod cannot be empty'),
        check('data.*.status').notEmpty().withMessage('status cannot be empty'),
        check('data.*.createdBy').notEmpty().withMessage('createdBy cannot be empty'),
        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;

                return res.send(data);
            }

            return next();
        }
    ]

    validator.checkUpdate = [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.bookingId').notEmpty().withMessage('bookingId cannot be empty'),
        check('data.*.status').notEmpty().withMessage('status cannot be empty'),
        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;

                return res.send(data);
            }

            return next();
        }
    ]


    validator.save =
        [
            check('data').notEmpty().withMessage('Data cannot be empty'),
            check('data.*.scheduleId').notEmpty().withMessage('scheduleId cannot be empty'),
            check('data.*.cargoDetails').notEmpty().withMessage('cargoDetails cannot be empty'),
            check('data.*.cargoType').notEmpty().withMessage('cargoType cannot be empty'),
            check('data.*.totalCbm').notEmpty().withMessage('totalCbm cannot be empty'),
            check('data.*.totalWt').notEmpty().withMessage('totalWt cannot be empty'),
            check('data.*.legalName').notEmpty().withMessage('legalName cannot be empty'),
            check('data.*.companyName').notEmpty().withMessage('companyName cannot be empty'),
            check('data.*.totalPrice').notEmpty().withMessage('totalPrice cannot be empty'),
            check('data.*.status').notEmpty().withMessage('status cannot be empty'),
            check('data.*.createdBy').notEmpty().withMessage('createdBy cannot be empty'),
            (req, res, next) => {
                const errors = validationResult(req).array()
                if (errors.length > 0) {

                    return res.send({ status: 0, response: errors[0].msg })
                }

                return next()
            }
        ]

    validator.saveOF =
        [
            check('data').notEmpty().withMessage('Data cannot be empty'),
            check('data.*.bookingId').notEmpty().withMessage('bookingId cannot be empty'),
            check('data.*.name').notEmpty().withMessage('name cannot be empty'),
            check('data.*.email').notEmpty().withMessage('email cannot be empty'),
            check('data.*.mobile').notEmpty().withMessage('mobile cannot be empty'),
            check('data.*.legalName').notEmpty().withMessage('legalName cannot be empty'),
            check('data.*.companyName').notEmpty().withMessage('companyName cannot be empty'),
            check('data.*.doorNo').notEmpty().withMessage('doorNo cannot be empty'),
            check('data.*.building').notEmpty().withMessage('building cannot be empty'),
            check('data.*.street').notEmpty().withMessage('street cannot be empty'),
            check('data.*.area').notEmpty().withMessage('area cannot be empty'),
            check('data.*.city').notEmpty().withMessage('city cannot be empty'),
            check('data.*.state').notEmpty().withMessage('state cannot be empty'),
            check('data.*.country').notEmpty().withMessage('country cannot be empty'),
            check('data.*.gstName').notEmpty().withMessage('gstName cannot be empty'),
            check('data.*.gstPath').notEmpty().withMessage('gstPath cannot be empty'),
            check('data.*.hblName').notEmpty().withMessage('hblName cannot be empty'),
            check('data.*.saveFlag').notEmpty().withMessage('saveFlag cannot be empty'),
            check('data.*.status').notEmpty().withMessage('status cannot be empty'),
            check('data.*.saveFlag').notEmpty().withMessage('saveFlag cannot be empty'),
            check('data.*.createdBy').notEmpty().withMessage('createdBy cannot be empty'),
            (req, res, next) => {
                const errors = validationResult(req).array()
                if (errors.length > 0) {

                    return res.send({ status: 0, response: errors[0].msg })
                }

                return next()
            }
        ]

    validator.saveDF =
        [
            check('data').notEmpty().withMessage('Data cannot be empty'),
            check('data.*.bookingId').notEmpty().withMessage('bookingId cannot be empty'),
            check('data.*.name').notEmpty().withMessage('name cannot be empty'),
            check('data.*.email').notEmpty().withMessage('email cannot be empty'),
            check('data.*.mobile').notEmpty().withMessage('mobile cannot be empty'),
            check('data.*.legalName').notEmpty().withMessage('legalName cannot be empty'),
            check('data.*.companyName').notEmpty().withMessage('companyName cannot be empty'),
            check('data.*.doorNo').notEmpty().withMessage('doorNo cannot be empty'),
            check('data.*.building').notEmpty().withMessage('building cannot be empty'),
            check('data.*.street').notEmpty().withMessage('street cannot be empty'),
            check('data.*.area').notEmpty().withMessage('area cannot be empty'),
            check('data.*.city').notEmpty().withMessage('city cannot be empty'),
            check('data.*.state').notEmpty().withMessage('state cannot be empty'),
            check('data.*.country').notEmpty().withMessage('country cannot be empty'),
            check('data.*.saveFlag').notEmpty().withMessage('saveFlag cannot be empty'),
            check('data.*.status').notEmpty().withMessage('status cannot be empty'),
            check('data.*.saveFlag').notEmpty().withMessage('saveFlag cannot be empty'),
            check('data.*.createdBy').notEmpty().withMessage('createdBy cannot be empty'),
            (req, res, next) => {
                const errors = validationResult(req).array()
                if (errors.length > 0) {

                    return res.send({ status: 0, response: errors[0].msg })
                }

                return next()
            }
        ]

    validator.saveNP =
        [
            check('data').notEmpty().withMessage('Data cannot be empty'),
            check('data.*.bookingId').notEmpty().withMessage('bookingId cannot be empty'),
            check('data.*.name').notEmpty().withMessage('name cannot be empty'),
            check('data.*.email').notEmpty().withMessage('email cannot be empty'),
            check('data.*.mobile').notEmpty().withMessage('mobile cannot be empty'),
            check('data.*.legalName').notEmpty().withMessage('legalName cannot be empty'),
            check('data.*.companyName').notEmpty().withMessage('companyName cannot be empty'),
            check('data.*.doorNo').notEmpty().withMessage('doorNo cannot be empty'),
            check('data.*.building').notEmpty().withMessage('building cannot be empty'),
            check('data.*.street').notEmpty().withMessage('street cannot be empty'),
            check('data.*.area').notEmpty().withMessage('area cannot be empty'),
            check('data.*.city').notEmpty().withMessage('city cannot be empty'),
            check('data.*.state').notEmpty().withMessage('state cannot be empty'),
            check('data.*.country').notEmpty().withMessage('country cannot be empty'),
            check('data.*.saveFlag').notEmpty().withMessage('saveFlag cannot be empty'),
            check('data.*.status').notEmpty().withMessage('status cannot be empty'),
            check('data.*.saveFlag').notEmpty().withMessage('saveFlag cannot be empty'),
            check('data.*.createdBy').notEmpty().withMessage('createdBy cannot be empty'),
            (req, res, next) => {
                const errors = validationResult(req).array()
                if (errors.length > 0) {

                    return res.send({ status: 0, response: errors[0].msg })
                }

                return next()
            }
        ]

    validator.saveDocs =
        [
            check('data').notEmpty().withMessage('Data cannot be empty'),
            check('data.*.bookingId').notEmpty().withMessage('bookingId cannot be empty'),
            check('data.*.packingList').notEmpty().withMessage('packingList cannot be empty'),
            check('data.*.legalName').notEmpty().withMessage('legalName cannot be empty'),
            check('data.*.status').notEmpty().withMessage('status cannot be empty'),
            check('data.*.createdBy').notEmpty().withMessage('createdBy cannot be empty'),
            (req, res, next) => {
                const errors = validationResult(req).array()
                if (errors.length > 0) {

                    return res.send({ status: 0, response: errors[0].msg })
                }

                return next()
            }
        ]

    validator.saveCheckoutDetails =
        [
            check('data').notEmpty().withMessage('Data cannot be empty'),
            check('data.*.cargoDetails').notEmpty().withMessage('cargo Details cannot be empty'),
            check('data.*.shipperDetails').notEmpty().withMessage('shipper Details cannot be empty'),
            check('data.*.consigneeDetails').notEmpty().withMessage('consignee Details cannot be empty'),
            check('data.*.notifyPartyDetails').notEmpty().withMessage('notify Party Details cannot be empty'),
            check('data.*.legalName').notEmpty().withMessage('legalName cannot be empty'),
            check('data.*.bookingDocsDetails').notEmpty().withMessage('booking Docs Details cannot be empty'),
            check('data.*.status').notEmpty().withMessage('status cannot be empty'),
            check('data.*.createdBy').notEmpty().withMessage('createdBy cannot be empty'),
            (req, res, next) => {
                const errors = validationResult(req).array()
                if (errors.length > 0) {

                    return res.send({ status: 0, response: errors[0].msg })
                }

                return next()
            }
        ]

    validator.checkLegalName = [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.legalName').notEmpty().withMessage('legalName is required field'),
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