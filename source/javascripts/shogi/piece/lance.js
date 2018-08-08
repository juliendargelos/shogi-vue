import Piece from '../piece'

export default class Lance extends Piece {
  static get movements() {
    return [
      [0, Infinity]
    ]
  }

  static get promotedMovements() {
    return Piece.GoldGeneral.movements
  }
}
