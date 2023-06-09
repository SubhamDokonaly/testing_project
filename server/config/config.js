var path = require('path')
var fs = require('fs')
require("dotenv").config()
var config = JSON.parse(fs.readFileSync(path.join(__dirname, "/config.json"), 'utf8'))
var CONFIG = {}
CONFIG.ENV = (process.env.NODE_ENV || 'development');
CONFIG.PORT = (process.env.VCAP_APP_PORT || config.port);
CONFIG.MONGODB = config.mongodb
CONFIG.DB_URL = "mongodb+srv://subhamsidharth:2NoDZjzEUgRaFunQ@cluster0.f3bng.mongodb.net/SCHBANGQ?retryWrites=true&w=majority"
CONFIG.SECRET_KEY = process.env.SECRET_KEY
CONFIG.API_KEY = process.env.API_KEY
CONFIG.DB_KEY = process.env.DB_KEY
CONFIG.SITE_URL = process.env.SITE_URL
CONFIG.AZURESTORAGE = process.env.AZURESTORAGE
CONFIG.AZURECONNECTIONSTRING = process.env.AZURECONNECTIONSTRING
CONFIG.SMTP_HOST = process.env.SMTP_HOST
CONFIG.SMTP_PORT = process.env.SMTP_PORT
CONFIG.SMTP_AUTH = { user: process.env.SMTP_AUTH_USER, pass: process.env.SMTP_AUTH_PW } 


module.exports = CONFIG
