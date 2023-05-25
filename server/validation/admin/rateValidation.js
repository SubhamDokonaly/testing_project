//Imports
const { check, validationResult } = require('express-validator')

//User Validation
module.exports = function (app, io) {
    let data = { status: 0, response: 'Invalid Request' }, validator = {}

    validator.insertRate =
        [
            check('data').notEmpty().withMessage('Data cannot be empty'),
            check('data.*.originCost').notEmpty().withMessage('originCost cannot be empty'),
            check('data.*.originCost.OCC').notEmpty().withMessage('originCost OCC cannot be empty'),
            check('data.*.originCost.OCFS').notEmpty().withMessage('originCost OCFC cannot be empty'),
            check('data.*.originCost.ODOC').notEmpty().withMessage('originCost ODOC cannot be empty'),
            check('data.*.scheduleInfo').notEmpty().withMessage('scheduleInfo cannot be empty'),
            check('data.*.scheduleInfo.pol').notEmpty().withMessage('scheduleInfo OCC cannot be empty'),
            check('data.*.scheduleInfo.pod').notEmpty().withMessage('scheduleInfo OCFC cannot be empty'),
            check('data.*.scheduleInfo.containerType').notEmpty().withMessage('scheduleInfo containerType cannot be empty'),
            check('data.*.scheduleInfo.weight').notEmpty().withMessage('scheduleInfo weight cannot be empty'),
            check('data.*.scheduleInfo.volume').notEmpty().withMessage('scheduleInfo volume cannot be empty'),
            check('data.*.originBE').notEmpty().withMessage('originBE cannot be empty'),
            check('data.*.originBE.OGBECBM').notEmpty().withMessage('originBE OGBECBM cannot be empty'),
            check('data.*.originBE.OMBECBM').notEmpty().withMessage('originBE OMBECBM cannot be empty'),
            check('data.*.originComparison').notEmpty().withMessage('originComparison cannot be empty'),
            check('data.*.originComparison.ROCFS').notEmpty().withMessage('originComparison ROCFS cannot be empty'),
            check('data.*.originComparison.RODOC').notEmpty().withMessage('originComparison RODOC cannot be empty'),
            check('data.*.originComparison.MROCFS').notEmpty().withMessage('originComparison MROCFS cannot be empty'),
            check('data.*.originComparison.MRODOC').notEmpty().withMessage('originComparison MRODOC cannot be empty'),
            check('data.*.freightCost').notEmpty().withMessage('freightCost cannot be empty'),
            check('data.*.freightCost.F').notEmpty().withMessage('freightCost F cannot be empty'),
            check('data.*.freightBE').notEmpty().withMessage('freightBE cannot be empty'),
            check('data.*.freightBE.FGBECBM').notEmpty().withMessage('freightBE FGBECBM cannot be empty'),
            check('data.*.freightBE.FMBECBM').notEmpty().withMessage('freightBE FMBECBM cannot be empty'),
            check('data.*.freightComparison').notEmpty().withMessage('freightComparison cannot be empty'),
            check('data.*.freightComparison.RF').notEmpty().withMessage('freightComparison RF cannot be empty'),
            check('data.*.freightComparison.MRF').notEmpty().withMessage('freightComparison MRF cannot be empty'),
            check('data.*.destinationCost').notEmpty().withMessage('destinationCost cannot be empty'),
            check('data.*.destinationCost.DCFS').notEmpty().withMessage('destinationCost DCFS cannot be empty'),
            check('data.*.destinationCost.DDO').notEmpty().withMessage('destinationCost DDO cannot be empty'),
            check('data.*.destinationCost.CDCFS').notEmpty().withMessage('destinationCost CDCFS cannot be empty'),
            check('data.*.destinationCost.CDDO').notEmpty().withMessage('destinationCost CDDO cannot be empty'),
            check('data.*.destinationBE').notEmpty().withMessage('destinationBE cannot be empty'),
            check('data.*.destinationBE.DGBECBM').notEmpty().withMessage('destinationBE DGBECBM cannot be empty'),
            check('data.*.destinationBE.DMBECBM').notEmpty().withMessage('destinationBE DMBECBM cannot be empty'),
            check('data.*.destinationComparison').notEmpty().withMessage('destinationComparison cannot be empty'),
            check('data.*.destinationComparison.RDCFS').notEmpty().withMessage('destinationComparison RDCFS cannot be empty'),
            check('data.*.destinationComparison.RDDO').notEmpty().withMessage('destinationComparison RDDO cannot be empty'),
            check('data.*.destinationComparison.MRDCFS').notEmpty().withMessage('destinationComparison MRDCFS cannot be empty'),
            check('data.*.destinationComparison.MRDDO').notEmpty().withMessage('destinationComparison MRDDO cannot be empty'),
            check('data.*.finalRates').notEmpty().withMessage('finalRates cannot be empty'),
            check('data.*.finalRates.FOCFS').notEmpty().withMessage('finalRates FOCFS cannot be empty'),
            check('data.*.finalRates.FODOC').notEmpty().withMessage('finalRates FODOC cannot be empty'),
            check('data.*.finalRates.FOT').notEmpty().withMessage('finalRates FOT cannot be empty'),
            check('data.*.finalRates.FF').notEmpty().withMessage('finalRates FF cannot be empty'),
            check('data.*.finalRates.FDCFS').notEmpty().withMessage('finalRates FDCFS cannot be empty'),
            check('data.*.finalRates.FDDO').notEmpty().withMessage('finalRates FDDO cannot be empty'),
            check('data.*.finalRates.FDT').notEmpty().withMessage('finalRates FDT cannot be empty'),
            check('data.*.savingRates').notEmpty().withMessage('savingRates cannot be empty'),
            check('data.*.savingRates.SOCFS').notEmpty().withMessage('savingRates SOCFS  Name cannot be empty'),
            check('data.*.savingRates.SODOC').notEmpty().withMessage('savingRates SODOC Name cannot be empty'),
            check('data.*.savingRates.SOT').notEmpty().withMessage('savingRates SOT Name cannot be empty'),
            check('data.*.savingRates.SF').notEmpty().withMessage('savingRates SF Name cannot be empty'),
            check('data.*.savingRates.SDCFS').notEmpty().withMessage('savingRates SDCFS Name cannot be empty'),
            check('data.*.savingRates.SDDO').notEmpty().withMessage('savingRates SDDO Name cannot be empty'),
            check('data.*.savingRates.SDT').notEmpty().withMessage('savingRates SDT Name cannot be empty'),
            check('data.*.predictionRates').notEmpty().withMessage('predictionRates cannot be empty'),
            check('data.*.predictionRates.POCFS').notEmpty().withMessage('predictionRates POCFS  Name cannot be empty'),
            check('data.*.predictionRates.PODOC').notEmpty().withMessage('predictionRates PODOC Name cannot be empty'),
            check('data.*.predictionRates.POT').notEmpty().withMessage('predictionRates POT Name cannot be empty'),
            check('data.*.predictionRates.PF').notEmpty().withMessage('predictionRates PF Name cannot be empty'),
            check('data.*.predictionRates.PDCFS').notEmpty().withMessage('predictionRates PDCFS Name cannot be empty'),
            check('data.*.predictionRates.PDDO').notEmpty().withMessage('predictionRates PDDO Name cannot be empty'),
            check('data.*.predictionRates.PDT').notEmpty().withMessage('predictionRates PDT Name cannot be empty'),
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

    validator.updateStatus =
        [
            check('data').notEmpty().withMessage('Data cannot be empty'),
            check('data.*.id').notEmpty().withMessage('id cannot be empty'),
            check('data.*.status').notEmpty().withMessage('Status cannot be empty'),
            (req, res, next) => {
                const errors = validationResult(req).array()
                if (errors.length > 0) {

                    return res.send({ status: 0, response: errors[0].msg })
                }

                return next()
            }
        ]

    validator.checkId =
        [
            check('data').notEmpty().withMessage('Data cannot be empty'),
            check('data.*.id').notEmpty().withMessage('id cannot be empty'),
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