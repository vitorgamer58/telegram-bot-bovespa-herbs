const { Ok } = require("@herbsjs/herbs");

class CoinSambaMock {
  constructor(bitcoinPrice, change) {
    this.close = bitcoinPrice;
    this.change = change;
  }

  buscarIndexBitcoin() {
    return Ok({
      close: this.close,
      change: this.change,
    });
  }
}

module.exports = { CoinSambaMock };
