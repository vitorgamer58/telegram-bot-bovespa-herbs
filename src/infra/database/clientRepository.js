const { Repository } = require("@herbsjs/herbs2mongo");
const connection = require("./connection");
const Client = require("../../domain/entities/client");
const { herbarium } = require("@herbsjs/herbarium");
const BotDataMapper = require("./dataMapper");

const database = "clients_database";

class ClientRepository extends Repository {
  constructor() {
    super({
      entity: Client,
      collection: "clients_collection",
      database,
      ids: ["id"],
      mongodb: connection,
    });

    this.dataMapper = new BotDataMapper(this.entity, this.entityIDs);
  }
}

module.exports = herbarium.repositories
  .add(ClientRepository, "ClientRepository")
  .metadata({ entity: Client }).repository;
