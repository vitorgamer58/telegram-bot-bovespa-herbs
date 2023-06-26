const { entity, field } = require("@herbsjs/herbs");
const { herbarium } = require("@herbsjs/herbarium");

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
});

module.exports = herbarium.entities.add(Stock, "Stock").entity;
