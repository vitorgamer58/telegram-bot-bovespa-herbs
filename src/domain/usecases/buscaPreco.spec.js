const { spec, scenario, given, check } = require("@herbsjs/aloe");
const { Ok } = require("@herbsjs/herbs");
const { herbarium } = require("@herbsjs/herbarium");
const assert = require("assert");
const buscaPreco = require("./buscaPreco");
const TickerRequest = require("../entities/TickerRequest");
const Stock = require("../entities/Stock");

const tickerForTest = "ABCD3";

const buscaPrecoSpec = spec({
  usecase: buscaPreco,

  "Deve responder com os dados da ação se ela existir": scenario({
    "Dado uma ação válida": given({
      request: TickerRequest.fromJSON({ ticker: tickerForTest }),
      injection: {
        mfinance: class {
          buscarPrecoAcao() {
            const stock = Stock.fromJSON({
              lastprice: 100,
            });

            return Ok(stock);
          }
        },
      },
    }),
    "Deve rodar sem erros": check((ctx) => {
      assert.ok(ctx.response.isOk);
    }),
  }),

  "Deve responder com erro se a ação for inválida": scenario({
    "Dado uma ação inválida": given({
      request: TickerRequest.fromJSON({ ticker: "A1" }),
      injection: {
        mfinance: class {},
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
