const { entity, field, Ok, Err } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")
const StockIndicators = require("./StockIndicators")

const Stock = entity("Stock", {
  lastPrice: field(Number, {
    validation: {
      numericality: { greaterThan: 0 },
    },
  }),
  name: field(String),
  symbol: field(String),
  change: field(Number),
  volume: field(Number),
  fairValue: field(Number),
  stockIndicators: field(StockIndicators),

  calcularPrecoJusto() {
    const valorPatrimonialPorAcao = this.stockIndicators.bookValuePerShare
    const lucroPorAcao = this.stockIndicators.earningsPerShare

    if (valorPatrimonialPorAcao <= 0 || lucroPorAcao <= 0) {
      return Err(`Erro nos indicadores => VPA: ${valorPatrimonialPorAcao}, LPA: ${lucroPorAcao}`)
    }

    this.fairValue = Math.sqrt(22.5 * valorPatrimonialPorAcao * lucroPorAcao)

    return Ok()
  },
})

module.exports = herbarium.entities.add(Stock, "Stock").entity
