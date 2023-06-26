const { entity, field } = require("@herbsjs/herbs");

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

module.exports = Stock;
