const { Ok } = require("@herbsjs/herbs");
const assert = require("assert");
const jsonAcoes = require("./acoes.json");
const Stock = require("../../src/domain/entities/stock");

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

  buscarTodasAcoes() {
    const acoes = jsonAcoes.map((acao) => Stock.fromJSON(acao));

    return Ok(acoes.filter((acao) => acao.isValid()));
  }

  buscarPrecoAcao(ticker) {
    assert.deepEqual(ticker, this.ticker);

    const stock = Stock.fromJSON({
      lastprice: this.acao.lastPrice,
    });

    return Ok(stock);
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
