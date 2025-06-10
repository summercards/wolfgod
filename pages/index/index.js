Page({
  data: {
    players: Array.from({ length: 12 }, (_, i) => ({ number: i + 1, alive: true, role: '', killedTonight: false })),
    logs: [],
    phase: 'none',
    flowButtonText: '进入狼人淘汰环节'
  },

  addLog(message) {
    this.setData({
      logs: [...this.data.logs, message]
    });
  },

  onSelectPlayer(e) {
    const index = e.currentTarget.dataset.index;
    const players = [...this.data.players];
    const phase = this.data.phase;

    if (phase === 'night') {
      if (players[index].role === '狼人') {
        players[index].role = '';
        this.addLog(`取消标记 玩家 ${players[index].number} 为狼人`);
      } else {
        players[index].role = '狼人';
        this.addLog(`标记 玩家 ${players[index].number} 为狼人`);
      }
      this.setData({ players });
    } else if (phase === 'wolf_kill') {
      players.forEach(p => p.killedTonight = false); // 清除旧标记
      players[index].killedTonight = true;
      this.setData({ players });
      this.addLog(`狼人选择淘汰 玩家 ${players[index].number}`);
      this.setData({
        phase: 'seer_check',
        flowButtonText: '进入预言家验人环节'
      });
    }
  },

  startGame() {
    this.setData({
      players: Array.from({ length: 12 }, (_, i) => ({ number: i + 1, alive: true, role: '', killedTonight: false })),
      logs: [],
      phase: 'none',
      flowButtonText: '进入狼人淘汰环节'
    });
    this.addLog('游戏开始');
  },

  enterNight() {
    this.setData({ phase: 'night' });
    this.addLog('进入夜晚环节，点击玩家标记身份（如狼人）');
  },

  enterDay() {
    this.setData({ phase: 'day' });
    this.addLog('进入白天环节');
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
  },

  handleFlowAction() {
    const phase = this.data.phase;

    if (phase === 'none' || phase === 'night' || phase === 'day') {
      this.setData({
        phase: 'wolf_kill',
        flowButtonText: '狼人选择淘汰目标中...'
      });
      this.addLog('进入狼人淘汰环节，请狼人点击玩家淘汰');
    } else if (phase === 'seer_check') {
      this.addLog('进入预言家验人环节，请选择要查验的玩家（待实现）');
      // 可继续扩展
    }
  }
});