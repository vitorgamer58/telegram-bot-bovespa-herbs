const { usecase, step, Ok, Err } = require("@herbsjs/herbs");
const TickerRequest = require("../entities/ticker");
const { MFinanceClient } = require("../../infra/repositories/mFinanceClient");

const dependency = {
  mfinance: new MFinanceClient(),
};

const buscaFii = (injection) =>
  usecase("BuscaFII", {
    request: { ticker: String },

    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection);
      ctx.data = {};
    },

    "Verifica a requisição": step((ctx) => {
      const { ticker } = ctx.req;
      const tickerRequest = new TickerRequest();
      tickerRequest.ticker = ticker;

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

module.exports = buscaFii;
