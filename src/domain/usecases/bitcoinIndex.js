const { usecase, step, Ok, Err } = require("@herbsjs/herbs")
const { CoinSambaClient } = require("../../infra/clients/coinSambaClient")
const { herbarium } = require("@herbsjs/herbarium")

const dependency = {
  coinSambaClient: CoinSambaClient,
}

const bitcoinIndex = (injection) =>
  usecase("Busca o índice do Bitcoin", {
    request: {},

    response: {
      preco: Number,
      variacao: Number,
    },

    authorize: () => Ok(),

    setup: (ctx) => (ctx.di = Object.assign({}, dependency, injection)),

    "Busca o preço do Bitcoin e retorna": step(async (ctx) => {
      const coinSambaClient = new ctx.di.coinSambaClient()

      const bitcoinData = await coinSambaClient.buscarIndexBitcoin()

      if (bitcoinData.isErr) return Err("Erro ao buscar preço do Bitcoin")

      ctx.ret = {
        preco: bitcoinData.ok.close.toFixed(2),
        variacao: bitcoinData.ok.change.toFixed(2),
      }

      return Ok()
    }),
  })

module.exports = herbarium.usecases
  .add(bitcoinIndex, "BitcoinIndex")
  .metadata({ group: "Busca" }).usecase
