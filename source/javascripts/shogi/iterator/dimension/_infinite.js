import Dimension from '../_dimension'

export default class Infinite extends Dimension {
  get sign() {
    return this.delta < 0 ? -1 : 1
  }

  get value() {
    return this.position + this.sign*this.offset
  }
}
