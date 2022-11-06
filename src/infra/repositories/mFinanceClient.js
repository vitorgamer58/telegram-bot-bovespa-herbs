const { Err, Ok } = require("@herbsjs/herbs");

const dependency = {
  axios: require("axios"),
};

class MFinanceClient {
  constructor(injection) {
    this._di = Object.assign({}, dependency, injection);

    const { axios } = this._di;

    this._axios = axios.create({
      baseURL: "https://mfinance.com.br/api/v1/",
    });
  }

  buscarPrecoAcao(ticker) {
    return this._axios
      .get(`stocks/${ticker}`)
      .then(({ data }) => {
        return Ok(data);
      })
      .catch((error) => {
        return Err(error);
      });
  }

  buscarIndicadoresAcao(ticker) {
    return this._axios
      .get(`stocks/indicators/${ticker}`)
      .then(({ data }) => Ok(data))
      .catch((error) => Err(error));
  }
}

module.exports = { MFinanceClient };
