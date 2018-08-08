import Game from './shogi/game'
import Player from './shogi/player'
import Board from './shogi/board'
import Cell from './shogi/cell'
import Piece from './shogi/piece'
import King from './shogi/piece/king'
import GoldGeneral from './shogi/piece/gold-general'
import SilverGeneral from './shogi/piece/silver-general'
import Knight from './shogi/piece/knight'
import Lance from './shogi/piece/lance'
import Bishop from './shogi/piece/bishop'
import Rook from './shogi/piece/rook'
import Pawn from './shogi/piece/pawn'

Object.assign(Piece, {
  King,
  GoldGeneral,
  SilverGeneral,
  Knight,
  Lance,
  Bishop,
  Rook,
  Pawn
})

Piece.all = Object.values(Piece)
Piece.all.forEach(piece => {
  Object.defineProperty(Piece.prototype, piece.name[0].toLowerCase() + piece.name.substring(1), {
    get() {
      return this.constructor === piece
    }
  })
})

export default {
  Game,
  Player,
  Board,
  Cell,
  Piece
}
