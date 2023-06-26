const { spec, scenario, given, check } = require("@herbsjs/aloe");
const { herbarium } = require("@herbsjs/herbarium");
const assert = require("assert");
const calcularPrecoJusto = require("./calcularPrecoJusto");
const { MFinanceMock } = require("../../../test/mocks/mFinanceMock");

const TickerForTest = "ABCD3";

const calculaPrecoJustoSpec = spec({
  usecase: calcularPrecoJusto,

  "Deve calcular o preço justo": scenario({
    "Dado uma ação válida": given({
      request: { ticker: TickerForTest },
      injection: {
        mfinance: new MFinanceMock(TickerForTest, {
          lastPrice: 100,
          bookValuePerShare: 90,
          earningsPerShare: 12,
        }),
      },
    }),
    "Deve rodar sem erros": check((ctx) => {
      assert.ok(ctx.response.isOk);
    }),
    "Deve retornar o preço justo": check((ctx) => {
      assert.ok(ctx.response.value.precoJusto == "155.88");
    }),
  }),

  "Deve retornar erro se o ticker da ação for inválido": scenario({
    "Dado um ticker inválido": given({
      request: { ticker: "a1" },
      injection: {
        mfinance: new MFinanceMock(TickerForTest, {
          lastPrice: 100,
          bookValuePerShare: 90,
          earningsPerShare: 12,
        }),
      },
    }),
    "Deve retornar erro": check((ctx) => {
      assert.ok(!ctx.response.isOk);
    }),
    "Deve retornar mensagem de erro": check((ctx) => {
      assert.deepEqual(ctx.response.err, "Ticker inválido");
    }),
  }),
});

module.exports = herbarium.specs
  .add(calculaPrecoJustoSpec, "calculaPrecoJustoSpec")
  .metadata({ usecase: "CalcularPrecoJusto" }).spec;
