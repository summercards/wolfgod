Page({
  data: {
    players: Array.from({ length: 12 }, (_, i) => ({
      number: i + 1,
      alive: true,
      role: '',
      killedTonight: false,
      verifyResult: '',
      guarded: false,
      cured: false,
      isPolice: false,
      isPoliceLeader: false
    })),
    logs: [],
    phase: 'none',
    subPhase: '',
    flowButtonText: '开始游戏',
    dayCount: 1,
    logAnchor: '',
    roleStats: { 狼人: 0, 村民: 0, 神民: 0 }
  },

  addLog(message) {
    this.setData({
      logs: [...this.data.logs, message],
      logAnchor: 'log-bottom'
    });
  },

  updateRoleStats() {
    const players = this.data.players;
    let wolf = 0;
    let villager = 0;
    let god = 0;
  
    players.forEach(p => {
      if (!p.alive) return;
  
      if (p.role === '狼人') {
        wolf++;
      } else if (['预言家', '女巫', '守卫', '猎人'].includes(p.role)) {
        god++;
      } else {
        villager++; // 未标记角色或默认角色视为村民
      }
    });
  
    this.setData({
      roleStats: {
        狼人: wolf,
        村民: villager,
        神民: god
      }
    });
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
      } else if (subPhase === 'witch_cure') {
        const target = players[index];
        if (target.killedTonight) {
          target.alive = true;
          target.killedTonight = false;
          target.cured = true;
          this.addLog(`女巫使用解药，救回了 玩家 ${target.number}`);
        } else {
          this.addLog(`只能对被杀玩家使用解药！`);
        }
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
    } else if (phase === 'day') {
      if (subPhase === 'police') {
        players[index].isPolice = !players[index].isPolice;
        this.addLog(`玩家 ${players[index].number} ${players[index].isPolice ? '上警' : '取消上警'}`);
      } else if (subPhase === 'police_confirm') {
        players.forEach(p => p.isPoliceLeader = false);
        players[index].isPoliceLeader = true;
        this.addLog(`玩家 ${players[index].number} 成为警长`);
      } else if (subPhase === 'vote') {
        if (players[index].alive) {
          players[index].alive = false;
          this.addLog(`玩家 ${players[index].number} 被投票淘汰`);
        }
      }
    }

    this.setData({ players }, () => {
      this.updateRoleStats();
    });
  },

  handleFlowAction() {
    const nextMap = {
      none: { phase: 'night', subPhase: 'wolf_mark', text: '狼人睁眼，标记狼人-进入狼人指定目标环节' },
      wolf_mark: { subPhase: 'wolf_kill', text: '狼人请杀人' },
      wolf_kill: { subPhase: 'seer_mark', text: '狼人请闭眼，预言家请睁眼（标记预言家）' },
      seer_mark: { subPhase: 'seer_verify', text: '预言家请验人-（标记验的人）' },
      seer_verify: { subPhase: 'witch_mark', text: '预言家请闭眼，女巫请睁眼（标记女巫）' },
      witch_mark: { subPhase: 'witch_cure', text: '女巫是否使用解药？（点击被杀的玩家使用解药，点击按钮放弃使用）' },
      witch_cure: { subPhase: 'witch_poison', text: '女巫是否使用毒药？（点击玩家使用毒药，点击按钮放弃使用）' },
      witch_poison: { subPhase: 'guard_mark', text: '女巫请闭眼，守卫请睁眼（标记守卫）' },
      guard_mark: { subPhase: 'guard_protect', text: '守卫请守护目标（标记要守卫的目标）' },
      guard_protect: { subPhase: 'hunter_mark', text: '守卫请闭眼，猎人请睁眼' },
      hunter_mark: { phase: 'day', subPhase: 'day_result', text: '天亮了，开始结算' },
      day_result: { subPhase: 'police', text: '需要上警的玩家请举手' },
      police: { subPhase: 'police_confirm', text: '竞选警徽，请指定警长' },
      police_confirm: { subPhase: 'speak', text: '进入发言环节' },
      speak: { subPhase: 'vote', text: '进入投票环节' },
      vote: { phase: 'night', subPhase: 'wolf_mark', text: '天黑请闭眼，狼人请睁眼' }
    };

    const current = this.data.phase === 'none' ? 'none' : this.data.subPhase;

    let next;
    if (current === 'day_result') {
      if (this.data.dayCount === 1) {
        next = nextMap['day_result'];
      } else {
        next = nextMap['speak'];
      }
    } else if (current === 'police') {
      if (this.data.dayCount === 1) {
        next = nextMap['police'];
      } else {
        next = nextMap['speak'];
      }
    } else if (current === 'police_confirm') {
      if (this.data.dayCount === 1) {
        next = nextMap['police_confirm'];
      } else {
        next = nextMap['speak'];
      }
    } else {
      next = nextMap[current];
    }

    if (current === 'day_result') {
      const players = [...this.data.players];
      let eliminated = [];
      players.forEach(p => {
        if (p.killedTonight && !p.guarded && !p.cured && p.alive) {
          p.alive = false;
          eliminated.push(p.number);
        }
        p.killedTonight = false;
        p.guarded = false;
        p.cured = false;
      });
      if (eliminated.length > 0) {
        this.addLog(`玩家 ${eliminated.join('、')} 在夜晚被淘汰`);
      } else {
        this.addLog('没有玩家在夜晚被淘汰');
      }
      this.setData({ players }, () => {
        this.updateRoleStats();
      });
    }

    if (!next) {
      this.addLog(`流程错误：无法推进，未知阶段 ${current}`);
      return;
    }

    if (current === 'vote') {
      this.setData({ dayCount: this.data.dayCount + 1 });
    }

    if (next.phase) this.setData({ phase: next.phase });
    if (next.subPhase !== undefined) this.setData({ subPhase: next.subPhase });

    let text = next.text;
    if (['day', 'night'].includes(next.phase)) {
      text = `第${this.data.dayCount}天：` + text;
    }
    this.setData({ flowButtonText: text });
    this.addLog(`进入环节：第${this.data.dayCount}天 ${next.text}`);
    this.updateRoleStats();
  },

  skipCure() {
    this.addLog('女巫放弃使用解药');
    this.setData({
      subPhase: 'witch_poison',
      flowButtonText: '女巫是否使用毒药？'
    });
  },

  startGame() {
    this.setData({
      players: Array.from({ length: 12 }, (_, i) => ({
        number: i + 1,
        alive: true,
        role: '',
        killedTonight: false,
        verifyResult: '',
        guarded: false,
        cured: false,
        isPolice: false,
        isPoliceLeader: false
      })),
      logs: [],
      phase: 'none',
      subPhase: '',
      flowButtonText: '开始游戏',
      dayCount: 1,
      logAnchor: '',
      roleStats: { 狼人: 0, 村民: 0, 神民: 0 }
    });
    this.addLog('游戏开始');
    this.updateRoleStats();
  },

  enterNight() {
    this.setData({
      phase: 'night',
      subPhase: 'wolf_mark',
      flowButtonText: '狼人请睁眼'
    });
    this.addLog('进入夜晚环节');
  },

  enterDay() {
    this.setData({
      phase: 'day',
      subPhase: 'day_result',
      flowButtonText: `第${this.data.dayCount + 1}天开始结算`
    });
    this.addLog('进入白天环节');
  }
});
