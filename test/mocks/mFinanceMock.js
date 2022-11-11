const { Ok } = require("@herbsjs/herbs");
const assert = require("assert");

class MFinanceMock {
  constructor(ticker, lastPrice, bookValuePerShare, earningsPerShare) {
    this.ticker = ticker;
    this.lastPrice = lastPrice;
    this.bookValuePerShare = bookValuePerShare;
    this.earningsPerShare = earningsPerShare;
  }

  buscarPrecoAcao(ticker) {
    assert.deepEqual(ticker, this.ticker);

    return Ok({
      lastprice: this.lastPrice,
    });
  }

  buscarIndicadoresAcao(ticker) {
    assert.deepEqual(ticker, this.ticker);

    return Ok({
      bookValuePerShare: {
        value: this.bookValuePerShare,
      },
      earningsPerShare: {
        value: this.earningsPerShare,
      },
    });
  }
}

module.exports = { MFinanceMock };
