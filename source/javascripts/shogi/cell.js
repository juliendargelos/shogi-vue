import Piece from './piece'

export default class Cell {
  constructor(x, y, piece = null) {
    this.x = x
    this.y = y
    this.piece = piece
  }

  at(x, y) {
    return this.x === x && this.y === y
  }

  static collection(board, generate) {
    return generate
      .call(this, Piece.generator(board.kingGeneral), Piece.generator(board.jeweledGeneral))
      .map((piece, index) => new this(index%board.width, Math.floor(index/board.height), piece))
  }
}
