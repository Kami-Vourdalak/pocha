<template>
  <div>
    <span v-if="!isGameStarted">Nueva partida</span>
    <div v-else>
      <span>Ronda: {{ $store.state.currentGame.round }}</span>
      <span>Carta/s: {{ cards }}</span>
    </div>
    <button v-if="!isGameStarted" @click="startGame">Empezar</button>
    <button v-if="isGameStarted" @click="doNextRound">
      Siguiente Ronda >
    </button>
    <div class="middle">
      <players-list
        v-if="!isGameStarted"
        :players="gamePlayerNames"
        :show-delete="!isGameStarted"
        @on-delete-player="deleteGamePlayer"
        class="marked"
      />
      <points-player-list
        v-else
        :players="gamePlayers"
        :max-points="cards"
        @set-player-bet="setPlayerBet"
        @set-player-points="setPlayerPoints"
        class="marked"
      />
    </div>
    <players-list
      v-if="showSelectPlayers"
      :players="$store.getters.playersNotInGame"
      :show-delete="false"
      @on-player-click="choosePlayer"
    />
    <div class="bottom">
      <button
        v-if="!isGameStarted"
        @click="showSelectPlayers = !showSelectPlayers"
      >
        + Jugador
      </button>
      <button @click="$router.push('/')">Salir</button>
    </div>
  </div>
</template>

<script>
import PlayersList from '../components/playersList'
import PointsPlayerList from '../components/pointsPlayerList'
export default {
  name: 'Game',
  components: { PlayersList, PointsPlayerList },
  data() {
    return {
      cards: 1,
      showSelectPlayers: false
    }
  },
  computed: {
    gamePlayerNames() {
      return this.$store.state.currentGame.players.map(player => player.name)
    },
    gamePlayers() {
      return this.$store.state.currentGame.players
    },
    round() {
      return this.$store.state.currentGame.round
    },
    isGameStarted() {
      return this.$store.state.currentGame.round !== 0
    }
  },
  methods: {
    startGame() {
      if (this.gamePlayers.length < 3) {
        return this.$store.commit('showAlert', {
          isVisible: true,
          type: 'info',
          title: 'A veeer...',
          message: 'No hay jugadores suficientes'
        })
      } else {
        this.$store.commit('startGame')
      }
    },
    deleteGamePlayer(playerName) {
      this.$store.commit('deleteGamePlayer', playerName)
    },
    choosePlayer(playerName) {
      this.$store.commit('choosePlayer', playerName)
      this.showSelectPlayers = false
    },
    setPlayerBet({ name, bet }) {
      this.$store.commit('setPlayerBet', { name, bet })
    },
    setPlayerPoints({ name, points }) {
      this.$store.commit('setPlayerPoints', { name, points })
    },
    doNextRound() {
      const numberOfPlayers = this.gamePlayers.length
      const coefficient = Math.trunc(40 / numberOfPlayers)
      const round = this.round + 1
      let cards = 0

      if (
        round <= numberOfPlayers ||
        round > 2 * numberOfPlayers + 2 * (coefficient - 2)
      ) {
        cards = 1
      } else if (
        round > numberOfPlayers &&
        round < numberOfPlayers + coefficient - 1
      ) {
        cards = round - numberOfPlayers + 1
      } else if (
        round >= numberOfPlayers + coefficient - 1 &&
        round <= 2 * numberOfPlayers + coefficient - 2
      ) {
        cards = coefficient
      } else if (
        round >= numberOfPlayers + coefficient - 1 &&
        round < 2 * numberOfPlayers + 2 * (coefficient - 2) + 1
      ) {
        cards = 2 * numberOfPlayers + coefficient - 2 + coefficient - round
      } else {
        cards = 9999999
      }

      this.cards = cards
      const playerBets = this.gamePlayers.reduce(
        (acc, next) => acc + next.bet,
        0
      )
      const playerPoints = this.gamePlayers.reduce(
        (acc, next) => acc + next.points,
        0
      )
      if (playerBets === cards) {
        return this.$store.commit('showAlert', {
          isVisible: true,
          type: 'error',
          title: 'Ojo!',
          message:
            'Las apuestas son igual a las cartas. Alguien tiene ke pringar'
        })
      }
      // if (playerBets === playerPoints) {
      //   // TODO: No se si hay ke kitar esto
      //   return alert(
      //     'Las apuestas son igual a los aciertos\nAlguien tiene ke pringar'
      //   )
      // }
      if (playerPoints !== cards) {
        return this.$store.commit('showAlert', {
          isVisible: true,
          type: 'error',
          title: 'Ojo!',
          message:
            'Las jugadas ganadas tienen que ser igual al numero de cartas repartidas. Te has colao bacalao'
        })
      }
      this.$store.commit('nextRound')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.marked {
  color: #42b983;
}
.bottom {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  bottom: 36px;
}
</style>
