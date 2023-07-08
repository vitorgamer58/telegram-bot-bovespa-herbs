const { entity, field } = require("@herbsjs/herbs");
const { herbarium } = require("@herbsjs/herbarium");
const Dividendo = require("./Dividend");

const Fii = entity("Fii", {
  lastPrice: field(Number, {
    validation: {
      numericality: { greaterThan: 0 },
    },
  }),
  symbol: field(String),
  change: field(Number),
  volume: field(Number),
  dividendos: field([Dividendo], {
    default: [],
  }),
  dividendosUltimoAno: field(Number),
  dividendYield: field(String),

  calcularDividendYield() {
    const dataAtual = new Date();
    const dataInicial = new Date(dataAtual.setMonth(dataAtual.getMonth() - 12));

    const dividendosUltimoAno = this.dividendos.filter(
      (dividendo) => new Date(dividendo.declaredDate) >= dataInicial
    );

    const dividendosAcumulador = dividendosUltimoAno.reduce(
      (acumulador, dividendo) => acumulador + dividendo.value,
      0
    );

    const dividendYield = (dividendosAcumulador / this.lastPrice) * 100;

    this.dividendYield = dividendYield;
    this.dividendosUltimoAno = dividendosAcumulador;
  },
});

const fromMFinance = (params) => {
  const fii = Fii.fromJSON(params);

  delete fii.dividendYield;

  return fii;
};

module.exports = herbarium.entities.add(Fii, "Fii").entity;
module.exports.fromMFinance = fromMFinance;
