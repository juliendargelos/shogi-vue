import Piece from '../_piece'

export default class King extends Piece {
  static get big() {
    return true
  }

  static get movements() {
    return [
      [-1,  1],
      [ 0,  1],
      [ 1,  1],
      [-1,  0],
      [ 1,  0],
      [-1, -1],
      [ 0, -1],
      [ 1, -1],
    ]
  }
}
