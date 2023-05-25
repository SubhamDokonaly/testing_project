//Imports
const logger = require("../model/logger")(__filename)
const { ensureAuthorized } = require('../model/auth')

module.exports = (app) => {
    try {

        //User Validation
        const userValidation = require("../validation/user/userValidation")()

        //User Controllers
        const user = require("../controller/user/user")()

        //User APIs
        app.post('/user/register', userValidation.registerUser, user.register)
        app.post('/user/addUser', ensureAuthorized, userValidation.addUser, user.addSubUser)
        app.post('/user/getSubUsers', ensureAuthorized, userValidation.checkUserId, user.getSubUsers)
        app.post('/user/deleteUser', ensureAuthorized, userValidation.checkId, user.deleteUser)
        app.post('/user/login', userValidation.loginUser, user.login)
        app.post('/user/logout', userValidation.checkId, user.logout)
        app.post('/user/checkEmailExist', userValidation.checkEmail, user.checkEmailExist)
        app.post('/user/checkPanExist', userValidation.checkPan, user.checkPanExist)
        app.post('/user/checkGstExist', userValidation.checkGst, user.checkGstExist)
        app.post('/user/checkMtoExist', userValidation.checkMto, user.checkMtoExist)
        app.post('/user/checkForgotPassword', userValidation.checkEmail, user.checkEmailForgotPwd)
        app.post('/user/getUserMailbyId', userValidation.checkId, user.getUserEmailbyId)
        app.post('/user/getAllUsers', ensureAuthorized, user.getAllUsers)
        app.get('/user/getInternalUsers', ensureAuthorized, user.getInternalUsers)
        app.post('/user/getTeamDetails', ensureAuthorized, userValidation.checkId, user.getTeamDetails)
        app.post('/user/verifyOtp', userValidation.checkOtp, user.verifyOtp)
        app.post('/user/resendOtp', userValidation.checkId, user.resendOtp)
        app.post('/user/forgotpasswordmail', userValidation.checkEmail, user.forgotPassword)
        app.post('/user/changeForgotPassword', userValidation.forgotPassword, user.changeForgotPassword)
        app.post('/user/createSubUserPassword', userValidation.forgotPassword, user.createSubUserPassword)
        app.post('/user/changePassword', ensureAuthorized, userValidation.checkChangePassword, user.changePassword)
        app.post('/user/getUserById', userValidation.checkId, user.getUserDataById)
        app.post('/user/userUpdate', userValidation.edituser, user.editUserById)
        app.post('/user/userEditField', ensureAuthorized, userValidation.checkEditField, user.editUserField)

        //User Details APIs
        app.post('/user/addUserDetails', userValidation.checkUserDetails, user.addUserDetails)
        app.post('/user/updateUserStatus', userValidation.updateUserStatus, user.updateUserStatusById)
        app.post('/user/updateUserDetails', ensureAuthorized, userValidation.checkUserDetails, user.editUserDetail)
        app.post('/user/getCountryCityList', ensureAuthorized, user.getCountryCityList)
        app.post('/user/userPreferredGateway', ensureAuthorized, userValidation.userGateway, user.userPreferredGateway)

    } catch (e) {
        logger.error(`Error in user route: ${e.message}`)
    }
};