const { entity, field } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")

const StockIndicators = entity("StockIndicators", {
  bookValuePerShare: field(Number),
  earningsPerShare: field(Number),
})

const fromMFinance = (params) => {
  const stockIndicators = new StockIndicators()

  stockIndicators.bookValuePerShare = params.bookValuePerShare.value
  stockIndicators.earningsPerShare = params.earningsPerShare.value

  return stockIndicators
}

module.exports = herbarium.entities.add(StockIndicators, "StockIndicators").entity
module.exports.fromMFinance = fromMFinance
