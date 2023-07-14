const { spec, scenario, given, check } = require("@herbsjs/aloe")
const { herbarium } = require("@herbsjs/herbarium")
const assert = require("assert")
const alteraCadastro = require("./alteraCadastro")
const Client = require("../entities/Client")

const alteraCadastroSpec = spec({
  usecase: alteraCadastro,

  "Deve cadastrar um cliente se este não estiver cadastrado": scenario({
    "Dado um usuário não cadastrado": given({
      request: Client.fromJSON({
        chat_id: 101010,
      }),
      injection: {
        clientRepository: class {
          find(_) {
            return []
          }

          insert(_) {
            return
          }
        },
      },
    }),
    "Deve rodar sem erros": check((ctx) => {
      assert.ok(ctx.response.isOk)
    }),
    "Deve cadastrar o cliente": check((ctx) => {
      assert.equal(ctx.response.ok.estavaCadastrado, false)
    }),
  }),

  "Deve descadastrar um cliente se este estiver cadastrado": scenario({
    "Dado um usuário cadastrado": given({
      request: Client.fromJSON({
        chat_id: 11121245,
      }),
      injection: {
        clientRepository: class {
          find(_) {
            return [
              Client.fromJSON({
                chat_id: 11121245,
                type: "Private",
              }),
            ]
          }

          delete(_) {
            return
          }
        },
      },
    }),
    "Deve rodar sem erros": check((ctx) => {
      assert.ok(ctx.response.isOk)
    }),
    "Deve descadastrar o cliente": check((ctx) => {
      assert.equal(ctx.response.ok.estavaCadastrado, true)
    }),
  }),
})

module.exports = herbarium.specs
  .add(alteraCadastroSpec, "alteraCadastroSpec")
  .metadata({ usecase: "AlteraCadastro" }).spec
