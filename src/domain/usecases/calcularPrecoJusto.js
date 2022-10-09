// ts-check
const { usecase, step, Ok, Err } = require("@herbsjs/herbs");
const axios = require("axios");

const dependency = {
  axios: axios.create({
    baseURL: "https://mfinance.com.br/api/v1/",
  }),
};

const calcularPrecoJusto = (injection) =>
  usecase("CalcularPrecoJusto", {
    request: { ticker: String },

    authorize: () => Ok(),

    setup: (ctx) => ((ctx.di = Object.assign({}, dependency, injection)), (ctx.data = {})),

    "Verifica a requisição": step((ctx) => {
      const { ticker } = ctx.req;
      const regex = /([A-Z]{4}[1-9])/gm;

      if (!regex.test(ticker)) return Err("Ticker inválido");

      return Ok();
    }),

    "Puxa as informações da ação da API": step({
      "Puxa o preço da ação": step(async (ctx) => {
        const { ticker } = ctx.req;
        const { axios } = ctx.di;

        const { data: dadosDePreco } = await axios.get(`stocks/${ticker}`);

        if (dadosDePreco.lastPrice == 0) return Err("Provavelmente o ticker está incorreto");

        ctx.data.dadosDePreco = dadosDePreco;
        return Ok();
      }),
      "Puxa os indicadores da açao": step(async (ctx) => {
        const { ticker } = ctx.req;
        const { axios } = ctx.di;

        const { data: indicadoresDaAcao } = await axios.get(`stocks/indicators/${ticker}`);

        ctx.data.indicadoresDaAcao = indicadoresDaAcao;

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
