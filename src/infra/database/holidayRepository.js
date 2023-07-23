const { Repository } = require("@herbsjs/herbs2mongo")
const connection = require("./connection")
const database = "clients_database"
const { herbarium } = require("@herbsjs/herbarium")
const Holiday = require("../../domain/entities/Holiday")

class HolidayRepository extends Repository {
  constructor() {
    super({
      entity: Holiday,
      collection: "holidays",
      database,
      ids: ["id"],
      mongodb: connection,
    })
  }
}

module.exports = herbarium.repositories
  .add(HolidayRepository, "HolidayRepository")
  .metadata({ entity: Holiday }).repository
