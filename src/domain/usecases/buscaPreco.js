const { usecase, step, Ok, Err } = require("@herbsjs/herbs");
const { TickerRequest } = require("../entities/ticker");
const { MFinanceClient } = require("../../infra/repositories/mFinanceClient");

const dependency = {
  mfinance: new MFinanceClient(),
};

const buscaPreco = (injection) =>
  usecase("BuscaPreco", {
    request: { ticker: String },

    authorize: () => Ok(),

    setup: (ctx) => ((ctx.di = Object.assign({}, dependency, injection)), (ctx.data = {})),

    "Verifica a requisição": step((ctx) => {
      const { ticker } = ctx.req;
      const tickerRequest = new TickerRequest();
      tickerRequest.ticker = ticker;

      if (!tickerRequest.isValid()) return Err("Ticker inválido");

      return Ok();
    }),

    "Puxa o preço da ação": step(async (ctx) => {
      const { ticker } = ctx.req;
      const { mfinance } = ctx.di;

      const dadosDePrecoRequest = await mfinance.buscarPrecoAcao(ticker);
      if (dadosDePrecoRequest.isErr) return Err(`Erro ao buscar dados da ação ${ticker}`);

      if (dadosDePrecoRequest.ok.lastPrice == 0) return Err("Provavelmente o ticker está incorreto");

      return Ok((ctx.ret = dadosDePrecoRequest.ok));
    }),
  });

module.exports = buscaPreco;
