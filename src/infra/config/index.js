require("dotenv").config()

module.exports = {
  isDevelopment: process.env.ENVIROMENT == "development",
  token: process.env.TOKEN,
  ownerChatId: process.env.OWNER_CHAT_ID,
  cron: require("./cron"),
  database: require("./mongo"),
}
