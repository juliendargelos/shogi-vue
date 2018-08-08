<template>
  <div class="piece" :class="className"></div>
</template>

<script>
  export default {
    props: ['piece'],

    computed: {
      className() {
        return [
          `piece--${this.piece.typeName}`,
          `piece--${this.piece.owner.typeName}`,
          this.piece.big ? 'piece--big' : null,
          this.piece.promoted ? 'piece--promoted' : null
        ].filter(className => !!className).join(' ')
      }
    }
  }
</script>

<style lang="sass">
  .piece
    background:
      size: 75% 75%
      position: center center
      repeat: no-repeat

    &--big
      background-size: 90% 90%

    @each $type in king, gold-general, silver-general, knight, lance, bishop, rook, pawn
      &--#{$type}
        background-image: url('~/../images/pieces/#{$type}.svg')

      &--#{$type}#{&}--promoted
        background-image: url('~/../images/pieces/#{$type}-promoted.svg')

    &--king#{&}--jeweled-general
      background-image: url('~/../images/pieces/king-jeweled-general.svg')

    &--jeweled-general
      transform: rotate(180deg)
</style>
