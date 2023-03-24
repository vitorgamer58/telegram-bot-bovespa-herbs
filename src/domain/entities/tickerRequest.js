const { entity, field } = require("@herbsjs/herbs");

const TickerRequest = entity("TickerRequest", {
  ticker: field(String, {
    validation: {
      presence: true,
      length: { minimum: 5 },
      custom: {
        isValidTicker: (value) => /^[A-Z]{4}\d{1,2}$/gm.test(value),
      },
    },
  }),
});

module.exports = TickerRequest;
