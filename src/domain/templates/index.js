const Handlebars = require("handlebars");

const numberEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];

Handlebars.registerHelper("emojiForIndex", (index) => numberEmojis[index]);

const fechamentoTemplate = `
Confira os dados de fechamento do pregão!🦈

{{dataAtual}}

🇧🇷 IBOVESPA : {{deltaIbov}}%

📈 MAIORES ALTAS DO IBOV
{{#each maioresAltas}}
{{emojiForIndex @index}}️ {{this.symbol}} {{this.change}}%
{{/each}}

📉 MAIORES BAIXAS DO IBOV
{{#each maioresBaixas}}
{{emojiForIndex @index}}️ {{this.symbol}} {{this.change}}%
{{/each}}

💥 MAIS NEGOCIADAS DO PREGÃO
{{#each maisNegociadas}}
{{emojiForIndex @index}}️ {{this.symbol}} {{this.change}}%
{{/each}}
`;

const startTemplate = `Bem vindo {{firstName}}, eu sou um robô, alguns dos meus comandos são:
/price + Código da ação (Responde com o valor da ação)
/bitcoin Responde com a cotação do bitcoin
/cripto + Código da cripto (Responde com a cotação da cripto)
/fundamentus + Código da ação (Responde com o valor da ação)
/graham + Código da ação (Responde com o preço justo segundo a fórmula de Graham)
/fechamento (responde com as maiores altas e maiores baixas do ibov)`;

const alteraCadastroTemplate = `{{#if estavaCadastrado}}Olá {{nome}}, o chat atual foi descadastrado
{{else}}Olá {{nome}}, este chat foi cadastrado para receber a mensagem de fechamento todos os dias.
{{/if}}
`;

const priceTemplate = `O preço da ação {{ticker}} é R$ {{lastPrice}} sendo a variação no dia de {{change}}%`;

const grahamTemplate = `O preço justo da ação {{ticker}} segundo a fórmula de graham é: R$ {{precoJusto}} \n
Com um {{resultado}} de {{descontoOuAgio}}% \n
Preço: {{precoDaAcao}}`;

module.exports = {
  fechamentoTemplate,
  startTemplate,
  alteraCadastroTemplate,
  priceTemplate,
  grahamTemplate
};
