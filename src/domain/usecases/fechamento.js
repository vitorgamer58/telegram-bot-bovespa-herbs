const { usecase, step, Ok, Err, checker } = require("@herbsjs/herbs")
const IndiceRepository = require("../../infra/database/indiceRepository")
const { MFinanceClient } = require("../../infra/clients/mFinanceClient")
const { herbarium } = require("@herbsjs/herbarium")
const Stock = require("../entities/Stock")
const verificaDiaUtil = require("./verificaDiaUtil")

const dependency = {
  mfinance: MFinanceClient,
  indiceRepository: IndiceRepository,
  verificaDiaUtilUsecase: verificaDiaUtil,
}

const fechamento = (injection) =>
  usecase("Buscar fechamento do dia", {
    request: {},

    response: {
      maioresAltas: [Stock],
      maioresBaixas: [Stock],
      maisNegociadas: [Stock],
      deltaIbov: Number,
      dataAtual: String,
    },

    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection)
      ctx.di.verificaDiaUtilInstance = ctx.di.verificaDiaUtilUsecase(ctx.di)
      ctx.data = {}
      ctx.date = ctx.di.date || new Date()
    },

    "Verifica a data atual": step(async (ctx) => {
      const { verificaDiaUtilInstance } = ctx.di
      const date = ctx.date

      await verificaDiaUtilInstance.authorize()

      const ucResponse = await verificaDiaUtilInstance.run({ dateToVerify: date })

      if (ucResponse.isErr) return Err("Houve um erro ao verificar se a data de hoje é dia útil")

      const { isWeekend, isHoliday, holiday } = ucResponse.ok

      if (isWeekend) return Err("Hoje não é um dia útil")
      if (isHoliday) return Err(`Hoje não é um dia útil: ${holiday}`)

      const dataAtual = date.toLocaleDateString("pt-BR")
      ctx.data.dataAtual = dataAtual

      return Ok()
    }),

    "Busca os dados de todas as ações": step(async (ctx) => {
      const mfinance = new ctx.di.mfinance()

      const response = await mfinance.buscarTodasAcoes()

      if (response.isErr) return Err("Não foi possível obter a lista de ações")

      const ibov = response.ok.find((acao) => acao.symbol === "IBOV")

      ctx.data.acoes = response.ok
      ctx.data.deltaIbov = ibov.change

      return Ok()
    }),

    "Obtém a lista de todos os ativos que fazem parte do índice IBOV": step(async (ctx) => {
      try {
        const indiceRepository = new ctx.di.indiceRepository()

        const filtro = {
          filter: {
            indice: "IBOV",
          },
        }

        const databaseResponse = await indiceRepository.find(filtro)

        if (checker.isEmpty(databaseResponse)) return Err("Erro ao obter ações do índice IBOV")

        ctx.data.ibovespa = databaseResponse[0].acoes

        return Ok()
      } catch (error) {
        return Err("Erro no banco de dados")
      }
    }),

    "Filtra as ações que fazem parte do índice IBOV": step((ctx) => {
      const { acoes, ibovespa } = ctx.data

      ctx.data.acoesNoIbov = acoes.filter((acao) => ibovespa.includes(acao.symbol))

      return Ok()
    }),

    "Ordena as ações pela variação": step((ctx) => {
      const { acoesNoIbov } = ctx.data

      acoesNoIbov.sort((a, b) => b.change - a.change)

      const altas = acoesNoIbov.filter((acao) => acao.change > 0)
      const baixas = acoesNoIbov.filter((acao) => acao.change < 0)

      ctx.data.maioresAltas = altas.slice(0, 5)
      ctx.data.maioresBaixas = baixas.slice(-5)

      return Ok()
    }),

    "Ordena as ações pelo volume negociado": step((ctx) => {
      const { acoesNoIbov } = ctx.data

      acoesNoIbov.sort((a, b) => b.volume - a.volume)

      ctx.data.maisNegociadas = acoesNoIbov.slice(0, 5)

      return Ok()
    }),

    "Retorna os dados": step((ctx) => {
      const { maioresAltas, maioresBaixas, maisNegociadas, deltaIbov, dataAtual } = ctx.data

      ctx.ret = {
        maioresAltas,
        maioresBaixas,
        maisNegociadas,
        deltaIbov,
        dataAtual,
      }

      return Ok()
    }),
  })

module.exports = herbarium.usecases
  .add(fechamento, "Fechamento")
  .metadata({ group: "Fechamento", entity: Stock }).usecase
