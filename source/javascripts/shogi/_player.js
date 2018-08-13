export default class Player {
  constructor(name) {
    this.name = name
    var type;

    Object.defineProperties(this, {
      type: {
        get() {
          return type
        },

        set(v) {
          type = this.constructor.types.includes(v) ? v : this.constructor.kingGeneral
        }
      }
    })
  }

  get kingGeneral() {
    return this.type === this.constructor.kingGeneral
  }

  get jeweledGeneral() {
    return this.type === this.constructor.jeweledGeneral
  }

  get oppositeType() {
    return this.constructor[`${this.kingGeneral ? 'jeweled' : 'king'}General`]
  }

  get first() {
    return this.kingGeneral
  }

  get typeName() {
    return this.kingGeneral ? 'king-general' : 'jeweled-general'
  }

  reverse() {
    this.type = this.oppositeType
    return this
  }

  static get kingGeneral() {
    return 0
  }

  static get jeweledGeneral() {
    return 1
  }

  static get types() {
    return [this.kingGeneral, this.jeweledGeneral]
  }
}
