const { Repository } = require("@herbsjs/herbs2mongo")
const connection = require("./connection")
const Indice = require("../../domain/entities/Indice")
const database = "clients_database"
const { herbarium } = require("@herbsjs/herbarium")

class IndiceRepository extends Repository {
  constructor() {
    super({
      entity: Indice,
      collection: "indices",
      database,
      ids: ["id"],
      mongodb: connection,
    })
  }
}

module.exports = herbarium.repositories
  .add(IndiceRepository, "IndiceRepository")
  .metadata({ entity: Indice }).repository
