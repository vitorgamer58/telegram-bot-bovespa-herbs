const { entity, field } = require("@herbsjs/herbs");
const { herbarium } = require("@herbsjs/herbarium");

const TickerRequest = entity("TickerRequest", {
  ticker: field(String, {
    validation: {
      presence: true,
      length: { minimum: 5 },
      custom: {
        isInvalidTicker: (value) => /^[A-Z]{4}\d{1,2}$/gm.test(value),
      },
    },
  }),
});

module.exports = herbarium.entities.add(TickerRequest, "TickerRequest").entity;
