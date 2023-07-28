const { usecase, step, Ok, Err, checker } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")
const Holiday = require("../entities/Holiday")
const HolidayRepository = require("../../infra/database/holidayRepository")

const dependency = {
  holidayRepository: HolidayRepository,
}

const verificaDiaUtil = (injection) =>
  usecase("Verifica se a data passada é um dia útil", {
    request: { dateToVerify: Date },

    response: {
      isWeekend: Boolean,
      isHoliday: Boolean,
      holiday: String,
    },

    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection)
      ctx.di.holidayRepositoryInstance = new ctx.di.holidayRepository()
      ctx.data = {}
    },

    "Verifica a requisição": step((ctx) => {
      const { dateToVerify } = ctx.req

      if (!checker.isDate(dateToVerify))
        return Err.invalidArguments({
          payload: {
            dateToVerify,
          },
        })
      if (isNaN(dateToVerify.getTime())) return Err("Data inválida")

      return Ok()
    }),

    "Verifica se a data atual é um dia de segunda à sexta": step((ctx) => {
      const { dateToVerify } = ctx.req

      const diaDaSemana = dateToVerify.getDay()

      if (diaDaSemana === 0 || diaDaSemana === 6) {
        ctx.ret.isWeekend = true
        return Ok(ctx.stop())
      }

      ctx.ret.isWeekend = false

      return Ok()
    }),

    "Verifica se a data atual é um feriado": step(async (ctx) => {
      try {
        const { holidayRepositoryInstance } = ctx.di
        const { dateToVerify } = ctx.req

        const dataAtual = dateToVerify.toLocaleDateString("pt-BR")
        const ddmmyyyy = dataAtual

        const [holiday] = await holidayRepositoryInstance.find({ filter: { ddmmyyyy } })

        if (!checker.isEmpty(holiday)) {
          ctx.ret.isHoliday = true
          ctx.ret.holiday = holiday.description
          return Ok()
        }

        ctx.ret.isHoliday = false
        return Ok()
      } catch (error) {
        return Err(`Erro na camada de banco de dados: ${error.message}`)
      }
    }),
  })

module.exports = herbarium.usecases
  .add(verificaDiaUtil, "VerificaDiaUtil")
  .metadata({ group: "VerificaDiaUtil", entity: Holiday }).usecase
