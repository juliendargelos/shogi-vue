import Piece from './piece'

export default class Cell {
  constructor(x, y, piece = null) {
    this.x = x
    this.y = y
    this.piece = piece
  }

  get clone() {
    return new this.constructor(this.x, this.y, this.piece)
  }

  at(x, y) {
    if(x instanceof this.constructor) {
      y = x.y
      x = x.x
    }

    return this.x === x && this.y === y
  }

  static collection(board, generate) {
    return generate
      .call(this, Piece.generator(board.kingGeneral), Piece.generator(board.jeweledGeneral))
      .map((piece, index) => new this(index%board.width, Math.floor(index/board.height), piece))
  }

  static iterator(board, cell, x, y) {
    var deltas = {x, y}
    var infinity = Object.values(deltas).find(delta => Math.abs(delta) === Infinity)
    var maximums = {x: board.width, y: board.height}
    var iterator = {
      offset: 0,

      get valid() {
        return !Object.keys(deltas).find(d => !this[d].valid || this[d].value < 0 || this[d].value >= maximums[d])
      },

      forEach(callback) {
        var movement

        for(this.offset = 1; this.valid; this.offset++) {
          movement = board.cell(this.x.value, this.y.value)
          if(movement && callback.call(this, movement) === false) break
        }
      }
    }

    Object.keys(deltas).forEach(dimension => {
      var delta = deltas[dimension]
      var position = cell[dimension]

      if(Math.abs(delta) !== Infinity) {
        iterator[dimension] = {
          get value() { return position + delta },
          get valid() { return infinity || iterator.offset === 1 }
        }
      }
      else {
        var sign = delta < 0 ? -1 : 1
        iterator[dimension] = {
          get value() { return position + sign*iterator.offset },
          get valid() { return true }
        }
      }
    })

    return iterator
  }
}
