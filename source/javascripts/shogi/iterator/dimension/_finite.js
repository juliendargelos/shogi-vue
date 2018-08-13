import Dimension from '../_dimension'

export default class Finite extends Dimension {
  get value() {
    return this.position + this.delta
  }

  get valid() {
    return (this.iterator.infinite || this.offset === 1) && super.valid
  }
}
