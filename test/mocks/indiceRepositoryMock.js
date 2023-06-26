class IndiceRepositoryMock {
  constructor() {
    this.data = [{ indice: "IBOV", acoes: ["IBOV", "ABEV3", "BBAS3", "PETR4"] }];
  }

  find() {
    return this.data;
  }
}

module.exports = { IndiceRepositoryMock };
