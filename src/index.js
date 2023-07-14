require("dotenv").config()
const runBot = require("./infra/bot")
const cronJobs = require("./infra/cron")
const server = require("./infra/api/server")
const config = require("./infra/config")

const botInstance = runBot()

cronJobs(botInstance)

if (config.isDevelopment) server.start()
