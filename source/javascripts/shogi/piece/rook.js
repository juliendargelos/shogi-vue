import Piece from '../piece'

export default class Rook extends Piece {
  static get big() {
    return true
  }

  static get movements() {
    return [
      [        0,  Infinity],
      [-Infinity,         0],
      [ Infinity,         0],
      [        0, -Infinity]
    ]
  }

  static get promotedMovements() {
    return this.movements.concat([
      [-1,  1],
      [ 1,  1],
      [-1, -1],
      [ 1, -1]
    ])
  }
}
