const { spec, scenario, given, check } = require("@herbsjs/aloe");
const { Err } = require("@herbsjs/herbs");
const { herbarium } = require("@herbsjs/herbarium");
const assert = require("assert");
const bitcoinIndex = require("./bitcoinIndex");
const { CoinSambaMock } = require("../../../test/mocks/coinSambaMock");

const bitcoinIndexSpec = spec({
  usecase: bitcoinIndex,

  "Deve retornar o preço do Bitcoin": scenario({
    "Dado um UC válido": given({
      injection: {
        coinSambaClient: new CoinSambaMock(100000, 1),
      },
    }),
    "Deve rodar sem erros": check((ctx) => {
      assert.ok(ctx.response.isOk);
    }),
    "Deve retornar o preço do Bitcoin": check((ctx) => {
      assert.deepEqual(ctx.response.ok.preco, "100000.00");
      assert.deepEqual(ctx.response.ok.variacao, "1.00");
    }),
  }),

  "Não deve retornar se houver um erro no CoinSamba": scenario({
    "Dado um UC válido": given({
      injection: {
        coinSambaClient: new (class {
          buscarIndexBitcoin() {
            return Err("Erro");
          }
        })(),
      },
    }),
    "Deve retornar erro": check((ctx) => {
      assert.ok(ctx.response.isErr);
    }),
  }),
});

module.exports = herbarium.specs
  .add(bitcoinIndexSpec, "bitcoinIndexSpec")
  .metadata({ usecase: "BitcoinIndex" }).spec;
