const { usecase, step, Ok, Err, request } = require("@herbsjs/herbs");
const TickerRequest = require("../entities/tickerRequest");
const { MFinanceClient } = require("../../infra/clients/mFinanceClient");
const { herbarium } = require("@herbsjs/herbarium");

const dependency = {
  mfinance: new MFinanceClient(),
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
    },

    "Verifica a requisição": step((ctx) => {
      const tickerRequest = ctx.req;

      if (!tickerRequest.isValid()) return Err("Ticker inválido");

      return Ok();
    }),

    "Puxa as informações da API": step({
      "Puxa o preço do FII": step(async (ctx) => {
        const { ticker } = ctx.req;
        const { mfinance } = ctx.di;

        const dadosDePrecoRequest = await mfinance.buscarPrecoFii(ticker);

        if (dadosDePrecoRequest.isErr) return Err(`Erro ao buscar dados do fii ${ticker}`);
        if (dadosDePrecoRequest.ok.lastPrice == 0)
          return Err("Provavelmente o ticker está incorreto");

        ctx.data.dadosDePreco = dadosDePrecoRequest.ok;
        return Ok();
      }),

      "Puxa os dividendos do FII": step(async (ctx) => {
        const { ticker } = ctx.req;
        const { mfinance } = ctx.di;

        const dividendosRequest = await mfinance.buscarDividendosFii(ticker);
        if (dividendosRequest.isErr) return Err(`Erro ao buscar dividendos do fii ${ticker}`);

        ctx.data.todosDividendos = dividendosRequest.ok;

        return Ok();
      }),
    }),

    "Filtra os dividendos por data": step((ctx) => {
      const { todosDividendos } = ctx.data;

      const dataAtual = new Date();
      const dataInicial = new Date(dataAtual.setMonth(dataAtual.getMonth() - 12));

      ctx.data.dividendosUltimoAno = todosDividendos.filter(
        (dividendo) => new Date(dividendo.declaredDate) >= dataInicial
      );

      return Ok();
    }),

    "Calcula o dividend yield e retorna as informações": step((ctx) => {
      const { dividendosUltimoAno, dadosDePreco } = ctx.data;

      let dividendosAcumulador = 0;

      dividendosUltimoAno.forEach((dividendo) => (dividendosAcumulador += dividendo.value));

      const dividendYield = ((dividendosAcumulador / dadosDePreco.lastPrice) * 100).toFixed(2);

      ctx.ret = {
        preco: dadosDePreco.lastPrice,
        dividendos: dividendosAcumulador.toFixed(2),
        dividendYield: dividendYield,
      };

      return Ok();
    }),
  });

module.exports = herbarium.usecases.add(buscaFii, "BuscaFii").metadata({ group: "Busca" }).usecase;
