const { spec, scenario, given, check } = require("@herbsjs/aloe");
const { herbarium } = require("@herbsjs/herbarium");
const { Ok, Err } = require("@herbsjs/herbs");
const assert = require("assert");
const buscaFii = require("./buscaFii");
const TickerRequest = require("../entities/TickerRequest");
const Dividend = require("../entities/Dividend");
const Fii = require("../entities/Fii");

const tickerForTest = "ABCD11";

const buscaFiiSpec = spec({
  usecase: buscaFii,

  "Deve responder com os dados do FII se ele existir": scenario({
    "Dado um FII válido": given({
      request: TickerRequest.fromJSON({ ticker: tickerForTest }),
      injection: {
        mfinance: class {
          buscarPrecoFii(_) {
            return Ok(
              Fii.fromJSON({
                lastPrice: 100,
              })
            );
          }

          buscarDividendosFii(ticker) {
            const dataAtual = new Date();

            const dividendos = Array.from({ length: 12 }, (_, index) => {
              if (index > 0) {
                dataAtual.setMonth(dataAtual.getMonth() - 1);
              }

              return {
                declaredDate: new Date(dataAtual),
                value: 1,
              };
            });

            const dividendEntity = dividendos.map((item) => Dividend.fromJSON(item));

            return Ok(dividendEntity);
          }
        },
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
      request: TickerRequest.fromJSON({ ticker: "A1" }),
      injection: { mfinance: class {} },
    }),
    "Deve responder com erro": check((ctx) => {
      assert.ok(!ctx.response.isOk);
      assert.deepEqual(ctx.response.err, "Ticker inválido");
    }),
  }),

  "Deve responder com erro se houver um erro para buscar o preço do FII": scenario({
    "Dado um FII inválido": given({
      request: TickerRequest.fromJSON({ ticker: tickerForTest }),
      injection: {
        mfinance: class {
          buscarPrecoFii(_) {
            return Err("Erro qualquer");
          }
        },
      },
    }),
    "Deve responder com erro": check((ctx) => {
      assert.ok(!ctx.response.isOk);
    }),
    "Deve responder com uma mensagem de erro": check((ctx) => {
      assert.deepEqual(ctx.response.err, `Erro ao buscar dados do fii ${tickerForTest}`);
    }),
  }),
});

module.exports = herbarium.specs
  .add(buscaFiiSpec, "buscaFiiSpec")
  .metadata({ usecase: "BuscaFii" }).spec;
