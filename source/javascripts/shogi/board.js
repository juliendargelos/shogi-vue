import Cell from './cell'

export default  class Board {
  constructor() {
    this.player1 = null
    this.player2 = null
  }

  get width() {
    return 9
  }

  get height() {
    return 9
  }

  get pieces() {
    return this.cells.reduce((pieces, cell) => {
      if(cell.piece) pieces.push(cell.piece)
      return pieces
    }, [])
  }

  get kingGeneral() {
    return this.player1.kingGeneral ? this.player1 : this.player2
  }

  get jeweledGeneral() {
    return this.player1.jeweledGeneral ? this.player1 : this.player2
  }

  get player1State() {
    return this.state(this.player1)
  }

  get player2State() {
    return this.state(this.player2)
  }

  state(player, kingCell) {
    if(!kingCell) kingCell = this.cells.find(cell => cell.piece && cell.owner === player && cell.piece.king)
    var king = kingCell.piece
    var kingMovements = this.movements(king, kingCell)

    var state = this.constructor.states.normal

    this.cells.find(cell => {
      var movements = this.movements(cell)

      if(!cell.piece || cell.piece.owner !== player && movements.includes(kingCell)) {
        state = this.constructor.states[movements.find(kingMovements.includes) ? 'checkmate' : 'check']
        return true
      }
    })

    return state
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

  movements(piece, cell) {
    if(piece instanceof Cell) {
      cell = piece
      piece = cell.piece
    }

    if(!piece) return []

    if(!cell) cell = this.cells.find(cell => cell.piece === piece)

    if(cell) {
      var cells = []

      piece.movements.forEach(([dX, dY]) => {
        if(piece.owner.kingGeneral) dY *= -1

        var movementCells = []
        var movementCell, offset;

        if(dX === Infinity && dY === Infinity) {
          for(offset = 1; cell.x + offset < this.width && cell.y + offset < this.height; offset++) {
            movementCell = this.cell(cell.x + offset, cell.y + offset)
            if(movementCell.piece && movementCell.piece.owner === piece.owner) break
            movementCells.push(movementCell)
            if(movementCell.piece && movementCell.piece.owner !== piece.owner) break
          }
        }
        else if(dX === -Infinity && dY === -Infinity) {
          for(offset = 1; cell.x - offset >= 0 && cell.y - offset >= 0; offset++) {
            movementCell = this.cell(cell.x - offset, cell.y - offset)
            if(movementCell.piece && movementCell.piece.owner === piece.owner) break
            movementCells.push(movementCell)
            if(movementCell.piece && movementCell.piece.owner !== piece.owner) break
          }
        }
        else if(dX === Infinity && dY === -Infinity) {
          for(offset = 1; cell.x + offset < this.width && cell.y - offset >= 0; offset++) {
            movementCell = this.cell(cell.x + offset, cell.y - offset)
            if(movementCell.piece && movementCell.piece.owner === piece.owner) break
            movementCells.push(movementCell)
            if(movementCell.piece && movementCell.piece.owner !== piece.owner) break
          }
        }
        else if(dX === -Infinity && dY === Infinity) {
          for(offset = 1; cell.x - offset >= 0 && cell.y + offset < this.height; offset++) {
            movementCell = this.cell(cell.x - offset, cell.y + offset)
            if(movementCell.piece && movementCell.piece.owner === piece.owner) break
            movementCells.push(movementCell)
            if(movementCell.piece && movementCell.piece.owner !== piece.owner) break
          }
        }
        else if(dX === Infinity) {
          for(offset = 1; cell.x + offset < this.width; offset++) {
            movementCell = this.cell(cell.x + offset, cell.y)
            if(movementCell.piece && movementCell.piece.owner === piece.owner) break
            movementCells.push(movementCell)
            if(movementCell.piece && movementCell.piece.owner !== piece.owner) break
          }
        }
        else if(dX === -Infinity) {
          for(offset = 1; cell.x - offset >= 0; offset++) {
            movementCell = this.cell(cell.x - offset, cell.y)
            if(movementCell.piece && movementCell.piece.owner === piece.owner) break
            movementCells.push(movementCell)
            if(movementCell.piece && movementCell.piece.owner !== piece.owner) break
          }
        }
        else if(dY === Infinity) {
          for(offset = 1; cell.y + offset < this.height; offset++) {
            movementCell = this.cell(cell.x, cell.y + offset)
            if(movementCell.piece && movementCell.piece.owner === piece.owner) break
            movementCells.push(movementCell)
            if(movementCell.piece && movementCell.piece.owner !== piece.owner) break
          }
        }
        else if(dY === -Infinity) {
          for(offset = 1; cell.y - offset >= 0; offset++) {
            movementCell = this.cell(cell.x, cell.y - offset)
            if(movementCell.piece && movementCell.piece.owner === piece.owner) break
            movementCells.push(movementCell)
            if(movementCell.piece && movementCell.piece.owner !== piece.owner) break
          }
        }
        else movementCells.push(this.cell(cell.x + dX, cell.y + dY))

        cells.push(...movementCells.filter(c => {
          return c && (!c.piece || c.piece.owner !== piece.owner)
        }))

        // var row = this.row(cell.y).filter(c => !c.piece || c.piece.owner !== cell.piece.owner).map(c => c.x)
        // var col = this.col(cell.x).filter(c => !c.piece || c.piece.owner !== cell.piece.owner).map(c => c.y)

        // var x = {
        //   min: Math.min(Math.max(0, cell.x + dX), ...row),
        //   max: Math.max(Math.min(this.width - 1, cell.x + dX), ...row)
        // }

        // var y = {
        //   min: Math.min(Math.max(0, cell.y + dY), ...col),
        //   max: Math.max(Math.min(this.height - 1, cell.y + dY), ...col)
        // }

        // console.log(x, y)

        // cells.push.apply(cells, this.cells.filter(c => (
        //   (!c.piece || (c.piece.owner !== piece.owner)) &&
        //   (!piece.king || this.state(piece.owner, c) === this.constructor.states.normal) &&
        //   c.x >= x.min &&
        //   c.x <= x.max &&
        //   c.y >= y.min &&
        //   c.y <= y.max
        // )))
      })

      return cells
    }
    else {
      return this.cells.filter(c => (
        !c.piece &&
        (
          !piece.pawn ||
          !c.piece.pawn ||
          c.piece.promoted
        ) &&
        (
          !piece.knight ||
          (c.y >= 2 && piece.owner.kingGeneral) ||
          (c.y <= this.height - 3 && piece.owner.jeweledgeneral)
        ) &&
        (
          (!piece.lance && !piece.pawn) ||
          (c.y !== 0 && piece.owner.kingGeneral) ||
          (c.y !== this.height - 1 && piece.owner.jeweledgeneral)
        )
      ))
    }
  }

  promotable(piece, destination) {
    return (
      piece.promotable &&
      !piece.promoted &&
      this.cells.find(cell => cell.piece === piece) &&
      (
        (piece.owner.kingGeneral && destination.y > this.height - 3) ||
        (piece.owner.jeweledgeneral && destination.y < 2)
      )
    )
  }

  move(piece, destination, promote = false) {
    if(promote && !this.promotable(piece)) return false
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

