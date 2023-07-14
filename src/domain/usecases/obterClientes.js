const { usecase, step, Ok, Err } = require("@herbsjs/herbs")
const ClientRepository = require("../../infra/database/clientRepository")
const { herbarium } = require("@herbsjs/herbarium")
const Client = require("../entities/Client")

const dependency = {
  clientRepository: ClientRepository,
}

const obterClientes = (injection) =>
  usecase("Obter clientes", {
    request: {},

    response: {
      clientes: [Client],
    },

    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection)
    },

    "Busca a lista de clientes e retorna": step(async (ctx) => {
      try {
        const clientRepository = new ctx.di.clientRepository()

        const clients = await clientRepository.find({})

        ctx.ret.clientes = clients

        return Ok()
      } catch (error) {
        return Err(`Erro na camada de banco de dados: ${error.message}`)
      }
    }),
  })

module.exports = herbarium.usecases
  .add(obterClientes, "ObterClientes")
  .metadata({ group: "Cadastro", entity: Client }).usecase
