const { spec, scenario, given, check } = require("@herbsjs/aloe")
const { herbarium } = require("@herbsjs/herbarium")
const assert = require("assert")
const verificaDiaUtil = require("./verificaDiaUtil")
const Holiday = require("../entities/Holiday")

const VerificaDiaUtilSpec = spec({
  usecase: verificaDiaUtil,

  "Deve verificar se uma data é um dia de segunda à sexta": scenario({
    "Dado um dia útil": given({
      request: {
        dateToVerify: new Date(2023, 5, 21),
      },
      injection: {
        holidayRepository: class {
          find() {
            return [undefined]
          }
        },
      },
    }),
    "Deve rodar sem erros": check((ctx) => {
      assert.ok(ctx.response.isOk)
    }),
    "Deve retornar que não é fim de semana": check((ctx) => {
      assert.equal(ctx.response.ok.isWeekend, false)
    }),
    "Deve retornar que não é um feriado": check((ctx) => {
      assert.equal(ctx.response.ok.isHoliday, false)
    }),
  }),

  "Deve verificar se uma data é um feriado": scenario({
    "Dado um dia da semana, mas dia de feriado": given({
      request: {
        dateToVerify: new Date(2023, 6, 25),
      },
      injection: {
        holidayRepository: class {
          find() {
            return [
              Holiday.fromJSON({
                ddmmyyyy: "25/07/2023",
                holiday: "Feriado qualquer",
              }),
            ]
          }
        },
      },
    }),
    "Deve rodar sem erros": check((ctx) => {
      assert.ok(ctx.response.isOk)
    }),
    "Deve retornar que não é fim de semana": check((ctx) => {
      assert.equal(ctx.response.ok.isWeekend, false)
    }),
    "Deve retornar que é feriado": check((ctx) => {
      assert.equal(ctx.response.ok.isHoliday, true)
    }),
  }),

  "Deve verificar se uma data é um fim de semana": scenario({
    "Dado um dia de domingo": given({
      request: {
        dateToVerify: new Date(2023, 6, 23),
      },
      injection: {
        holidayRepository: class {
          find() {
            return [undefined]
          }
        },
      },
    }),
    "Deve rodar sem erros": check((ctx) => {
      assert.ok(ctx.response.isOk)
    }),
    "Deve retornar que é fim de semana": check((ctx) => {
      assert.equal(ctx.response.ok.isWeekend, true)
    }),
    "Não deve retornar se é ou não feriado": check((ctx) => {
      assert.equal(ctx.response.ok.isHoliday, undefined)
    }),
  }),
})

module.exports = herbarium.specs
  .add(VerificaDiaUtilSpec, "VerificaDiaUtilSpec")
  .metadata({ usecase: "VerificaDiaUtil" }).spec
