const { entity, field } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")

const Dividend = entity("Dividend", {
  declaredDate: field(Date),
  payDate: field(Date),
  value: field(Number),
})

module.exports = herbarium.entities.add(Dividend, "Dividend").entity
