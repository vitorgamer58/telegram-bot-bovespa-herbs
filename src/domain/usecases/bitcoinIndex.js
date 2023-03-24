const { usecase, step, Ok, Err } = require("@herbsjs/herbs");
const { CoinSambaClient } = require("../../infra/repositories/coinSambaClient");

const dependency = {
  coinSambaClient: new CoinSambaClient(),
};

const bitcoinIndex = (injection) =>
  usecase("BitcoinIndex", {
    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection);
    },

    "Busca o preço do Bitcoin e retorna": step(async (ctx) => {
      const { coinSambaClient } = ctx.di;

      const bitcoinData = await coinSambaClient.buscarIndexBitcoin();

      if (bitcoinData.isErr) return Err(`Erro ao buscar preço do Bitcoin`);

      ctx.ret = {
        preco: bitcoinData.ok.close.toFixed(2),
        variacao: bitcoinData.ok.change.toFixed(2),
      };

      return Ok();
    }),
  });

module.exports = bitcoinIndex;
