const { spec, scenario, given, check } = require("@herbsjs/aloe");
const { herbarium } = require("@herbsjs/herbarium");
const { Ok } = require("@herbsjs/herbs");
const assert = require("assert");
const calcularPrecoJusto = require("./calcularPrecoJusto");

const TickerForTest = "ABCD3";

const MFinanceClient = {
  buscarPrecoAcao: (ticker) => {
    assert.deepEqual(ticker, TickerForTest);
    return Ok({ lastPrice: 100 });
  },
  buscarIndicadoresAcao: (ticker) => {
    assert.deepEqual(ticker, TickerForTest);
    return Ok({
      bookValuePerShare: {
        value: 90,
      },
      earningsPerShare: {
        value: 12,
      },
    });
  },
};

const calculaPrecoJustoSpec = spec({
  usecase: calcularPrecoJusto,

  "Deve calcular o preço justo": scenario({
    "Dado uma ação válida": given({
      request: { ticker: TickerForTest },
      injection: { mfinance: MFinanceClient },
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
      injection: { mfinance: MFinanceClient },
    }),
    "Deve retornar erro": check((ctx) => {
      assert.ok(!ctx.response.isOk);
    }),
    "Deve retornar mensagem de erro": check((ctx) => {
      assert.deepEqual(ctx.response.err, "Ticker inválido");
    }),
  }),
});

module.exports = herbarium.specs.add(calculaPrecoJustoSpec, "calculaPrecoJustoSpec").spec;
