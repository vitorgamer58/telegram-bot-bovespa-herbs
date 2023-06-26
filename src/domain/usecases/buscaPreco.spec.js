const { spec, scenario, given, check } = require("@herbsjs/aloe");
const { herbarium } = require("@herbsjs/herbarium");
const assert = require("assert");
const buscaPreco = require("./buscaPreco");
const { MFinanceMock } = require("../../../test/mocks/mFinanceMock");

const tickerForTest = "ABCD3";

const buscaPrecoSpec = spec({
  usecase: buscaPreco,

  "Deve responder com os dados da ação se ela existir": scenario({
    "Dado uma ação válida": given({
      request: { ticker: tickerForTest },
      injection: {
        mfinance: new MFinanceMock(tickerForTest, {
          lastPrice: 100,
        }),
      },
    }),
    "Deve rodar sem erros": check((ctx) => {
      assert.ok(ctx.response.isOk);
    }),
  }),

  "Deve responder com erro se a ação for inválida": scenario({
    "Dado uma ação inválida": given({
      request: { ticker: "a1" },
      injection: {
        mfinance: new MFinanceMock(tickerForTest, {
          lastPrice: 100,
        }),
      },
    }),
    "Deve responder com erro": check((ctx) => {
      assert.ok(!ctx.response.isOk);
      assert.deepEqual(ctx.response.err, "Ticker inválido");
    }),
  }),
});

module.exports = herbarium.specs
  .add(buscaPrecoSpec, "buscaPrecoSpec")
  .metadata({ usecase: "BuscaPreco" }).spec;
