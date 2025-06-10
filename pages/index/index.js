Page({
  data: {
    players: Array.from({ length: 12 }, (_, i) => ({ number: i + 1, alive: true })),
    logs: []
  },

  addLog(message) {
    this.setData({
      logs: [...this.data.logs, message]
    });
  },

  onSelectPlayer(e) {
    const index = e.currentTarget.dataset.index;
    const player = this.data.players[index];
    this.addLog(`选择了玩家 ${player.number}`);
  },

  startGame() {
    this.addLog('游戏开始');
  },

  enterNight() {
    this.addLog('进入夜晚');
  },

  enterDay() {
    this.addLog('进入白天');
  },

  vote() {
    this.addLog('开始投票环节');
  },

  killPlayer() {
    const alivePlayers = this.data.players.filter(p => p.alive);
    if (alivePlayers.length > 0) {
      const index = this.data.players.findIndex(p => p.alive);
      const players = [...this.data.players];
      players[index].alive = false;
      this.setData({ players });
      this.addLog(`玩家 ${players[index].number} 被淘汰`);
    }
  }
});