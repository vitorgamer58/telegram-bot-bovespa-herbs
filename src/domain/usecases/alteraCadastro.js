const { usecase, step, Ok, Err, checker, request, ifElse } = require("@herbsjs/herbs");
const ClientRepository = require("../../infra/database/clientRepository");
const Client = require("../entities/client");
const verificaCadastro = require("./verificaCadastro");

const dependency = {
  clientRepository: new ClientRepository(),
  verificaCadastroUsecase: verificaCadastro,
};

const alteraCadastro = (injection) =>
  usecase("Altera o status do cadastro do cliente", {
    request: request.from(Client, { ignoreIds: true }),

    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection);
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

      const usecaseInstance = verificaCadastroUsecase();
      await usecaseInstance.authorize();
      const ucResponse = await usecaseInstance.run(cliente);

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
        const { clientRepository } = ctx.di;
        const { cadastro } = ctx.data;

        await clientRepository.delete(cadastro);

        ctx.ret.estavaCadastrado = true;

        return Ok();
      }),

      "Senão: Cadastra o usuário": step(async (ctx) => {
        const cliente = ctx.req;
        const { clientRepository } = ctx.di;

        await clientRepository.insert(cliente);

        ctx.ret.estavaCadastrado = false;

        return Ok();
      }),
    }),
  });

module.exports = alteraCadastro;
