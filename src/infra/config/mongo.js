require("dotenv").config()

module.exports = {
  dbName: process.env.DATABASE_NAME,
  connectionString: process.env.CONNECTION_STRING,
}
