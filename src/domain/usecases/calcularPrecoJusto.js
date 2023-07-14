const { usecase, step, Ok, Err, request } = require("@herbsjs/herbs")
const TickerRequest = require("../entities/TickerRequest")
const { MFinanceClient } = require("../../infra/clients/mFinanceClient")
const { herbarium } = require("@herbsjs/herbarium")

const dependency = {
  mfinance: MFinanceClient,
}

const calcularPrecoJusto = (injection) =>
  usecase("Calcular preco justo pela fórmula de Graham", {
    request: request.from(TickerRequest),

    response: {
      precoDaAcao: Number,
      precoJusto: String,
      descontoOuAgio: Number,
      resultado: String,
    },

    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection)
      ctx.di.mfinanceInstance = new ctx.di.mfinance()
      ctx.data = {}
    },

    "Verifica a requisição": step((ctx) => {
      const tickerRequest = ctx.req

      if (!tickerRequest.isValid()) return Err("Ticker inválido")

      return Ok()
    }),

    "Puxa as informações da ação da API": step({
      "Puxa o preço da ação": step(async (ctx) => {
        const { ticker } = ctx.req
        const { mfinanceInstance } = ctx.di

        const dadosDePrecoRequest = await mfinanceInstance.buscarPrecoAcao(ticker)

        if (dadosDePrecoRequest.isErr) return Err(`Erro ao buscar dados da ação ${ticker}`)
        if (!dadosDePrecoRequest.ok.isValid()) return Err("Provavelmente o ticker está incorreto")

        ctx.data.stock = dadosDePrecoRequest.ok

        return Ok()
      }),

      "Puxa os indicadores da açao": step(async (ctx) => {
        const { ticker } = ctx.req
        const { stock } = ctx.data
        const { mfinanceInstance } = ctx.di

        const indicadoresDaAcaoRequest = await mfinanceInstance.buscarIndicadoresAcao(ticker)
        if (indicadoresDaAcaoRequest.isErr)
          return Err(`Erro ao buscar indicadores da ação ${ticker}`)

        const indicadoresDaAcao = indicadoresDaAcaoRequest.ok

        stock.stockIndicators = indicadoresDaAcao

        return Ok()
      }),
    }),

    "Calcula o preço justo da ação": step((ctx) => {
      const { stock } = ctx.data

      const result = stock.calcularPrecoJusto()

      if (result.isErr) return Err(result.err)

      const descontoOuAgio = ((stock.lastPrice / stock.fairValue - 1) * 100).toFixed(2)
      const resultado = descontoOuAgio < 0 ? "desconto" : "ágio"

      ctx.ret = {
        precoDaAcao: stock.lastPrice,
        precoJusto: stock.fairValue.toFixed(2),
        descontoOuAgio: Math.abs(descontoOuAgio),
        resultado,
      }

      return Ok(ctx.ret)
    }),
  })

module.exports = herbarium.usecases
  .add(calcularPrecoJusto, "CalcularPrecoJusto")
  .metadata({ group: "Busca" }).usecase
