const { entity, field } = require("@herbsjs/herbs");

const Stock = entity("Stock", {
  lastPrice: field(Number, {
    validation: {
      numericality: { greaterThan: 0 },
    },
  }),
  name: field(String),
  symbol: field(String),
});

module.exports = Stock;
