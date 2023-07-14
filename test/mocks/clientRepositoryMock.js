/* eslint-disable no-empty-pattern */
const Client = require("../../src/domain/entities/Client")

class ClientRepositoryMock {
  constructor() {}

  find({}) {
    return [{ chat_id: 1234 }].map((client) => Client.fromJSON(client))
  }
}

module.exports = { ClientRepositoryMock }
