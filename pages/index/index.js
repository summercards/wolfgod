Page({
  data: {
    players: Array.from({ length: 12 }, (_, i) => ({
      number: i + 1,
      alive: true,
      role: '',
      killedTonight: false,
      verifyResult: ''
    })),
    logs: [],
    phase: 'none',
    flowButtonText: '进入狼人淘汰环节'
  },

  addLog(message) {
    this.setData({ logs: [...this.data.logs, message] });
  },

  onSelectPlayer(e) {
    const index = e.currentTarget.dataset.index;
    const players = [...this.data.players];
    const phase = this.data.phase;

    if (phase === 'night') {
      players[index].role = players[index].role === '狼人' ? '' : '狼人';
      this.addLog(`${players[index].role === '狼人' ? '标记' : '取消标记'} 玩家 ${players[index].number} 为狼人`);
    } else if (phase === 'wolf_kill') {
      players.forEach(p => p.killedTonight = false);
      players[index].killedTonight = true;
      this.addLog(`狼人选择淘汰 玩家 ${players[index].number}`);
    } else if (phase === 'seer_pick') {
      players.forEach(p => {
        if (p.role === '预言家') p.role = '';
      });
      players[index].role = '预言家';
      this.addLog(`标记 玩家 ${players[index].number} 为预言家`);
    } else if (phase === 'seer_verify') {
      players.forEach(p => p.verifyResult = '');
      const target = players[index];
      target.verifyResult = (target.role === '狼人') ? '验狼人' : '验好人';
      this.addLog(`预言家查验 玩家 ${target.number} 是 ${target.verifyResult}`);
    } else if (phase === 'witch_pick') {
      players.forEach(p => {
        if (p.role === '女巫') p.role = '';
      });
      players[index].role = '女巫';
      this.addLog(`标记 玩家 ${players[index].number} 为女巫`);
    }

    this.setData({ players });
  },

  handleFlowAction() {
    let newPhase = '';
    let newText = '';
    let log = '';

    switch (this.data.phase) {
      case 'none':
      case 'night':
      case 'day':
        newPhase = 'wolf_kill';
        newText = '标记预言家';
        log = '进入狼人淘汰环节，请狼人选择淘汰目标';
        break;
      case 'wolf_kill':
        newPhase = 'seer_pick';
        newText = '预言家验人';
        log = '请点击玩家，标记谁是预言家';
        break;
      case 'seer_pick':
        newPhase = 'seer_verify';
        newText = '标记女巫';
        log = '进入预言家验人环节，请点击要查验的玩家';
        break;
      case 'seer_verify':
        newPhase = 'witch_pick';
        newText = '使用解药环节';
        log = '请点击玩家，标记谁是女巫';
        break;
      case 'witch_pick':
        newPhase = 'witch_cure';
        newText = '使用毒药环节';
        log = '进入解药使用环节（可复活被淘汰玩家）';
        break;
      case 'witch_cure':
        newPhase = 'witch_poison';
        newText = '进入白天';
        log = '进入毒药使用环节，可毒死一名玩家';
        break;
      default:
        newPhase = 'day';
        newText = '开始投票';
        log = '进入白天环节';
    }

    this.setData({ phase: newPhase, flowButtonText: newText });
    this.addLog(log);
  },

  startGame() {
    this.setData({
      players: Array.from({ length: 12 }, (_, i) => ({
        number: i + 1,
        alive: true,
        role: '',
        killedTonight: false,
        verifyResult: ''
      })),
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
  }
});