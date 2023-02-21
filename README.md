# Telegram_Bot_Bovespa
Código para bot de consulta de preços de ações da Bolsa de Valores

## Instalação
Crie o arquivo .env com base no .env.sample e digite o token do seu bot do telegram, então rode os comandos:
```
npm i
npm start
```

## Comandos
| Comando | Descrição |
|--|--|
| /price + código da ação | retorna a cotação e a variação no dia |
| /fii + código do fundo | retorna a cotação, a variação no dia e o dividend yield dos ultimos 12 meses de acordo com a cotação do dia
| /graham + código da ação | retorna o valor justo de acordo com a fórmula de Graham

## Devidos créditos e direitos autorais de terceiros
Alguns indicadores e o preço da ação derivam da API [mfinance](https://mfinance.com.br/swagger/index.html)

### HerbsJS
O bot usa [HerbsJS](https://herbsjs.org/) para gerenciar funções, chamadas de API e testes unitários, atráves do HerbsJs é possível escrever usecases simples, que permitem injeção de dependência, o que significa melhores mocks e testes unitários, além de abordar o Domain Driven Design (DDD)

## Licença
Você é livre para usar, copiar, modificar, distribuir, fazer uso privado ou comercial, **desde que** dê os devidos créditos aos autores, de acordo com a [licença MIT](https://github.com/vitorgamer58/telegram-bot-bovespa-herbs/blob/master/LICENSE).