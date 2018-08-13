import Game from './shogi/_game'
import Player from './shogi/_player'
import Board from './shogi/_board'
import Cell from './shogi/_cell'
import Iterator from './shogi/_iterator'
import IteratorDimension from './shogi/iterator/_dimension'
import FiniteIteratorDimension from './shogi/iterator/dimension/_finite'
import InfiniteIteratorDimension from './shogi/iterator/dimension/_infinite'
import Piece from './shogi/_piece'
import King from './shogi/piece/_king'
import GoldGeneral from './shogi/piece/_gold-general'
import SilverGeneral from './shogi/piece/_silver-general'
import Knight from './shogi/piece/_knight'
import Lance from './shogi/piece/_lance'
import Bishop from './shogi/piece/_bishop'
import Rook from './shogi/piece/_rook'
import Pawn from './shogi/piece/_pawn'

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

Object.assign(IteratorDimension, {
  Finite: FiniteIteratorDimension,
  Infinite: InfiniteIteratorDimension
})

export default {
  Game,
  Player,
  Board,
  Cell,
  Piece,
  Iterator
}
