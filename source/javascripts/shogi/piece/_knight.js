import Piece from '../_piece'

export default class Knight extends Piece {
  static get movements() {
    return [
      [-1, 2],
      [ 1, 2]
    ]
  }

  static get promotedMovements() {
    return Piece.GoldGeneral.movements
  }
}
