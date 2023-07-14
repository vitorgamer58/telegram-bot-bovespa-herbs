const { Err, Ok } = require("@herbsjs/herbs")
const Stock = require("../../domain/entities/Stock")
const Fii = require("../../domain/entities/Fii")
const Dividendo = require("../../domain/entities/Dividend")
const StockIndicators = require("../../domain/entities/StockIndicators")
const axios = require("axios")

const dependency = { axios }

class MFinanceClient {
  constructor(injection) {
    this._di = Object.assign({}, dependency, injection)

    const { axios } = this._di

    this._axios = axios.create({
      baseURL: "https://mfinance.com.br/api/v1/",
    })
  }

  buscarTodasAcoes() {
    return this._axios
      .get("stocks")
      .then(({ data }) => {
        const acoes = data.stocks.map((acao) => Stock.fromJSON(acao))

        return Ok(acoes.filter((acao) => acao.isValid()))
      })
      .catch((error) => Err(error))
  }

  buscarPrecoAcao(ticker) {
    return this._axios
      .get(`stocks/${ticker}`)
      .then(({ data }) => {
        const stock = Stock.fromJSON(data)

        if (!stock.isValid()) return Err("Ticker inválido ou API fora do ar")

        return Ok(stock)
      })
      .catch((error) => Err(error))
  }

  buscarIndicadoresAcao(ticker) {
    return this._axios
      .get(`stocks/indicators/${ticker}`)
      .then(({ data }) => Ok(StockIndicators.fromMFinance(data)))
      .catch((error) => Err(error))
  }

  buscarPrecoFii(ticker) {
    return this._axios
      .get(`fiis/${ticker}`)
      .then(({ data }) => {
        const fii = Fii.fromMFinance(data)

        if (!fii.isValid()) return Err("Ticker inválido ou API fora do ar")

        return Ok(fii)
      })
      .catch((error) => Err(error))
  }

  buscarDividendosFii(ticker) {
    return this._axios
      .get(`fiis/dividends/${ticker}`)
      .then(({ data }) => {
        const dividendos = data.dividends.map((item) => Dividendo.fromJSON(item))

        return Ok(dividendos)
      })
      .catch((error) => Err(error))
  }
}

module.exports = { MFinanceClient }
