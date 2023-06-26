const { usecase, step, Ok, Err } = require("@herbsjs/herbs");
const TickerRequest = require("../entities/tickerRequest");
const { MFinanceClient } = require("../../infra/clients/mFinanceClient");

const dependency = {
  mfinance: new MFinanceClient(),
};

const calcularPrecoJusto = (injection) =>
  usecase("CalcularPrecoJusto", {
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

    "Puxa as informações da ação da API": step({
      "Puxa o preço da ação": step(async (ctx) => {
        const { ticker } = ctx.req;
        const { mfinance } = ctx.di;

        const dadosDePrecoRequest = await mfinance.buscarPrecoAcao(ticker);

        if (dadosDePrecoRequest.isErr) return Err(`Erro ao buscar dados da ação ${ticker}`);
        if (dadosDePrecoRequest.ok.lastPrice == 0)
          return Err("Provavelmente o ticker está incorreto");

        ctx.data.dadosDePreco = dadosDePrecoRequest.ok;
        return Ok();
      }),
      "Puxa os indicadores da açao": step(async (ctx) => {
        const { ticker } = ctx.req;
        const { mfinance } = ctx.di;

        const indicadoresDaAcaoRequest = await mfinance.buscarIndicadoresAcao(ticker);
        if (indicadoresDaAcaoRequest.isErr)
          return Err(`Erro ao buscar indicadores da ação ${ticker}`);

        ctx.data.indicadoresDaAcao = indicadoresDaAcaoRequest.ok;

        return Ok();
      }),
    }),

    "Separa e verifica os indicadores": step((ctx) => {
      const { dadosDePreco, indicadoresDaAcao } = ctx.data;

      const valorPatrimonialPorAcao = indicadoresDaAcao.bookValuePerShare.value;
      const lucroPorAcao = indicadoresDaAcao.earningsPerShare.value;

      if (valorPatrimonialPorAcao <= 0 || lucroPorAcao <= 0) {
        return Err(`Erro nos indicadores => VPA: ${valorPatrimonialPorAcao}, LPA: ${lucroPorAcao}`);
      }

      ctx.data.valorPatrimonialPorAcao = valorPatrimonialPorAcao;
      ctx.data.lucroPorAcao = lucroPorAcao;
      ctx.data.precoDaAcao = dadosDePreco.lastPrice;

      return Ok();
    }),

    "Calcula o preço justo da ação": step((ctx) => {
      const { valorPatrimonialPorAcao, lucroPorAcao, precoDaAcao } = ctx.data;

      const preçoJusto = Math.sqrt(22.5 * valorPatrimonialPorAcao * lucroPorAcao);
      const descontoOuAgio = ((precoDaAcao / preçoJusto - 1) * 100).toFixed(2);
      const resultado = descontoOuAgio < 0 ? "desconto" : "ágio";

      ctx.ret = {
        precoDaAcao,
        precoJusto: preçoJusto.toFixed(2),
        descontoOuAgio: Math.abs(descontoOuAgio),
        resultado,
      };

      return Ok(ctx.ret);
    }),
  });

module.exports = calcularPrecoJusto;
