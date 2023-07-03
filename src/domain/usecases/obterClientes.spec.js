const { spec, scenario, given, check } = require("@herbsjs/aloe");
const { herbarium } = require("@herbsjs/herbarium");
const { ClientRepositoryMock } = require("../../../test/mocks/clientRepositoryMock");
const obterClientes = require("./obterClientes");
const assert = require("assert");
const Client = require("../entities/Client");

const obterClientesSpec = spec({
  usecase: obterClientes,

  "Deve retornar a lista de clientes": scenario({
    "Dado injections válidas": given({
      request: {},
      injection: {
        clientRepository: ClientRepositoryMock,
      },
    }),
    "Deve rodar sem erros": check((ctx) => {
      assert.ok(ctx.response.isOk);
    }),
    "Deve retornar uma lista de clientes": check((ctx) => {
      assert.ok(ctx.response.ok.clientes[0] instanceof Client);
    }),
  }),

  "Deve retornar Err se houver um erro na camada de banco de dados": scenario({
    "Quando o banco de dados retornar exception": given({
      request: {},
      injection: {
        clientRepository: class {
          find() {
            throw Error("TIMEOUT");
          }
        },
      },
    }),
    "Deve retornar erro": check((ctx) => {
      assert.ok(ctx.response.isErr);
    }),
    "Mensagem de erro deve estar de acordo": check((ctx) => {
      assert.equal(ctx.response.err, "Erro na camada de banco de dados: TIMEOUT");
    }),
  }),

  "Não deve retornar erro se a resposta do banco for um array vazio": scenario({
    "Quando o banco de dados retornar um array vazio": given({
      request: {},
      injection: {
        clientRepository: class {
          find() {
            return [];
          }
        },
      },
    }),
    "Deve rodar sem erros": check((ctx) => {
      assert.ok(ctx.response.isOk);
    }),
  }),
});

module.exports = herbarium.specs
  .add(obterClientesSpec, "obterClientesSpec")
  .metadata({ usecase: "ObterClientes" }).spec;
