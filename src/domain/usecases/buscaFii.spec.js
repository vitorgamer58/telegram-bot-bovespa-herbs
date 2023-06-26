const { spec, scenario, given, check } = require("@herbsjs/aloe");
const { herbarium } = require("@herbsjs/herbarium");
const assert = require("assert");
const buscaFii = require("./buscaFii");
const { MFinanceMock } = require("../../../test/mocks/mFinanceMock");

const tickerForTest = "ABCD11";

const buscaFiiSpec = spec({
  usecase: buscaFii,

  "Deve responder com os dados do FII se ele existir": scenario({
    "Dado um FII válido": given({
      request: { ticker: tickerForTest },
      injection: {
        mfinance: new MFinanceMock(
          tickerForTest,
          {},
          {
            lastPrice: 100,
            dividendoMensal: 1,
          }
        ),
      },
    }),
    "Deve rodar sem erros": check((ctx) => {
      assert.ok(ctx.response.isOk);
    }),
    "Deve calcular os dados corretamente": check((ctx) => {
      assert.equal(ctx.response.ok.dividendos, "12.00");
    }),
  }),

  "Deve responder com erro se o FII for inválido": scenario({
    "Dado um FII inválido": given({
      request: { ticker: "a1" },
      injection: { mfinance: new MFinanceMock() },
    }),
    "Deve responder com erro": check((ctx) => {
      assert.ok(!ctx.response.isOk);
      assert.deepEqual(ctx.response.err, "Ticker inválido");
    }),
  }),
});

module.exports = herbarium.specs
  .add(buscaFiiSpec, "buscaFiiSpec")
  .metadata({ usecase: "BuscaFii" }).spec;
