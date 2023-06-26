require("dotenv").config();
const Handlebars = require("handlebars");
const { Telegraf } = require("telegraf");
const commandParts = require("../middlewares/telegraf-command-parts");
const calcularPrecoJusto = require("../../domain/usecases/calcularPrecoJusto");
const buscaPreco = require("../../domain/usecases/buscaPreco");
const buscarFii = require("../../domain/usecases/buscaFii");
const bitcoinIndex = require("../../domain/usecases/bitcoinIndex");
const fechamento = require("../../domain/usecases/fechamento");
const {
  fechamentoTemplate,
  startTemplate,
  alteraCadastroTemplate,
  priceTemplate,
  grahamTemplate,
} = require("../../domain/templates");
const obterClientes = require("../../domain/usecases/obterClientes");
const Client = require("../../domain/entities/client");
const verificaCadastro = require("../../domain/usecases/verificaCadastro");
const alteraCadastro = require("../../domain/usecases/alteraCadastro");

const runBot = () => {
  const bot = new Telegraf(process.env.TOKEN);

  bot.use(commandParts());

  bot.command("start", async (ctx) => {
    const template = Handlebars.compile(startTemplate);
    const message = template({ firstName: ctx.update.message.from.first_name });

    return ctx.reply(message);
  });

  bot.command("price", async (ctx) => {
    try {
      const ticker = ctx.state.command.splitArgs[0]?.toUpperCase();

      const usecase = buscaPreco();
      await usecase.authorize();
      const ucResponse = await usecase.run({ ticker });

      if (ucResponse.isErr) {
        return ctx.reply(ucResponse.err);
      }

      const { lastPrice, change } = ucResponse.ok;

      const template = Handlebars.compile(priceTemplate);
      const message = template({ ticker, lastPrice, change });

      await ctx.reply(message);
    } catch (error) {
      handleError(error, ctx);
    }
  });

  bot.command("graham", async (ctx) => {
    try {
      const ticker = ctx.state.command.splitArgs[0]?.toUpperCase();

      const usecase = calcularPrecoJusto();
      await usecase.authorize();
      const ucResponse = await usecase.run({ ticker });

      if (ucResponse.isErr) {
        return ctx.reply("Erro interno");
      }

      const { precoJusto, resultado, descontoOuAgio, precoDaAcao } = ucResponse.ok;

      const template = Handlebars.compile(grahamTemplate);
      const message = template({ ticker, precoJusto, resultado, descontoOuAgio, precoDaAcao });

      await ctx.reply(message);
    } catch (error) {
      handleError(error, ctx);
    }
  });

  bot.command("fii", async (ctx) => {
    try {
      const ticker = ctx.state.command.splitArgs[0]?.toUpperCase();

      const usecase = buscarFii();
      await usecase.authorize();
      const ucResponse = await usecase.run({ ticker });

      if (ucResponse.isErr) {
        await ctx.reply(ucResponse.err);
        return;
      }

      const { preco, dividendos, dividendYield } = ucResponse.ok;

      await ctx.reply(
        `O preço do FII ${ticker} é de R$ ${preco} \nCom uma distribuição (12m) de R$ ${dividendos} e yield de ${dividendYield}%`
      );
    } catch (error) {
      handleError(error, ctx);
    }
  });

  bot.command("bitcoin", async (ctx) => {
    try {
      const usecase = bitcoinIndex();
      await usecase.authorize();

      const ucResponse = await usecase.run();

      if (ucResponse.isErr) {
        return ctx.reply(ucResponse.err);
      }

      const { preco, variacao } = ucResponse.ok;

      return ctx.reply(`O preço do Bitcoin é de R$ ${preco}, com variação de ${variacao}%`);
    } catch (error) {
      handleError(error, ctx);
    }
  });

  bot.command("fechamento", async (ctx) => {
    try {
      await ctx.telegram.sendChatAction(ctx.update.message.from.id, "typing");

      const usecase = fechamento();
      await usecase.authorize();

      const ucResponse = await usecase.run();

      if (ucResponse.isErr) {
        await ctx.reply(ucResponse.err);
        return;
      }

      const template = Handlebars.compile(fechamentoTemplate);
      const message = template(ucResponse.ok);

      await ctx.reply(message);
    } catch (error) {
      handleError(error, ctx);
    }
  });

  bot.command("cadastro", async (ctx) => {
    try {
      await ctx.telegram.sendChatAction(ctx.update.message.from.id, "typing");
      const nome = ctx.update.message.from.first_name;

      const params = {
        username: ctx.update.message.from.username,
        type: ctx.update.message.chat.type,
        chatId: ctx.message.chat.id,
      };

      if (params.type !== "private") {
        params.groupInfo = {
          title: ctx.update.message.chat.title,
          members: await ctx.telegram.getChatMembersCount(ctx.message.chat.id),
          admins: await ctx.telegram.getChatAdministrators(ctx.message.chat.id),
        };
      }

      const cliente = Client.fromTelegram(params);

      const usecase = verificaCadastro();

      await usecase.authorize();

      const ucResponse = await usecase.run(cliente);

      if (ucResponse.isErr) {
        await ctx.reply(`Erro ao consultar seu cadastro`);
        return;
      }

      const { estaCadastrado } = ucResponse.ok;

      if (estaCadastrado) {
        await ctx.reply(
          `Olá ${nome}, este chat já está cadastrado para receber a mensagem de fechamento todos os dias.`,
          {
            reply_markup: {
              inline_keyboard: [[{ text: "Descadastrar", callback_data: "alteraCadastro" }]],
            },
          }
        );

        return;
      }

      await ctx.reply(
        `Olá ${nome}, este chat ainda não está cadastrado para receber a mensagem de fechamento todos os dias.`,
        {
          reply_markup: {
            inline_keyboard: [[{ text: "Cadastrar", callback_data: "alteraCadastro" }]],
          },
        }
      );
    } catch (error) {
      handleError(error, ctx);
    }
  });

  bot.action("alteraCadastro", async (ctx) => {
    try {
      await ctx.editMessageReplyMarkup();
      await ctx.telegram.sendChatAction(ctx.update.callback_query.message.chat.id, "typing");
      const nome = ctx.update.callback_query.from.first_name;

      const params = {
        username: ctx.update.callback_query.message.chat.username,
        type: ctx.update.callback_query.message.chat.type,
        chatId: ctx.update.callback_query.message.chat.id,
      };

      if (params.type !== "private") {
        params.groupInfo = {
          title: ctx.update.callback_query.message.chat.title,
          members: await ctx.telegram.getChatMembersCount(
            ctx.update.callback_query.message.chat.id
          ),
          admins: await ctx.telegram.getChatAdministrators(
            ctx.update.callback_query.message.chat.id
          ),
        };
      }

      const cliente = Client.fromTelegram(params);

      const usecase = alteraCadastro();

      await usecase.authorize();

      const ucResponse = await usecase.run(cliente);

      if (ucResponse.isErr) {
        console.log(ucResponse.err);
        return;
      }

      const { estavaCadastrado } = ucResponse.ok;

      const template = Handlebars.compile(alteraCadastroTemplate);
      const message = template({ nome, estavaCadastrado });

      await ctx.reply(message);
    } catch (error) {
      handleError(error, ctx);
    }
  });

  bot.launch();
  console.log("Bot funcionando");

  return bot;
};

const handleError = (error, ctx) => {
  if (error.response?.error_code === 429) {
    console.log(error.message);
    return;
  }

  console.log(error.message);
  return ctx.reply(`Erro interno`);
};

module.exports = runBot;
