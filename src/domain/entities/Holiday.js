const { entity, field, id } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")

const Holiday = entity("Holiday", {
  id: id(String),
  ddmmyyyy: field(String),
  description: field(String),
})

module.exports = herbarium.entities.add(Holiday, "Holiday").entity
