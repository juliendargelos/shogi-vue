import Cell from './_cell'

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
        if(cell.piece && cell.piece.owner !== player) {
          var movements = board.movements(cell, null, false)

          if(movements.includes(kingCell)) {
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
          }
        }
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
      Cell.iterator(this, cell, x, y).forEach(movement => {
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

    if(piece.pawn || piece.lance) movements = piece.owner.jeweledGeneral ? movements.filter(cell => cell.y < this.height - 1) : movements.filter(cell => cell.y > 0)
    else if(piece.knight) movements = piece.owner.jeweledGeneral ? movements.filter(cell => cell.y < this.height - 2) : movements.filter(cell => cell.y > 1)

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
    if(promote && !this.promotable(piece, destination)) return false
    if(this.movements(piece).includes(destination)) {
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
    else return false
  }

  toString() {
    var letters = {
      a: 'Ａ', b: 'Ｂ', c: 'Ｃ', d: 'Ｄ', e: 'Ｅ', f: 'Ｆ', g: 'Ｇ',
      h: 'Ｈ', i: 'Ｉ', j: 'Ｊ', k: 'Ｋ', l: 'Ｌ', m: 'Ｍ', n: 'Ｎ',
      o: 'Ｏ', p: 'Ｐ', q: 'Ｑ', r: 'Ｒ', s: 'Ｓ', y: 'Ｔ', u: 'Ｕ',
      v: 'Ｖ', w: 'Ｗ', x: 'Ｘ', y: 'Ｙ', z: 'Ｚ'
    }
    var space = ' '

    var c = (x, y) => {
      var cell = this.cell(x, y)
      return cell.piece ? cell.piece.constructor.id.split('').map(l => letters[l]).join('') : space + space
    }

    return (
      "\n" +
      '┌──┬──┬──┬──┬──┬──┬──┬──┬──┐' + "\n" +
      `│${c(0, 0)}│${c(1, 0)}│${c(2, 0)}│${c(3, 0)}│${c(4, 0)}│${c(5, 0)}│${c(6, 0)}│${c(7, 0)}│${c(8, 0)}│` + "\n" +
      '├──┼──┼──┼──┼──┼──┼──┼──┼──┤' + "\n" +
      `│${c(0, 1)}│${c(1, 1)}│${c(2, 1)}│${c(3, 1)}│${c(4, 1)}│${c(5, 1)}│${c(6, 1)}│${c(7, 1)}│${c(8, 1)}│` + "\n" +
      '├──┼──┼──┼──┼──┼──┼──┼──┼──┤' + "\n" +
      `│${c(0, 2)}│${c(1, 2)}│${c(2, 2)}│${c(3, 2)}│${c(4, 2)}│${c(5, 2)}│${c(6, 2)}│${c(7, 2)}│${c(8, 2)}│` + "\n" +
      '├──┼──┼──┼──┼──┼──┼──┼──┼──┤' + "\n" +
      `│${c(0, 3)}│${c(1, 3)}│${c(2, 3)}│${c(3, 3)}│${c(4, 3)}│${c(5, 3)}│${c(6, 3)}│${c(7, 3)}│${c(8, 3)}│` + "\n" +
      '├──┼──┼──┼──┼──┼──┼──┼──┼──┤' + "\n" +
      `│${c(0, 4)}│${c(1, 4)}│${c(2, 4)}│${c(3, 4)}│${c(4, 4)}│${c(5, 4)}│${c(6, 4)}│${c(7, 4)}│${c(8, 4)}│` + "\n" +
      '├──┼──┼──┼──┼──┼──┼──┼──┼──┤' + "\n" +
      `│${c(0, 5)}│${c(1, 5)}│${c(2, 5)}│${c(3, 5)}│${c(4, 5)}│${c(5, 5)}│${c(6, 5)}│${c(7, 5)}│${c(8, 5)}│` + "\n" +
      '├──┼──┼──┼──┼──┼──┼──┼──┼──┤' + "\n" +
      `│${c(0, 6)}│${c(1, 6)}│${c(2, 6)}│${c(3, 6)}│${c(4, 6)}│${c(5, 6)}│${c(6, 6)}│${c(7, 6)}│${c(8, 6)}│` + "\n" +
      '├──┼──┼──┼──┼──┼──┼──┼──┼──┤' + "\n" +
      `│${c(0, 7)}│${c(1, 7)}│${c(2, 7)}│${c(3, 7)}│${c(4, 7)}│${c(5, 7)}│${c(6, 7)}│${c(7, 7)}│${c(8, 7)}│` + "\n" +
      '├──┼──┼──┼──┼──┼──┼──┼──┼──┤' + "\n" +
      `│${c(0, 8)}│${c(1, 8)}│${c(2, 8)}│${c(3, 8)}│${c(4, 8)}│${c(5, 8)}│${c(6, 8)}│${c(7, 8)}│${c(8, 8)}│` + "\n" +
      '└──┴──┴──┴──┴──┴──┴──┴──┴──┘' +
      "\n"
    )
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

