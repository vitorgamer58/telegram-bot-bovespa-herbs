const { Err, Ok } = require("@herbsjs/herbs");
const axios = require("axios");

const dependency = { axios }

class CoinSambaClient {
  constructor(injection) {
    this._di = Object.assign({}, dependency, injection);

    const { axios } = this._di;

    this._axios = axios.create({
      baseURL: "https://api.coinsamba.com/v0/"
    });
  }

  buscarIndexBitcoin() {
    return this._axios
      .get("index", {
        params: {
          base: "BTC",
          quote: "BRL"
        }
      })
      .then(({ data }) => Ok(data))
      .catch((error) => Err(error))
  }
}

module.exports = { CoinSambaClient }