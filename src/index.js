require("dotenv").config();
const { Telegraf } = require("telegraf");
const commandParts = require("./infra/middlewares/telegraf-command-parts");
const calcularPrecoJusto = require("./domain/usecases/calcularPrecoJusto");
const buscaPreco = require("./domain/usecases/buscaPreco");

const bot = new Telegraf(process.env.TOKEN);

bot.use(commandParts());
bot.command("start", (ctx) => {
  ctx.reply("Bem vindo");
});

bot.command("price", async (ctx) => {
  const argument = ctx.state.command.splitArgs[0];

  if (!argument) {
    return ctx.reply("Informe o ticker da ação");
  }

  const ticker = argument.toUpperCase();
  const usecase = buscaPreco();

  await usecase.authorize();
  const { ok: response } = await usecase.run({ ticker });

  if (response.err) {
    return ctx.reply(response.err);
  }

  const { lastPrice, change } = response;

  const message = `O preço da ação ${ticker} é R$ ${lastPrice} sendo a variação no dia de ${change}%`;

  ctx.reply(message);
});

bot.command("graham", async (ctx) => {
  const argument = ctx.state.command.splitArgs[0];

  if (!argument) {
    return ctx.reply("Informe o ticker da ação");
  }

  const ticker = argument.toUpperCase();
  const usecase = calcularPrecoJusto();

  await usecase.authorize();
  const { ok: response } = await usecase.run({ ticker });

  if (response.err) {
    return ctx.reply(response.err);
  }

  const { precoJusto, resultado, descontoOuAgio, precoDaAcao } = response;

  const message = `O preço justo da ação ${ticker} segundo a fórmula de graham é: R$ ${precoJusto} \nCom um ${resultado} de ${descontoOuAgio}% \nPreço: ${precoDaAcao}`;

  ctx.reply(message);
});

bot.launch();
console.log("Funcionando");
