require("dotenv").config();
const { Telegraf } = require("telegraf");
const commandParts = require("./infra/middlewares/telegraf-command-parts");
const calcularPrecoJusto = require("./domain/usecases/calcularPrecoJusto");

const bot = new Telegraf(process.env.TOKEN);

bot.use(commandParts());
bot.command("start", (ctx) => {
  ctx.reply("Bem vindo");
});

bot.command("/graham", async (ctx) => {
  const argument = ctx.state.command.splitArgs[0];

  if (!argument) {
    return ctx.reply("Informe o ticker da ação");
  }

  const ticker = argument.toUpperCase();
  const usecase = calcularPrecoJusto();

  await usecase.authorize();
  const { value: response } = await usecase.run({ ticker });

  if (response.err) {
    return ctx.reply(response.err);
  }

  const message = `O preço justo da ação ${ticker} segundo a fórmula de graham é: R$ ${response.precoJusto} \nCom um ${response.resultado} de ${response.descontoOuAgio}% \nPreço: ${response.precoDaAcao}`;

  ctx.reply(message);
});

bot.launch();
