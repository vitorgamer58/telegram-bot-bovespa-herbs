const { spec, scenario, given, check, when } = require("@herbsjs/aloe");
const { herbarium } = require("@herbsjs/herbarium");
const assert = require("assert");
const calcularPrecoJusto = require("./calcularPrecoJusto");
const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");

const mockedAxios = new MockAdapter(axios);
mockedAxios.onGet("stocks/ABCD3").reply(200, {
  lastPrice: 100,
});
mockedAxios.onGet("stocks/indicators/ABCD3").reply(200, {
  bookValuePerShare: {
    value: 90,
  },
  earningsPerShare: {
    value: 12,
  },
});

const calculaPrecoJustoSpec = spec({
  usecase: calcularPrecoJusto,

  "Deve calcular o preço justo": scenario({
    "Dado uma ação válida": given({
      request: { ticker: "ABCD3" },
      injection: { axios },
    }),
    "Deve rodar sem erros": check((ctx) => {
      assert.ok(ctx.response.isOk);
    }),
    "Deve retornar o preço justo": check((ctx) => {
      assert.ok(ctx.response.value.precoJusto == "155.88");
    }),
  }),
});

module.exports = herbarium.specs.add(calculaPrecoJustoSpec, "calculaPrecoJustoSpec").spec;
