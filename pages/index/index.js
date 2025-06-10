
Page({
  data: {
    players: Array.from({ length: 12 }, (_, i) => ({
      number: i + 1,
      alive: true,
      role: '',
      killedTonight: false,
      verifyResult: '',
      guarded: false
    })),
    logs: [],
    phase: 'none',
    subPhase: '',
    flowButtonText: '开始游戏'
  },

  addLog(message) {
    this.setData({ logs: [...this.data.logs, message] });
  },

  onSelectPlayer(e) {
    const index = e.currentTarget.dataset.index;
    const players = [...this.data.players];
    const { phase, subPhase } = this.data;

    if (phase === 'night') {
      if (subPhase === 'wolf_mark') {
        players[index].role = players[index].role === '狼人' ? '' : '狼人';
        this.addLog(`${players[index].role === '狼人' ? '标记' : '取消标记'} 玩家 ${players[index].number} 为狼人`);
      } else if (subPhase === 'wolf_kill') {
        players.forEach(p => p.killedTonight = false);
        players[index].killedTonight = true;
        this.addLog(`狼人选择淘汰 玩家 ${players[index].number}`);
      } else if (subPhase === 'seer_mark') {
        players.forEach(p => { if (p.role === '预言家') p.role = ''; });
        players[index].role = '预言家';
        this.addLog(`标记 玩家 ${players[index].number} 为预言家`);
      } else if (subPhase === 'seer_verify') {
        players.forEach(p => p.verifyResult = '');
        const target = players[index];
        target.verifyResult = (target.role === '狼人') ? '验狼人' : '验好人';
        this.addLog(`预言家查验 玩家 ${target.number} 是 ${target.verifyResult}`);
      } else if (subPhase === 'witch_mark') {
        players.forEach(p => { if (p.role === '女巫') p.role = ''; });
        players[index].role = '女巫';
        this.addLog(`标记 玩家 ${players[index].number} 为女巫`);
      } else if (subPhase === 'witch_poison') {
        if (players[index].alive) {
          players[index].alive = false;
          this.addLog(`女巫使用毒药，毒死了 玩家 ${players[index].number}`);
        } else {
          this.addLog(`玩家 ${players[index].number} 已经死亡，无法再被毒杀`);
        }
      } else if (subPhase === 'guard_mark') {
        players.forEach(p => { if (p.role === '守卫') p.role = ''; });
        players[index].role = '守卫';
        this.addLog(`标记 玩家 ${players[index].number} 为守卫`);
      } else if (subPhase === 'guard_protect') {
        players.forEach(p => p.guarded = false);
        players[index].guarded = true;
        this.addLog(`守卫选择守护 玩家 ${players[index].number}`);
      } else if (subPhase === 'hunter_mark') {
        players.forEach(p => { if (p.role === '猎人') p.role = ''; });
        players[index].role = '猎人';
        this.addLog(`标记 玩家 ${players[index].number} 为猎人`);
      }
    }

    this.setData({ players });
  },

  handleFlowAction() {
    const nextMap = {
      none: { phase: 'night', subPhase: 'wolf_mark', text: '狼人请睁眼' },
      wolf_mark: { subPhase: 'wolf_kill', text: '狼人请杀人' },
      wolf_kill: { subPhase: 'seer_mark', text: '狼人请闭眼，预言家请睁眼' },
      seer_mark: { subPhase: 'seer_verify', text: '预言家请验人' },
      seer_verify: { subPhase: 'witch_mark', text: '预言家请闭眼，女巫请睁眼' },
      witch_mark: { subPhase: 'witch_cure', text: '女巫是否使用解药？' },
      witch_cure: { subPhase: 'witch_poison', text: '女巫是否使用毒药？' },
      witch_poison: { subPhase: 'guard_mark', text: '女巫请闭眼，守卫请睁眼' },
      guard_mark: { subPhase: 'guard_protect', text: '守卫请守护目标' },
      guard_protect: { subPhase: 'hunter_mark', text: '守卫请闭眼，猎人请睁眼' },
      hunter_mark: { phase: 'day', subPhase: '', text: '猎人请闭眼，天亮了' }
    };

    const current = this.data.phase === 'none' ? 'none' : this.data.subPhase;
    const next = nextMap[current];

    if (!next) {
      this.addLog(`流程错误：无法推进，未知阶段 ${current}`);
      return;
    }

    if (next.phase) this.setData({ phase: next.phase });
    if (next.subPhase !== undefined) this.setData({ subPhase: next.subPhase });

    this.setData({ flowButtonText: next.text });
    this.addLog(`进入环节：${next.text}`);
  },

  startGame() {
    this.setData({
      players: Array.from({ length: 12 }, (_, i) => ({
        number: i + 1,
        alive: true,
        role: '',
        killedTonight: false,
        verifyResult: '',
        guarded: false
      })),
      logs: [],
      phase: 'none',
      subPhase: '',
      flowButtonText: '开始游戏'
    });
    this.addLog('游戏开始');
  },

  enterNight() {
    this.setData({ phase: 'night', subPhase: 'wolf_mark', flowButtonText: '狼人请睁眼' });
    this.addLog('进入夜晚环节');
  },

  enterDay() {
    this.setData({ phase: 'day', subPhase: '', flowButtonText: '开始投票' });
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
