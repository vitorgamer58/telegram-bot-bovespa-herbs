# Telegram Bot Bovespa Herbs
Este é um bot de Telegram para consulta de preços de ações na Bolsa de Valores. Ele utiliza diversas APIs para obter indicadores financeiros, preços de ações e outras informações relevantes.

## Instalação
1. Clone o repositório
2. Crie um arquivo .env baseado no .env.sample e insira o token do seu bot do Telegram
3. Instale as dependências com o comando `npm i`
4. Inicie o bot com `npm start`

Se a variável de ambiente for configurada como `development`, a documentação dos usecases pode ser acessada através de `localhost:8080/herbsshelf`

## Uso
O bot oferece os seguintes comandos:

| Comando | Descrição |
|---|---|
| `/price [código da ação]` | Retorna a cotação e a variação no dia |
| `/fii [código do fundo]` | Retorna a cotação, a variação no dia e o dividend yield dos últimos 12 meses de acordo com a cotação do dia |
| `/graham [código da ação]` | Retorna o valor justo de acordo com a fórmula de Graham |
| `/fechamento` | Responde com o fechamento do dia |
| `/cadastro` | Permite ao usuário gerenciar seu próprio cadastro |

## HerbsJS e Domain-Driven Design (DDD)
O bot utiliza a biblioteca [HerbsJS](https://herbsjs.org/) para gerenciar funções, chamadas de API e testes unitários. Através do HerbsJs, é possível escrever usecases simples que permitem injeção de dependência. Isso resulta em melhores mocks e testes unitários, além de facilitar a adoção do padrão Domain Driven Design (DDD).

## Banco de Dados
Este bot utiliza MongoDB para o armazenamento de dados.

## Créditos e Direitos Autorais de Terceiros
Este projeto utiliza dados e recursos de diversas fontes de terceiros:

- [mFinance](https://mfinance.com.br/swagger/index.html): Fornece dados de indicadores financeiros e preços de ações.
- [Coinsamba](https://coinsamba.com/): Fornece informações relevantes de criptomoedas.
- [HerbsJS](https://herbsjs.org/): Biblioteca para gerenciar usecases, e testes unitários.
- [axios](https://axios-http.com/): Biblioteca utilizada para realizar requisições HTTP.

## Licença
Você é livre para usar, copiar, modificar, distribuir, fazer uso privado ou comercial deste projeto, **desde que** dê os devidos créditos aos autores, conforme definido pela [licença MIT](https://github.com/vitorgamer58/telegram-bot-bovespa-herbs/blob/master/LICENSE).