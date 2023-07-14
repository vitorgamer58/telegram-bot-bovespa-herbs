/* eslint-disable no-prototype-builtins */
const DataMapper = require("@herbsjs/herbs2mongo/src/dataMapper")

class BotDataMapper extends DataMapper {
  constructor(entity, entityIDs, options) {
    super(entity, entityIDs, options)
  }

  removeKeys(obj, keysToRemove) {
    const newObj = {}
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (keysToRemove.includes(key) || obj[key] === null || obj[key] === undefined) {
          continue // Don't copy this key to the new object
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          newObj[key] = this.removeKeys(obj[key], keysToRemove)
        } else {
          newObj[key] = obj[key]
        }
      }
    }
    return newObj
  }

  filterNullAndUndefined(i, instance) {
    if (instance[i.name] !== null && instance[i.name] !== undefined) {
      return { [i.nameDb]: instance[i.name] }
    }
    return null
  }

  collectionFieldsWithValue(instance) {
    let collectionFields = this.allFields
      .map((i) => this.filterNullAndUndefined(i, instance))
      .filter((i) => i !== null)
      .reduce((x, y) => ({ ...x, ...y }))

    if (instance.id === undefined) {
      delete instance.id
      delete collectionFields.id
    } else {
      collectionFields._id = instance.id
      delete collectionFields.id
    }

    collectionFields = this.removeKeys(collectionFields, ["errors"])

    return collectionFields
  }
}

module.exports = BotDataMapper
