const { entity, field, id } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")

const Indice = entity("Indice", {
  id: id(String),
  acoes: field([String]),
})

module.exports = herbarium.entities.add(Indice, "Indice").entity
