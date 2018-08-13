import Cell from './_cell'
import Iterator from './_iterator'

export default  class Board {
  constructor() {
    this.player1 = null
    this.player2 = null
    this.cells = []
    this.pieces = []
  }

  get width() {
    return 9
  }

  get height() {
    return 9
  }

  get kingGeneral() {
    return this.player1.kingGeneral ? this.player1 : this.player2
  }

  get jeweledGeneral() {
    return this.player1.jeweledGeneral ? this.player1 : this.player2
  }

  get players() {
    return [this.player1, this.player2]
  }

  get usedPieces() {
    return this.cells.reduce((pieces, cell) => {
      if(cell.piece) pieces.push(cell.piece)
      return pieces
    }, [])
  }

  piecesCapturedBy(player) {
    var usedPieces = this.usedPieces
    var length = this.pieces.length - usedPieces.length
    var capturedPieces = []

    this.pieces.find(piece => {
      if(capturedPieces.length >= length) return true
      if(!usedPieces.includes(piece) && piece.owner === player) capturedPieces.push(piece)
    })

    return capturedPieces
  }

  stateOf(player, checkmate = true, gna = false) {
    var state = this.constructor.states.normal

    this.clone((board, reset) => {
      var kingCell = board.cells.find(cell => cell.piece && cell.piece.king && cell.piece.owner === player)
      var kingMovements = board.movements(kingCell, null, false)

      board.cells.find(cell => {
        if(!cell.piece || cell.piece.owner === player) return false
        var movements = board.movements(cell, null, false)
        if(!movements.includes(kingCell)) return false
        if(checkmate) {
          state = this.constructor.states.checkmate
          kingMovements.find(movement => {
            movement.piece = kingCell.piece
            kingCell.piece = null

            if(board.stateOf(player, false) === this.constructor.states.normal) {
              state = this.constructor.states.check
              return true
            }

            reset()
          })
        }
        else state = this.constructor.states.check

        return true
      })
    })

    return state
  }

  clone(callback) {
    var board = new this.constructor()
    board.player1 = this.player1
    board.player2 = this.player2
    board.cells = this.cells.map(cell => cell.clone)
    var reset = () => board.cells.forEach((cell, index) => { cell.piece = this.cells[index].piece })
    callback.call(this, board, reset)
    reset()
  }

  cell(x, y) {
    return this.cells.find(cell => cell.at(x, y))
  }

  row(y) {
    return this.cells.filter(cell => cell.y === y)
  }

  col(x) {
    return this.cells.filter(cell => cell.x === x)
  }

  movements(piece, cell, checkmate = true) {
    if(piece instanceof Cell) {
      cell = piece
      piece = cell.piece
    }

    if(!piece) return []
    if(!cell) cell = this.cells.find(cell => cell.piece === piece)

    var movements = this[`movementsFor${cell ? 'Used' : 'Captured'}`](piece, cell)

    if(checkmate) {
      this.clone((board, reset) => {
        var clonedCell = cell ? board.cell(cell.x, cell.y) : null

        movements = movements.filter(c => {
          board.cell(c.x, c.y).piece = piece
          if(clonedCell) clonedCell.piece = null

          var isCheckCell = board.stateOf(piece.owner, false, true) !== this.constructor.states.normal

          reset()

          return !isCheckCell
        })
      })
    }

    return movements
  }

  movementsForUsed(piece, cell) {
    var movements = []

    piece.movements.forEach(([x, y]) => {
      new Iterator(this, cell, x, y).forEach(movement => {
        if(movement.piece && movement.piece.owner === piece.owner) return false
        if(!movement.piece || movement.piece.owner !== piece.owner) movements.push(movement)
        if(movement.piece && movement.piece.owner !== piece.owner) return false
      })
    })

    return movements
  }

  movementsForCaptured(piece) {
    var movements = this.cells.filter(cell => !cell.piece)

    if(piece.pawn) {
      movements = movements
        .filter(cell => !this.col(cell.x).find(c => c.piece && c.piece.pawn && c.piece.owner === piece.owner && !c.piece.promoted))
        .filter(cell => !(c => c && c.piece && c.piece.king && c.piece.owner !== piece.owner)(this.cell(cell.x, cell.y + (piece.owner.jeweledGeneral ? 1 : -1))))
    }

    if(piece.pawn || piece.lance || piece.knight) {
      var offset = piece.knight ? 2 : 1
      movements = movements.filter(piece.owner.jeweledGeneral ? cell => cell.y < this.height - offset : cell => cell.y > offset - 1)
    }

    return movements
  }

  promotable(piece, destination) {
    return (
      piece.promotable &&
      !piece.promoted &&
      this.cells.find(cell => cell.piece === piece) &&
      (
        (piece.owner.jeweledGeneral && destination.y > this.height - 4) ||
        (piece.owner.kingGeneral && destination.y < 3)
      )
    )
  }

  move(piece, destination, promote = false) {
    if((promote && !this.promotable(piece, destination)) || !this.movements(piece).includes(destination)) return false
    if(destination.piece) {
      destination.piece.owner = piece.owner
      if(destination.piece.promoted) destination.piece.promoted = false
    }

    var cell = this.cells.find(cell => cell.piece === piece)
    destination.piece = piece
    if(promote) piece.promoted = true
    if(cell) cell.piece = null

    return true
  }

  init(player1, player2) {
    this.player1 = player1
    this.player2 = player2

    this.cells = Cell.collection(this, (k, j) => [
      j.la, j.kn, j.si, j.go, j.ki, j.go, j.si, j.kn, j.la,
      null, j.bi, null, null, null, null, null, j.ro, null,
      j.pa, j.pa, j.pa, j.pa, j.pa, j.pa, j.pa, j.pa, j.pa,
      null, null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null,
      k.pa, k.pa, k.pa, k.pa, k.pa, k.pa, k.pa, k.pa, k.pa,
      null, k.ro, null, null, null, null, null, k.bi, null,
      k.la, k.kn, k.si, k.go, k.ki, k.go, k.si, k.kn, k.la
    ])

    this.pieces = this.usedPieces

    return this
  }

  static get states() {
    return {
      normal: 0,
      check: 1,
      checkmate: 2
    }
  }
}

