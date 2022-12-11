const { Ok } = require("@herbsjs/herbs");
const assert = require("assert");

class MFinanceMock {
  constructor(ticker, dadosdaacao = {}, dadosdofii = {}) {
    this.ticker = ticker;
    this.acao = {
      lastPrice: dadosdaacao?.lastPrice,
      bookValuePerShare: dadosdaacao?.bookValuePerShare,
      earningsPerShare: dadosdaacao?.earningsPerShare,
    };
    this.fii = {
      lastPrice: dadosdofii?.lastPrice,
      dividendoMensal: dadosdofii?.dividendoMensal,
    };
  }

  buscarPrecoAcao(ticker) {
    assert.deepEqual(ticker, this.ticker);

    return Ok({
      lastprice: this.acao.lastPrice,
    });
  }

  buscarIndicadoresAcao(ticker) {
    assert.deepEqual(ticker, this.ticker);

    return Ok({
      bookValuePerShare: {
        value: this.acao.bookValuePerShare,
      },
      earningsPerShare: {
        value: this.acao.earningsPerShare,
      },
    });
  }

  buscarPrecoFii(ticker) {
    assert.deepEqual(ticker, this.ticker);

    return Ok({
      lastPrice: 100,
    });
  }

  buscarDividendosFii(ticker) {
    assert.deepEqual(ticker, this.ticker);

    const dividendos = [];

    for (let index = 0; index < 12; index++) {
      const dataAtual = new Date();
      dividendos.push({
        declaredDate: new Date(dataAtual.setMonth(dataAtual.getMonth() - index)),
        value: this.fii.dividendoMensal,
      });
    }

    return Ok(dividendos);
  }
}

module.exports = { MFinanceMock };
