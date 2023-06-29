require("dotenv").config();
const { Telegraf } = require("telegraf");
const { CronJob } = require("cron");
const cronValidator = require("cron-validator");
const cronstrue = require("cronstrue/i18n");
const enviarFechamento = require("../../domain/usecases/enviarFechamento");

const CRON_SCHEDULE = "30 18 * * 1-5";

/**
 * @param {Telegraf<Context<Update>>} bot - A instância do Telegraf usada para interagir com o bot do Telegram.
 *
 * @throws {Error} Se a instância de Telegraf não for passada como argumento.
 * @throws {Error} Se a expressão cron for inválida.
 */
const cronJobs = (bot) => {
  if (!bot) throw new Error("Instância do bot não passada");

  const isCronValid = cronValidator.isValidCron(CRON_SCHEDULE);

  if (!isCronValid) throw new Error(`Expressão cron ${CRON_SCHEDULE} inválida`);

  new CronJob(
    CRON_SCHEDULE,
    async () => {
      try {
        const enviarFechamentoInstance = enviarFechamento({ bot });

        await enviarFechamentoInstance.authorize();

        const ucResponse = await enviarFechamentoInstance.run();

        if (ucResponse.err) await enviaMensagemErro(bot, `Erro usecase: ${ucResponse.err}`);
      } catch (error) {
        await enviaMensagemErro(bot, `Erro ao enviar o fechamento do dia: ${error.message}`);
        console.log(error);
      }
    },
    null,
    true,
    "America/Sao_Paulo"
  );

  const cronPortugues = cronstrue.toString(CRON_SCHEDULE, { locale: "pt_BR" });
  console.log(`⌚ CronJob configurado para rodar ${cronPortugues}`);
};

const enviaMensagemErro = async (bot, mensagem) => {
  await bot.telegram.sendMessage(process.env.OWNER_CHAT_ID, mensagem);
};

module.exports = cronJobs;
