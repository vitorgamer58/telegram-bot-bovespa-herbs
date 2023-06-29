const { spec, scenario, given, check } = require("@herbsjs/aloe");
const { Ok } = require("@herbsjs/herbs");
const { herbarium } = require("@herbsjs/herbarium");
const assert = require("assert");
const calcularPrecoJusto = require("./calcularPrecoJusto");
const { MFinanceMock } = require("../../../test/mocks/mFinanceMock");
const TickerRequest = require("../entities/tickerRequest");
const Stock = require("../entities/stock");

const tickerForTest = "ABCD3";

const calculaPrecoJustoSpec = spec({
  usecase: calcularPrecoJusto,

  "Deve calcular o preço justo": scenario({
    "Dado uma ação válida": given({
      request: TickerRequest.fromJSON({ ticker: tickerForTest }),
      injection: {
        mfinance: new MFinanceMock(tickerForTest, {
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
      request: TickerRequest.fromJSON({ ticker: "A1" }),
      injection: {
        mfinance: new MFinanceMock(tickerForTest, {
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

  "Deve retornar erro se a API MFinance não encontrar o ticker": scenario({
    "Dado um ticker válido": given({
      request: TickerRequest.fromJSON({ ticker: "ABCD3" }),
      injection: {
        mfinance: new (class {
          buscarPrecoAcao(ticker) {
            return Ok(
              Stock.fromJSON({
                symbol: ticker,
                lastPrice: 0,
              })
            );
          }
        })(),
      },
    }),
    "Deve retornar erro": check((ctx) => {
      assert.ok(!ctx.response.isOk);
    }),
    "Deve retornar mensagem de erro": check((ctx) => {
      assert.deepEqual(ctx.response.err, "Provavelmente o ticker está incorreto");
    }),
  }),
});

module.exports = herbarium.specs
  .add(calculaPrecoJustoSpec, "calculaPrecoJustoSpec")
  .metadata({ usecase: "CalcularPrecoJusto" }).spec;
