export default class Dimension {
  constructor(iterator, position, delta, maximum) {
    this.iterator = iterator
    this.position = position
    this.delta = delta
    this.maximum = maximum
  }

  get infinite() {
    return Math.abs(this.delta) === Infinity
  }

  get offset() {
    return this.iterator.offset
  }

  get value() {
    return 0
  }

  get valid() {
    return this.value >= 0 && this.value < this.maximum
  }

  static for(iterator, position, delta, maximum) {
    return new (Math.abs(delta) === Infinity ? this.Infinite : this.Finite)(iterator, position, delta, maximum)
  }
}
