const { spec, scenario, given, check } = require("@herbsjs/aloe")
const { Err } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")
const assert = require("assert")
const fechamento = require("./fechamento")
const { MFinanceMock } = require("../../../test/mocks/mFinanceMock")
const { IndiceRepositoryMock } = require("../../../test/mocks/indiceRepositoryMock")
const Holiday = require("../entities/Holiday")

const fechamentoSpec = spec({
  usecase: fechamento,

  "Deve buscar fechamento do dia": scenario({
    "Dado um dia útil": given({
      request: {},
      injection: {
        mfinance: MFinanceMock,
        indiceRepository: IndiceRepositoryMock,
        date: new Date(2023, 5, 21),
        holidayRepository: class {
          find() {
            return null
          }
        },
      },
    }),
    "Deve rodar sem erros": check((ctx) => {
      assert.ok(ctx.response.isOk)
    }),
    "Deve retornar o array de altas do maior para o menor": check((ctx) => {
      const maioresAltas = ctx.response.ok.maioresAltas

      const primeiraEmpresa = maioresAltas[0]
      const ultimaEmpresa = maioresAltas[maioresAltas.length - 1]

      assert.ok(primeiraEmpresa.change > ultimaEmpresa.change)
    }),
    "Deve retornar o array de baixas da maior para a menor": check((ctx) => {
      const maioresBaixas = ctx.response.ok.maioresBaixas

      const primeiraEmpresa = maioresBaixas[0]
      const ultimaEmpresa = maioresBaixas[maioresBaixas.length - 1]

      assert.ok(primeiraEmpresa.change < ultimaEmpresa.change)
    }),
  }),

  "Não deve buscar o fechamento do dia se não for um feriado": scenario({
    "Dado um dia de feriado": given({
      request: {},
      injection: {
        mfinance: MFinanceMock,
        indiceRepository: IndiceRepositoryMock,
        date: new Date(2023, 6, 25),
        holidayRepository: class {
          find() {
            return [
              Holiday.fromJSON({
                ddmmyyyy: "25/07/2023",
                description: "Feriado qualquer",
              }),
            ]
          }
        },
      },
    }),
    "Deve rodar sem erros": check((ctx) => {
      assert.ok(ctx.response.isErr)
    }),
    "Deve retornar erro de que hoje não é um dia útil": check((ctx) => {
      assert.equal(ctx.response.err, "Hoje não é um dia útil: Feriado qualquer")
    }),
  }),

  "Não deve buscar o fechamento do dia se não for dia útil": scenario({
    "Dado um dia não útil": given({
      request: {},
      injection: {
        mfinance: MFinanceMock,
        indiceRepository: IndiceRepositoryMock,
        date: new Date(2023, 5, 25),
        holidayRepository: class {
          find() {
            return null
          }
        },
      },
    }),
    "Deve retornar erro": check((ctx) => {
      assert.ok(ctx.response.isErr)
      assert.equal(ctx.response.err, "Hoje não é um dia útil")
    }),
  }),

  "Não deve buscar o fechamento se não for possível obter os índices": scenario({
    "Dado um erro no indiceRepository": given({
      request: {},
      injection: {
        mfinance: MFinanceMock,
        indiceRepository: class {
          find() {
            throw new Error()
          }
        },
        date: new Date(2023, 5, 21),
        holidayRepository: class {
          find() {
            return null
          }
        },
      },
    }),
    "Deve retornar erro": check((ctx) => {
      assert.ok(ctx.response.isErr)
      assert.equal(ctx.response.err, "Erro no banco de dados")
    }),
  }),

  "Não deve buscar o fechamento se não for possível obter a lista de ações": scenario({
    "Dado um erro na API MFinance": given({
      request: {},
      injection: {
        mfinance: class {
          buscarTodasAcoes() {
            return Err("Erro ao se conectar com a API")
          }
        },
        indiceRepository: IndiceRepositoryMock,
        date: new Date(2023, 5, 21),
        holidayRepository: class {
          find() {
            return null
          }
        },
      },
    }),
    "Deve retornar erro": check((ctx) => {
      assert.ok(ctx.response.isErr)
      assert.equal(ctx.response.err, "Não foi possível obter a lista de ações")
    }),
  }),
})

module.exports = herbarium.specs
  .add(fechamentoSpec, "fechamentoSpec")
  .metadata({ usecase: "Fechamento" }).spec
