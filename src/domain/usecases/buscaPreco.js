const { usecase, step, Ok, Err, request } = require("@herbsjs/herbs")
const TickerRequest = require("../entities/TickerRequest")
const { MFinanceClient } = require("../../infra/clients/mFinanceClient")
const Stock = require("../entities/Stock")
const { herbarium } = require("@herbsjs/herbarium")

const dependency = {
  mfinance: MFinanceClient,
}

const buscaPreco = (injection) =>
  usecase("Buscar preco da ação", {
    request: request.from(TickerRequest),

    response: Stock,

    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection)
      ctx.data = {}
    },

    "Verifica a requisição": step((ctx) => {
      const tickerRequest = ctx.req

      if (!tickerRequest.isValid()) return Err("Ticker inválido")

      return Ok()
    }),

    "Puxa o preço da ação": step(async (ctx) => {
      const { ticker } = ctx.req
      const mfinance = new ctx.di.mfinance()

      const dadosDePrecoRequest = await mfinance.buscarPrecoAcao(ticker)
      if (dadosDePrecoRequest.isErr) return Err(`Erro ao buscar dados da ação ${ticker}`)

      const stock = dadosDePrecoRequest.ok

      return Ok((ctx.ret = stock))
    }),
  })

module.exports = herbarium.usecases
  .add(buscaPreco, "BuscaPreco")
  .metadata({ group: "Busca" }).usecase
