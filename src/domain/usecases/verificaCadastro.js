const { usecase, step, Ok, Err, checker, request, ifElse } = require("@herbsjs/herbs")
const ClientRepository = require("../../infra/database/clientRepository")
const Client = require("../entities/Client")
const { herbarium } = require("@herbsjs/herbarium")

const dependency = {
  clientRepository: ClientRepository,
}

const verificaCadastro = (injection) =>
  usecase("Verifica se o cliente está cadastrado e atualiza o cadastro", {
    request: request.from(Client, { ignoreIds: true, ignore: ["errors"] }),

    response: {
      estaCadastrado: Boolean,
      cliente: Client,
      cadastroAtualizado: Boolean,
    },

    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection)
      ctx.data = {}
    },

    "Verifica a requisição": step((ctx) => {
      const client = ctx.req

      if (!client.isValid()) return Err("Dados inválidos")

      return Ok()
    }),

    "Busca o cliente na base de dados": step(async (ctx) => {
      const client = ctx.req
      const clientRepository = new ctx.di.clientRepository()

      const clientFromDB = await clientRepository.find({
        filter: {
          chat_id: client.chat_id,
        },
      })

      if (checker.isEmpty(clientFromDB)) {
        ctx.ret.estaCadastrado = false
        return Ok(ctx.stop())
      }

      ctx.data.clientFromDB = clientFromDB[0]
      ctx.ret.estaCadastrado = true

      return Ok()
    }),

    "Verifica se o cadastro está atualizado, e atualiza caso não esteja": ifElse({
      "Cadastro está atualizado?": step((ctx) => {
        const { clientFromDB } = ctx.data

        if (clientFromDB.type === "undefined") return Ok(false)

        return Ok(true)
      }),

      "Então: Retorna o cadastro": step((ctx) => {
        const { clientFromDB } = ctx.data

        ctx.ret.cliente = clientFromDB

        return Ok()
      }),

      "Senão: Atualiza o cadastro": step(async (ctx) => {
        const cliente = ctx.req
        const { clientFromDB } = ctx.data
        const clientRepository = new ctx.di.clientRepository()

        const updatedClient = { ...clientFromDB, ...cliente }
        updatedClient.id = clientFromDB.id

        await clientRepository.update(updatedClient)

        ctx.ret.cliente = updatedClient
        ctx.ret.cadastroAtualizado = true

        return Ok()
      }),
    }),
  })

module.exports = herbarium.usecases
  .add(verificaCadastro, "VerificaCadastro")
  .metadata({ group: "Cadastro", entity: Client }).usecase
