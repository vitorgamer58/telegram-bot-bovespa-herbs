const { Err, Ok } = require("@herbsjs/herbs");
const Stock = require("../../domain/entities/Stock");
const axios = require("axios");

const dependency = { axios };

class MFinanceClient {
  constructor(injection) {
    this._di = Object.assign({}, dependency, injection);

    const { axios } = this._di;

    this._axios = axios.create({
      baseURL: "https://mfinance.com.br/api/v1/",
    });
  }

  buscarTodasAcoes() {
    return this._axios
      .get(`stocks`)
      .then(({ data }) => {
        const acoes = data.stocks.map((acao) => Stock.fromJSON(acao));

        return Ok(acoes.filter((acao) => acao.isValid()));
      })
      .catch((error) => Err(error));
  }

  buscarPrecoAcao(ticker) {
    return this._axios
      .get(`stocks/${ticker}`)
      .then(({ data }) => Ok(Stock.fromJSON(data)))
      .catch((error) => Err(error));
  }

  buscarIndicadoresAcao(ticker) {
    return this._axios
      .get(`stocks/indicators/${ticker}`)
      .then(({ data }) => Ok(data))
      .catch((error) => Err(error));
  }

  buscarPrecoFii(ticker) {
    return this._axios
      .get(`/fiis/${ticker}`)
      .then(({ data }) => Ok(data))
      .catch((error) => Err(error));
  }

  buscarDividendosFii(ticker) {
    return this._axios
      .get(`/fiis/dividends/${ticker}`)
      .then(({ data }) => Ok(data.dividends))
      .catch((error) => Err(error));
  }
}

module.exports = { MFinanceClient };
