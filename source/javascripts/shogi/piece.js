export default class Piece {
  constructor(owner) {
    this.owner = owner
    if(this.promotable) this.promoted = false
  }

  get movements() {
    return this.constructor[this.promoted ? 'promotedMovements' : 'movements']
  }

  get big() {
    return this.constructor.big
  }

  get typeName() {
    return this.constructor.typeName
  }

  get promotable() {
    return this.constructor.promotable
  }

  static get big() {
    return false
  }

  static get id() {
    return this.name.substring(0, 2).toLowerCase()
  }

  static get typeName() {
    return this.name.replace(/([^A-Z])([A-Z]+)/, '$1-$2').toLowerCase()
  }

  static get movements() {
    return []
  }

  static get promotedMovements() {
    return []
  }

  static get promotable() {
    return !!this.promotedMovements.length
  }

  static for(id) {
    return this.all ? this.all.find(piece => piece.id === id) : null
  }

  static generator(owner) {
    return new Proxy({}, {
      get: (object, id) => new (Piece.for(id))(owner)
    })
  }
}
