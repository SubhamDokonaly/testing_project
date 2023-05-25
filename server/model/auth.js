"use strict";
const jwt = require("jsonwebtoken")
const CONFIG = require("../config/config")
const db = require("../model/mongodb")
const { ObjectId } = require("bson")
const logger = require("../model/logger")(__filename)

module.exports.ensureAuthorized = (req, res, next) => {
    let token, decodedToken, checkAuth

    if (req.headers.authorization && req.headers.authorization !== '' && req.headers.authorization !== null) {
        token = req.headers.authorization
        token = token.substring(7)
    }
    decodedToken = jwt.decode(token);

    if (token && decodedToken.type === 1) {
        jwt.verify(token, CONFIG.SECRET_KEY, async (err, decoded) => {
            if (Date.now() > (decodedToken.exp) * 1000) {
                return res.status(440).send("Session expired! Please login again.")//​​440 Login Timeout
            } else {
                if (err || !decoded) {
                    res.status(401).send("Unauthorized Access");
                } else {
                    try {
                        checkAuth = await db.findSingleDocument("user", {
                            _id: new ObjectId(decoded.userId),
                            role: decoded.role,
                            status: { $in: [1, 2, 5] },
                        })
                        if (checkAuth === null && Object.keys(checkAuth).length === 0) {
                            res.status(401).send("Unauthorized Access");
                        } else {
                            if (checkAuth !== undefined && checkAuth !== null) {
                                req.params.loginId = checkAuth._id
                                req.params.loginData = checkAuth
                                next()
                            } else {
                                res.status(404).send("User Not Found");
                            }
                        }
                    } catch (e) {
                        logger.error(`Error in user route - authorization: ${e.message}`)
                        res.status(401).send("Unauthorized Access");
                    }
                }
            }
        });
    } else if (token && decodedToken.type === 2) {
        jwt.verify(token, CONFIG.SECRET_KEY, async (err, decoded) => {
            if (Date.now() > (decodedToken.exp) * 1000) {
                return res.status(440).send("Session expired! Please login again.")//​​440 Login Timeout
            } else {
                if (err || !decoded) {
                    res.status(401).send("Unauthorized Access");
                } else {
                    try {
                        checkAuth = await db.findSingleDocument("cfs", {
                            _id: new ObjectId(decoded.userId),
                            role: decoded.role,
                            status: { $in: [1] },
                        })
                        if (checkAuth === null && Object.keys(checkAuth).length === 0) {
                            res.status(401).send("Unauthorized Access");
                        } else {
                            if (checkAuth !== undefined && checkAuth !== null) {
                                req.params.loginId = checkAuth._id
                                req.params.loginData = checkAuth
                                next()
                            } else {
                                res.status(404).send("User Not Found");
                            }
                        }
                    } catch (e) {
                        logger.error(`Error in user route - authorization: ${e.message}`)
                        res.status(401).send("Unauthorized Access");
                    }
                }
            }
        });
    } else if (token && decodedToken.type === 3) {
        jwt.verify(token, CONFIG.SECRET_KEY, async (err, decoded) => {
            if (Date.now() > (decodedToken.exp) * 1000) {
                return res.status(440).send("Session expired! Please login again.")//​​440 Login Timeout
            } else {
                if (err || !decoded) {
                    res.status(401).send("Unauthorized Access");
                } else {
                    try {
                        checkAuth = await db.findSingleDocument("internal", {
                            _id: new ObjectId(decoded.userId),
                            role: decoded.role,
                            status: { $in: [1] },
                        })
                        if (checkAuth === null && Object.keys(checkAuth).length === 0) {
                            res.status(401).send("Unauthorized Access");
                        } else {
                            if (checkAuth !== undefined && checkAuth !== null) {
                                req.params.loginId = checkAuth._id
                                req.params.loginData = checkAuth
                                next()
                            } else {
                                res.status(404).send("User Not Found");
                            }
                        }
                    } catch (e) {
                        logger.error(`Error in user route - authorization: ${e.message}`)
                        res.status(401).send("Unauthorized Access");
                    }
                }
            }
        });
    } else {
        res.status(401).send("Unauthorized Access");
    }
}

