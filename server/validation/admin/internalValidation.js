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

    validator.registerUser =
        [
            check('data').notEmpty().withMessage('Data cannot be empty'),
            check('data.*.fullName').notEmpty().withMessage('fullName cannot be empty'),
            check('data.*.designation').notEmpty().withMessage('Designation cannot be empty'),
            check('data.*.mobileCode').notEmpty().withMessage('Mobile Code cannot be empty'),
            check('data.*.mobileNumber').notEmpty().withMessage('Mobile Number cannot be empty'),
            check('data.*.email').notEmpty().withMessage('Email cannot be empty'),
            check('data.*.password').notEmpty().withMessage('Password cannot be empty'),
            (req, res, next) => {
                const errors = validationResult(req).array()
                if (errors.length > 0) {

                    return res.send({ status: 0, response: errors[0].msg })
                }

                return next()
            }
        ]

    validator.checkEmail =
        [
            check('data').notEmpty().withMessage('Data cannot be empty'),
            check('data.*.email').notEmpty().withMessage('Email cannot be empty'),
            (req, res, next) => {
                const errors = validationResult(req).array()
                if (errors.length > 0) {

                    return res.send({ status: 0, response: errors[0].msg })
                }

                return next()
            }
        ]

    validator.checkUserDetails =
        [
            check('data').notEmpty().withMessage('Data cannot be empty'),
            check('data.*.userId').notEmpty().withMessage('userId cannot be empty'),
            check('data.*.legalName').notEmpty().withMessage('legalName cannot be empty'),
            check('data.*.country').notEmpty().withMessage('country cannot be empty'),
            check('data.*.state').notEmpty().withMessage('state cannot be empty'),
            check('data.*.city').notEmpty().withMessage('city cannot be empty'),
            check('data.*.gstNumber').notEmpty().withMessage('gstNumber cannot be empty'),
            check('data.*.gstFilePath').notEmpty().withMessage('gstFilePath cannot be empty'),
            check('data.*.pan').notEmpty().withMessage('pan cannot be empty'),
            check('data.*.mto').notEmpty().withMessage('mto cannot be empty'),
            check('data.*.blCopyPath').notEmpty().withMessage('blCopyPath cannot be empty'),
            // check('data.*.createdBy').notEmpty().withMessage('createdBy cannot be empty'),
            (req, res, next) => {
                const errors = validationResult(req).array()
                if (errors.length > 0) {

                    return res.send({ status: 0, response: errors[0].msg })
                }

                return next()
            }
        ]

    validator.updateUserStatus =
        [
            check('data').notEmpty().withMessage('Data cannot be empty'),
            check('data.*.id').notEmpty().withMessage('id cannot be empty'),
            check('data.*.status').notEmpty().withMessage('Status cannot be empty'),
            check('data.*.reason').notEmpty().withMessage('Reason cannot be empty'),
            check('data.*.reason.message').notEmpty().withMessage('message cannot be empty'),
            check('data.*.reason.role').notEmpty().withMessage('role cannot be empty'),
            check('data.*.reason.time').notEmpty().withMessage('time cannot be empty'),
            check('data.*.reason.status').notEmpty().withMessage('status cannot be empty'),
            (req, res, next) => {
                const errors = validationResult(req).array()
                if (errors.length > 0) {

                    return res.send({ status: 0, response: errors[0].msg })
                }

                return next()
            }
        ]

    validator.forgotPassword = [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.id').notEmpty().withMessage('Id is required field'),
        check('data.*.password').notEmpty().withMessage('password is required field'),

        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;

                return res.send(data);
            }

            return next();
        }
    ]

    validator.checkChangePassword = [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.id').notEmpty().withMessage('Id is required field'),
        check('data.*.password').notEmpty().withMessage('password is required field'),
        check('data.*.currentPassword').notEmpty().withMessage('Currentpassword is required field'),
        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;

                return res.send(data);
            }

            return next();
        }
    ]

    validator.edituser =
        [
            check('data').notEmpty().withMessage('Data cannot be empty'),
            check('data.*.id').notEmpty().withMessage('id cannot be empty'),
            check('data.*.fullName').notEmpty().withMessage('fullName cannot be empty'),
            check('data.*.designation').notEmpty().withMessage('Designation cannot be empty'),
            check('data.*.mobileCode').notEmpty().withMessage('MobileCode cannot be empty'),
            check('data.*.mobileNumber').notEmpty().withMessage('Mobile Number cannot be empty'),
            check('data.*.email').notEmpty().withMessage('Email cannot be empty'),
            check('data.*.password').notEmpty().withMessage('Password cannot be empty'),
            (req, res, next) => {
                const errors = validationResult(req).array()
                if (errors.length > 0) {

                    return res.send({ status: 0, response: errors[0].msg })
                }

                return next()
            }
        ]

    validator.checkEditField =
        [
            check('data').notEmpty().withMessage('Data cannot be empty'),
            check('data.*.id').notEmpty().withMessage('id cannot be empty'),
            check('data.*.fullName').notEmpty().withMessage('fullName cannot be empty'),
            check('data.*.mobileNumber').notEmpty().withMessage('Mobile number cannot be empty'),
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