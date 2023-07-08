const { usecase, step, Ok, Err, request } = require("@herbsjs/herbs");
const TickerRequest = require("../entities/TickerRequest");
const { MFinanceClient } = require("../../infra/clients/mFinanceClient");
const { herbarium } = require("@herbsjs/herbarium");

const dependency = {
  mfinance: MFinanceClient,
};

const buscaFii = (injection) =>
  usecase("Busca preço e dividendos do FII", {
    request: request.from(TickerRequest),

    response: {
      preco: Number,
      dividendos: String,
      dividendYield: String,
    },

    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection);
      ctx.data = {};
      ctx.di.mfinanceInstance = new ctx.di.mfinance();
    },

    "Verifica a requisição": step((ctx) => {
      const tickerRequest = ctx.req;

      if (!tickerRequest.isValid()) return Err("Ticker inválido");

      return Ok();
    }),

    "Puxa as informações da API": step({
      "Puxa o preço do FII": step(async (ctx) => {
        const { ticker } = ctx.req;
        const { mfinanceInstance } = ctx.di;

        const buscaFiiRequest = await mfinanceInstance.buscarPrecoFii(ticker);

        if (buscaFiiRequest.isErr) return Err(`Erro ao buscar dados do fii ${ticker}`);

        ctx.data.fii = buscaFiiRequest.ok;

        return Ok({ fii: buscaFiiRequest.ok });
      }),

      "Puxa os dividendos do FII": step(async (ctx) => {
        const { ticker } = ctx.req;
        const { fii } = ctx.data;
        const { mfinanceInstance } = ctx.di;

        const dividendosRequest = await mfinanceInstance.buscarDividendosFii(ticker);
        if (dividendosRequest.isErr) return Err(`Erro ao buscar dividendos do fii ${ticker}`);

        fii.dividendos = dividendosRequest.ok;

        return Ok({ dividendos: dividendosRequest.ok });
      }),
    }),

    "Calcula o dividend yield": step((ctx) => {
      const { fii } = ctx.data;

      fii.calcularDividendYield();

      return Ok();
    }),

    "Retorna as informações": step((ctx) => {
      const { fii } = ctx.data;

      ctx.ret = {
        preco: fii.lastPrice,
        dividendos: fii.dividendosUltimoAno.toFixed(2),
        dividendYield: fii.dividendYield.toFixed(2),
      };

      return Ok();
    }),
  });

module.exports = herbarium.usecases.add(buscaFii, "BuscaFii").metadata({ group: "Busca" }).usecase;
