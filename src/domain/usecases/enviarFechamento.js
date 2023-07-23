const { usecase, step, Ok, Err } = require("@herbsjs/herbs")
const obterClientes = require("./obterClientes")
const fechamento = require("./fechamento")
const HandleBars = require("handlebars")
const { fechamentoTemplate } = require("../templates")
const { herbarium } = require("@herbsjs/herbarium")

const dependency = {
  obterClientes,
  fechamento,
}

const enviarFechamento = (injection) =>
  usecase("Envia o fechamento do dia para os clientes", {
    request: {},

    authorize: async () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection)
      ctx.data = {}
    },

    "Obtem a lista de clientes": step(async (ctx) => {
      const obterClientesUc = ctx.di.obterClientes()

      await obterClientesUc.authorize()

      const ucResponse = await obterClientesUc.run()

      if (ucResponse.isErr) return Err(ucResponse.err)

      ctx.data.clientes = ucResponse.ok.clientes

      return Ok()
    }),

    "Obtem o fechamento do dia": step(async (ctx) => {
      const fechamentoUc = ctx.di.fechamento()

      await fechamentoUc.authorize()

      const ucResponse = await fechamentoUc.run()

      if (ucResponse.isErr) return Err(ucResponse.err)

      ctx.data.fechamento = ucResponse.ok
      return Ok()
    }),

    "Constrói mensagem de fechamento": step((ctx) => {
      const { fechamento } = ctx.data

      const template = HandleBars.compile(fechamentoTemplate)
      const mensagem = template(fechamento)

      ctx.data.mensagem = mensagem

      return Ok()
    }),

    "Envia a mensagem de fechamento para todos os clientes": step(async (ctx) => {
      const { clientes, mensagem } = ctx.data
      const { bot } = ctx.di

      await Promise.all(
        clientes.map(async (cliente) => {
          try {
            await bot.telegram.sendMessage(cliente.chat_id, mensagem)
          } catch (error) {
            console.log(
              `Erro ao enviar mensagem para o cliente ${cliente.chat_id}: ${error.message}`
            )
          }
        })
      )

      return Ok()
    }),

    "Envia a mensagem de atualização do cadastro para todos os clientes com cadastro desatualizado":
      step(async (ctx) => {
        const { clientes } = ctx.data
        const { bot } = ctx.di

        const clientesNaoCadastrados = clientes.filter((cliente) => cliente.type === "undefined")

        const mensagem =
          "O bot foi atualizado, atualize o cadastro deste chat, basta usar o comando /cadastro"

        await Promise.all(
          clientesNaoCadastrados.map(async (cliente) => {
            try {
              await bot.telegram.sendMessage(cliente.chat_id, mensagem)
            } catch (error) {
              console.log(`Erro ao enviar mensagem para o cliente ${cliente.id}: ${error.mensagem}`)
            }
          })
        )

        return Ok()
      }),
  })

module.exports = herbarium.usecases
  .add(enviarFechamento, "EnviaFechamento")
  .metadata({ group: "Fechamento" }).usecase
