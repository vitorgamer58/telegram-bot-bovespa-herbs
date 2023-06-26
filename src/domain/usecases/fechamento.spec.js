const { spec, scenario, given, check } = require("@herbsjs/aloe");
const { Err } = require("@herbsjs/herbs");
const { herbarium } = require("@herbsjs/herbarium");
const assert = require("assert");
const fechamento = require("./fechamento");
const { MFinanceMock } = require("../../../test/mocks/mFinanceMock");
const { IndiceRepositoryMock } = require("../../../test/mocks/indiceRepositoryMock");

const fechamentoSpec = spec({
  usecase: fechamento,

  "Deve buscar fechamento do dia": scenario({
    "Dado um dia útil": given({
      request: {},
      injection: {
        mfinance: new MFinanceMock(),
        indiceRepository: new IndiceRepositoryMock(),
        date: new Date(2023, 5, 21),
      },
    }),
    "Deve rodar sem erros": check((ctx) => {
      assert.ok(ctx.response.isOk);
    }),
  }),

  "Não deve buscar o fechamento do dia se não for dia útil": scenario({
    "Dado um dia não útil": given({
      request: {},
      injection: {
        mfinance: new MFinanceMock(),
        indiceRepository: new IndiceRepositoryMock(),
        date: new Date(2023, 5, 25),
      },
    }),
    "Deve retornar erro": check((ctx) => {
      assert.ok(ctx.response.isErr);
      assert.equal(ctx.response.err, "Hoje não é um dia útil");
    }),
  }),

  "Não deve buscar o fechamento se não for possível obter os índices": scenario({
    "Dado um erro no indiceRepository": given({
      request: {},
      injection: {
        mfinance: new MFinanceMock(),
        indiceRepository: new (class {
          find() {
            throw new Error();
          }
        })(),
        date: new Date(2023, 5, 21),
      },
    }),
    "Deve retornar erro": check((ctx) => {
      assert.ok(ctx.response.isErr);
      assert.equal(ctx.response.err, "Erro no banco de dados");
    }),
  }),

  "Não deve buscar o fechamento se não for possível obter a lista de ações": scenario({
    "Dado um erro na API MFinance": given({
      request: {},
      injection: {
        mfinance: new (class {
          buscarTodasAcoes() {
            return Err("Erro ao se conectar com a API");
          }
        })(),
        indiceRepository: new IndiceRepositoryMock(),
        date: new Date(2023, 5, 21),
      },
    }),
    "Deve retornar erro": check((ctx) => {
      assert.ok(ctx.response.isErr);
      assert.equal(ctx.response.err, "Não foi possível obter a lista de ações");
    }),
  }),
});

module.exports = herbarium.specs.add(fechamentoSpec, "fechamentoSpec").spec;
