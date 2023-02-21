require("dotenv").config();
const { Telegraf } = require("telegraf");
const commandParts = require("./infra/middlewares/telegraf-command-parts");
const calcularPrecoJusto = require("./domain/usecases/calcularPrecoJusto");
const buscaPreco = require("./domain/usecases/buscaPreco");
const buscarFii = require("./domain/usecases/buscaFii");

const bot = new Telegraf(process.env.TOKEN);

bot.use(commandParts());
bot.command("start", (ctx) => {
  ctx.reply("Bem vindo");
});

bot.command("price", async (ctx) => {
  try {
    const ticker = ctx.state.command.splitArgs[0]?.toUpperCase();

    const usecase = buscaPreco();
    await usecase.authorize();
    const ucResponse = await usecase.run({ ticker });

    if (ucResponse.err) {
      return ctx.reply(ucResponse.err);
    }

    const { lastPrice, change } = ucResponse.ok;

    const message = `O preço da ação ${ticker} é R$ ${lastPrice} sendo a variação no dia de ${change}%`;

    ctx.reply(message);
  } catch (error) {
    console.log(error)
    return ctx.reply('Erro interno')
  }
});

bot.command("graham", async (ctx) => {
  try {
    const ticker = ctx.state.command.splitArgs[0]?.toUpperCase;

    const usecase = calcularPrecoJusto();
    await usecase.authorize();
    const ucResponse = await usecase.run({ ticker });

    if (ucResponse.err) {
      return ctx.reply(ucResponse.err);
    }

    const { precoJusto, resultado, descontoOuAgio, precoDaAcao } = ucResponse.ok;

    const message = `O preço justo da ação ${ticker} segundo a fórmula de graham é: R$ ${precoJusto} \nCom um ${resultado} de ${descontoOuAgio}% \nPreço: ${precoDaAcao}`;

    ctx.reply(message);
  } catch (error) {
    console.log(error)
    return ctx.reply('Erro interno')
  }
});

bot.command("fii", async (ctx) => {
  try {
    const ticker = ctx.state.command.splitArgs[0]?.toUpperCase();

    const usecase = buscarFii();
    await usecase.authorize();
    const ucResponse = await usecase.run({ ticker });

    if (ucResponse.err) {
      return ctx.reply(ucResponse.err);
    }

    const { preco, dividendos, dividendYield } = ucResponse.ok;

    return ctx.reply(`O preço do FII ${ticker} é de R$ ${preco} \nCom uma distribuição (12m) de R$ ${dividendos} e yield de ${dividendYield}%`);
  } catch (error) {
    console.log(error)
    return ctx.reply('Erro interno')
  }
});

bot.launch();
console.log("Funcionando");
