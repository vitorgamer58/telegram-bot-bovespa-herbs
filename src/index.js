require("dotenv").config();
const runBot = require("./infra/bot");
const cronJobs = require("./infra/cron");
const server = require("./infra/api/server");

const botInstance = runBot();

cronJobs(botInstance);

if (process.env.ENVIROMENT == "development") server.start();
