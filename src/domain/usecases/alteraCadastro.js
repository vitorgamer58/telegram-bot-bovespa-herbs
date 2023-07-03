const { usecase, step, Ok, Err, checker, request, ifElse } = require("@herbsjs/herbs");
const ClientRepository = require("../../infra/database/clientRepository");
const Client = require("../entities/Client");
const verificaCadastro = require("./verificaCadastro");
const { herbarium } = require("@herbsjs/herbarium");

const dependency = {
  clientRepository: ClientRepository,
  verificaCadastro: verificaCadastro,
};

const alteraCadastro = (injection) =>
  usecase("Altera o status do cadastro do cliente", {
    request: request.from(Client, { ignoreIds: true }),

    response: {
      estavaCadastrado: Boolean,
    },

    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection);
      ctx.di.clientRepositoryInstance = new ctx.di.clientRepository();
      ctx.di.verificaCadastroUsecase = ctx.di.verificaCadastro(ctx.di);
      ctx.data = {};
    },

    "Verifica a requisição": step((ctx) => {
      const client = ctx.req;

      if (!client.isValid()) return Err("Dados inválidos");

      delete client.errors;

      return Ok();
    }),

    "Chama o usecase para buscar o cliente": step(async (ctx) => {
      const { verificaCadastroUsecase } = ctx.di;
      const cliente = ctx.req;

      await verificaCadastroUsecase.authorize();
      const ucResponse = await verificaCadastroUsecase.run(cliente);

      if (ucResponse.isErr) return Err("Erro ao buscar o cadastro");

      ctx.data.estaCadastrado = ucResponse.ok.estaCadastrado;
      ctx.data.cadastro = ucResponse.ok.cliente;
    }),

    "Verifica se já está cadastrado": ifElse({
      "Está cadastrado?": step((ctx) => {
        const { estaCadastrado } = ctx.data;

        return Ok(estaCadastrado);
      }),

      "Então: Deleta o cadastro": step(async (ctx) => {
        const { clientRepositoryInstance } = ctx.di;
        const { cadastro } = ctx.data;

        await clientRepositoryInstance.delete(cadastro);

        ctx.ret.estavaCadastrado = true;

        return Ok();
      }),

      "Senão: Cadastra o usuário": step(async (ctx) => {
        const cliente = ctx.req;
        const { clientRepositoryInstance } = ctx.di;

        await clientRepositoryInstance.insert(cliente);

        ctx.ret.estavaCadastrado = false;

        return Ok();
      }),
    }),
  });

module.exports = herbarium.usecases
  .add(alteraCadastro, "AlteraCadastro")
  .metadata({ group: "Cadastro", entity: Client }).usecase;
