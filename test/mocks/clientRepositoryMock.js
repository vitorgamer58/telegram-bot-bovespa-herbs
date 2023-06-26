const Client = require("../../src/domain/entities/client");

class ClientRepositoryMock {
  constructor() {}

  find({}) {
    return [{ chat_id: 1234 }].map((client) => Client.fromJSON(client));
  }
}

module.exports = { ClientRepositoryMock };
