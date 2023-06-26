require("dotenv").config();
const runBot = require("./infra/bot");
const cronJobs = require("./infra/cron");

const botInstance = runBot();

cronJobs(botInstance);
