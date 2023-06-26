const { entity, field, id } = require("@herbsjs/herbs");

const Indice = entity("Indice", {
  id: id(String),
  acoes: field([String]),
});

module.exports = Indice;
