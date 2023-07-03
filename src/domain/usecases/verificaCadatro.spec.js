const { spec, scenario, given, check } = require("@herbsjs/aloe");
const { herbarium } = require("@herbsjs/herbarium");
const assert = require("assert");
const verificaCadastro = require("./verificaCadastro");
const Client = require("../entities/Client");

const verificaCadastroSpec = spec({
  usecase: verificaCadastro,

  "Deve verificar se um usuário não está cadastrado": scenario({
    "Dado um usuário sem cadastro": given({
      request: Client.fromJSON({
        chat_id: 11121245,
      }),
      injection: {
        clientRepository: class {
          find(_) {
            return [];
          }
        },
      },
    }),
    "Deve rodar sem erros": check((ctx) => {
      assert.ok(ctx.response.isOk);
    }),
    "Deve retornar a informação de que ele não estava cadastrado": check((ctx) => {
      assert.equal(ctx.response.ok.estaCadastrado, false);
    }),
  }),

  "Deve atualizar um cadastro caso ele esteja desatualizado": scenario({
    "Dado um usuário sem cadastro": given({
      request: Client.fromJSON({
        chat_id: 11121245,
        type: "Private",
      }),
      injection: {
        clientRepository: class {
          find(_) {
            return [
              Client.fromJSON({
                chat_id: 11121245,
                type: "undefined",
              }),
            ];
          }

          update(_) {
            return;
          }
        },
      },
    }),
    "Deve rodar sem erros": check((ctx) => {
      assert.ok(ctx.response.isOk);
    }),
    "Deve retornar a informação de que ele esta cadastrado": check((ctx) => {
      assert.equal(ctx.response.ok.estaCadastrado, true);
    }),
    "Deve retornar a informação de que o cadastro foi atualizado": check((ctx) => {
      assert.equal(ctx.response.ok.cadastroAtualizado, true);
    }),
    "Deve retornar o cliente": check((ctx) => {
      assert.equal(typeof ctx.response.ok.cliente, "object");
      assert.equal(ctx.response.ok.cliente.type, "Private");
    }),
  }),
});

module.exports = herbarium.specs
  .add(verificaCadastroSpec, "verificaCadastroSpec")
  .metadata({ usecase: "VerificaCadastro" }).spec;
