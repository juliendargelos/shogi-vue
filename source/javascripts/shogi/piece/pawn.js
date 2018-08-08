import Piece from '../piece'

export default class Pawn extends Piece {
  static get movements() {
    return [
      [0, 1]
    ]
  }

  static get promotedMovements() {
    return Piece.GoldGeneral.movements
  }
}
