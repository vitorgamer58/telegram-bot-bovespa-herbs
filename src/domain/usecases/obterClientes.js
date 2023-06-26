const { usecase, step, Ok, Err, checker } = require("@herbsjs/herbs");
const ClientRepository = require("../../infra/database/clientRepository");
const { herbarium } = require("@herbsjs/herbarium");
const Client = require("../entities/client");

const dependency = {
  clientRepository: new ClientRepository(),
};

const obterClientes = (injection) =>
  usecase("Obter clientes", {
    request: {},

    response: [Client],

    authorize: () => Ok(),

    setup: (ctx) => (ctx.di = Object.assign({}, dependency, injection)),

    "Busca a lista de clientes e retorna": step(async (ctx) => {
      const { clientRepository } = ctx.di;

      const clients = await clientRepository.find({});

      if (checker.isEmpty(clients)) return Err("Erro ao obter lista de clientes");

      ctx.ret.clientes = clients;

      return Ok();
    }),
  });

module.exports = herbarium.usecases
  .add(obterClientes, "ObterClientes")
  .metadata({ group: "Cadastro", entity: Client }).usecase;
