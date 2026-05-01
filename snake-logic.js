(function (global) {
  var BASE_TICK_MAP = { easy: 255, normal: 220, hard: 180 };
  var MIN_TICK_MAP = { easy: 125, normal: 105, hard: 85 };

  var DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
  };

  var OPPOSITE = {
    UP: "DOWN",
    DOWN: "UP",
    LEFT: "RIGHT",
    RIGHT: "LEFT"
  };

  function cloneCell(cell) {
    return { x: cell.x, y: cell.y };
  }

  function cloneCells(cells) {
    return (cells || []).map(cloneCell);
  }

  function isSameCell(a, b) {
    return Boolean(a) && Boolean(b) && a.x === b.x && a.y === b.y;
  }

  function createInitialState(cols, rows) {
    var midX = Math.floor(cols / 2);
    var midY = Math.floor(rows / 2);

    return {
      cols: cols,
      rows: rows,
      snake: [
        { x: midX, y: midY },
        { x: midX - 1, y: midY },
        { x: midX - 2, y: midY }
      ],
      direction: "RIGHT",
      food: null,
      score: 0,
      applesEaten: 0,
      alive: true,
      obstacles: [],
      movingHazards: [],
      timedHazards: [],
      boss: null,
      powerUp: null,
      lastEvent: null
    };
  }

  function canQueueDirection(current, next) {
    if (!DIRECTIONS[next]) return false;
    if (OPPOSITE[current] === next) return false;
    return true;
  }

  function getLevel(applesEaten) {
    return Math.floor((applesEaten || 0) / 5) + 1;
  }

  function getDifficultyStage(level) {
    if (level <= 2) return "Slow";
    if (level <= 4) return "Steady";
    if (level <= 6) return "Faster";
    if (level <= 8) return "Rush";
    if (level <= 10) return "Wild";
    return "Chaos";
  }

  function foodPoints(type) {
    if (type === "golden") return 5;
    if (type === "cherry") return 3;
    if (type === "poison") return -3;
    if (type === "fire") return 2;
    if (type === "ice") return 2;
    if (type === "ghost") return 2;
    return 1;
  }

  function randomFoodType(rng) {
    var roll = rng();
    if (roll < 0.7) return "normal";
    if (roll < 0.8) return "cherry";
    if (roll < 0.88) return "golden";
    if (roll < 0.93) return "poison";
    if (roll < 0.96) return "ice";
    if (roll < 0.98) return "fire";
    return "ghost";
  }

  function isBlocked(x, y, snake, blocked) {
    if ((snake || []).some(function (segment) { return segment.x === x && segment.y === y; })) return true;
    if ((blocked || []).some(function (cell) { return cell.x === x && cell.y === y; })) return true;
    return false;
  }

  function placeFood(snake, cols, rows, rng, blocked) {
    var randomFn = rng || Math.random;
    var openCells = [];

    for (var y = 0; y < rows; y += 1) {
      for (var x = 0; x < cols; x += 1) {
        if (!isBlocked(x, y, snake, blocked)) {
          openCells.push({ x: x, y: y });
        }
      }
    }

    if (!openCells.length) return null;

    var baseCell = openCells[Math.floor(randomFn() * openCells.length)];
    return {
      x: baseCell.x,
      y: baseCell.y,
      type: randomFoodType(randomFn)
    };
  }

  function buildSpawnBlocked(cols, rows) {
    var sx = Math.floor(cols / 2);
    var sy = Math.floor(rows / 2);

    return new Set([
      sx + "," + sy,
      (sx - 1) + "," + sy,
      (sx - 2) + "," + sy,
      (sx + 1) + "," + sy,
      sx + "," + (sy + 1),
      sx + "," + (sy - 1)
    ]);
  }

  function obstacleCount(difficulty, level) {
    var base = difficulty === "easy" ? 3 : difficulty === "hard" ? 10 : 6;
    return base + Math.max(0, level - 1) * 2;
  }

  function movingHazardCount(difficulty, obstaclesEnabled, level) {
    if (!obstaclesEnabled) return 0;
    if (difficulty === "easy") return Math.min(1, Math.floor(level / 3));
    if (difficulty === "normal") return Math.min(2, Math.floor((level + 1) / 3));
    return Math.min(4, Math.floor((level + 2) / 2));
  }

  function createSeededRandom(seed) {
    var value = seed % 2147483647;
    if (value <= 0) value += 2147483646;

    return function () {
      value = (value * 16807) % 2147483647;
      return (value - 1) / 2147483646;
    };
  }

  function getRandomSource(config, offset) {
    if (config && typeof config.dailySeed === "number") {
      return createSeededRandom(config.dailySeed + (offset || 0));
    }
    return Math.random;
  }

  function generateObstacles(cols, rows, level, config) {
    var cfg = config || {};

    if (cfg.useCustomMap) return cloneCells(cfg.customMapCells);
    if (!cfg.obstaclesEnabled) return [];

    var rng = getRandomSource(cfg, level * 17);
    var blocked = buildSpawnBlocked(cols, rows);
    var count = obstacleCount(cfg.difficulty, level);
    var arr = [];

    while (arr.length < count) {
      var x = Math.floor(rng() * cols);
      var y = Math.floor(rng() * rows);
      var key = x + "," + y;

      if (blocked.has(key)) continue;
      if (arr.some(function (cell) { return cell.x === x && cell.y === y; })) continue;

      arr.push({ x: x, y: y });
    }

    return arr;
  }

  function generateMovingHazards(cols, rows, level, config, blockedObstacles) {
    var cfg = config || {};
    if (!cfg.obstaclesEnabled || cfg.useCustomMap) return [];

    var rng = getRandomSource(cfg, level * 31);
    var blocked = buildSpawnBlocked(cols, rows);
    var count = movingHazardCount(cfg.difficulty, cfg.obstaclesEnabled, level);
    var arr = [];

    while (arr.length < count) {
      var x = Math.floor(rng() * cols);
      var y = Math.floor(rng() * rows);
      var key = x + "," + y;

      if (blocked.has(key)) continue;
      if ((blockedObstacles || []).some(function (cell) { return cell.x === x && cell.y === y; })) continue;
      if (arr.some(function (hazard) { return hazard.x === x && hazard.y === y; })) continue;

      arr.push({
        x: x,
        y: y,
        dx: rng() > 0.5 ? 1 : -1,
        dy: rng() > 0.5 ? 1 : -1
      });
    }

    return arr;
  }

  function getFoodBlockedCells(state) {
    return (state.obstacles || [])
      .concat((state.movingHazards || []).map(function (hazard) {
        return { x: hazard.x, y: hazard.y };
      }))
      .concat(state.boss ? [{ x: state.boss.x, y: state.boss.y }] : []);
  }

  function createRunState(config) {
    var cfg = config || {};
    var boardSize = Number(cfg.boardSize) || 18;
    var state = createInitialState(boardSize, boardSize);
    var level = 1;

    state.obstacles = generateObstacles(state.cols, state.rows, level, cfg);
    state.movingHazards = generateMovingHazards(state.cols, state.rows, level, cfg, state.obstacles);
    state.boss = cfg.bossEnabled ? { x: state.cols - 2, y: 1 } : null;
    state.food = placeFood(state.snake, state.cols, state.rows, getRandomSource(cfg, 77), getFoodBlockedCells(state));

    return state;
  }

  function refreshWorldForLevel(state, config, level) {
    var cfg = config || {};
    if (!cfg.obstaclesEnabled || cfg.useCustomMap) return state;

    state.obstacles = generateObstacles(state.cols, state.rows, level, cfg);
    state.movingHazards = generateMovingHazards(state.cols, state.rows, level, cfg, state.obstacles);

    if (cfg.bossEnabled && !state.boss) {
      state.boss = { x: state.cols - 2, y: 1 };
    }

    return state;
  }

  function getTickSpeed(difficulty, applesEaten, powerUp) {
    var base = BASE_TICK_MAP[difficulty] || BASE_TICK_MAP.normal;
    var min = MIN_TICK_MAP[difficulty] || MIN_TICK_MAP.normal;
    var reduction = (applesEaten || 0) * 5;

    if (powerUp && powerUp.type === "ice") {
      base += 60;
      min += 20;
    }

    if (powerUp && powerUp.type === "fire") {
      base -= 35;
      min -= 15;
    }

    return Math.max(min, base - reduction);
  }

  function hitsObstacle(head, obstacles) {
    return (obstacles || []).some(function (cell) { return isSameCell(head, cell); });
  }

  function hitsMovingHazard(head, hazards) {
    return (hazards || []).some(function (hazard) { return isSameCell(head, hazard); });
  }

  function hitsBoss(head, boss) {
    return Boolean(boss) && isSameCell(head, boss);
  }

  function hitsSelf(head, snake) {
    return (snake || []).slice(1).some(function (segment) { return isSameCell(head, segment); });
  }

  function moveHazards(state) {
    function sameCell(a, b) {
      return Boolean(a) && Boolean(b) && a.x === b.x && a.y === b.y;
    }

    function isBlocked(cell, currentIndex) {
      if (cell.x < 0 || cell.x >= state.cols || cell.y < 0 || cell.y >= state.rows) {
        return true;
      }

      if ((state.obstacles || []).some(function (obstacle) {
        return sameCell(cell, obstacle);
      })) {
        return true;
      }

      if ((state.snake || []).some(function (segment) {
        return sameCell(cell, segment);
      })) {
        return true;
      }

      if (state.food && sameCell(cell, state.food)) {
        return true;
      }

      if ((state.movingHazards || []).some(function (hazard, index) {
        return index !== currentIndex && sameCell(cell, hazard);
      })) {
        return true;
      }

      return false;
    }

    function addCandidate(list, dx, dy) {
      if (dx === 0 && dy === 0) return;

      var exists = list.some(function (item) {
        return item.dx === dx && item.dy === dy;
      });

      if (!exists) {
        list.push({ dx: dx, dy: dy });
      }
    }

    (state.movingHazards || []).forEach(function (hazard, index) {
      hazard.dx = hazard.dx < 0 ? -1 : hazard.dx > 0 ? 1 : 0;
      hazard.dy = hazard.dy < 0 ? -1 : hazard.dy > 0 ? 1 : 0;

      if (hazard.dx === 0 && hazard.dy === 0) {
        hazard.dx = index % 2 === 0 ? 1 : -1;
        hazard.dy = index % 3 === 0 ? 1 : 0;
      }

      var candidates = [];

      // preferred direction first
      addCandidate(candidates, hazard.dx, hazard.dy);

      // smart bounce options
      addCandidate(candidates, -hazard.dx, hazard.dy);
      addCandidate(candidates, hazard.dx, -hazard.dy);
      addCandidate(candidates, -hazard.dx, -hazard.dy);

      // fallback single-axis movement
      addCandidate(candidates, hazard.dx, 0);
      addCandidate(candidates, 0, hazard.dy);
      addCandidate(candidates, -hazard.dx, 0);
      addCandidate(candidates, 0, -hazard.dy);

      for (var i = 0; i < candidates.length; i += 1) {
        var move = candidates[i];
        var next = {
          x: hazard.x + move.dx,
          y: hazard.y + move.dy
        };

        if (!isBlocked(next, index)) {
          hazard.x = next.x;
          hazard.y = next.y;
          hazard.dx = move.dx;
          hazard.dy = move.dy;
          return;
        }
      }
    });
  }

  function updateTimedHazards(state) {
    if (!state.timedHazards) {
      state.timedHazards = [];
    }

    // 🔥 Boss attack system — pattern upgrade
    if (state.boss) {
      state.bossAttackCooldown = state.bossAttackCooldown || 0;
      state.bossAttackCooldown--;

      if (state.bossAttackCooldown <= 0) {
        var phase = 1;
        if (state.score >= 40) phase = 3;
        else if (state.score >= 20) phase = 2;

        var bx = state.boss.x;
        var by = state.boss.y;
        var head = state.snake && state.snake.length ? state.snake[0] : null;

        state.bossAttackPattern = state.bossAttackPattern || 0;
        state.bossAttackPattern += 1;

        function isOccupied(x, y) {
          if ((state.snake || []).some(function (s) {
            return s.x === x && s.y === y;
          })) return true;

          if (state.food && state.food.x === x && state.food.y === y) return true;

          if ((state.obstacles || []).some(function (o) {
            return o.x === x && o.y === y;
          })) return true;

          if ((state.movingHazards || []).some(function (h) {
            return h.x === x && h.y === y;
          })) return true;

          if ((state.timedHazards || []).some(function (t) {
            return t.x === x && t.y === y;
          })) return true;

          return false;
        }

        function spawn(x, y, fast) {
          if (x < 0 || x >= state.cols || y < 0 || y >= state.rows) return;

          // Do not spawn directly on current snake head/body.
          // It should warn first, not instantly feel unfair.
          if (isOccupied(x, y)) return;

          state.timedHazards.push({
            x: x,
            y: y,
            phaseIndex: 0,
            phaseDurations: fast ? [8, 8, 14] : [12, 10, 16],
            timer: fast ? 8 : 12
          });
        }

        function crossAttack(radius, fast) {
          for (var i = -radius; i <= radius; i += 1) {
            if (i !== 0) {
              spawn(bx + i, by, fast);
              spawn(bx, by + i, fast);
            }
          }
        }

        function ringAttack(radius, fast) {
          for (var dx = -radius; dx <= radius; dx += 1) {
            for (var dy = -radius; dy <= radius; dy += 1) {
              var edge = Math.abs(dx) === radius || Math.abs(dy) === radius;
              if (edge) {
                spawn(bx + dx, by + dy, fast);
              }
            }
          }
        }

        function chaseTrapAttack(fast) {
          if (!head) return;

          spawn(head.x + 1, head.y, fast);
          spawn(head.x - 1, head.y, fast);
          spawn(head.x, head.y + 1, fast);
          spawn(head.x, head.y - 1, fast);
          spawn(head.x + 1, head.y + 1, fast);
          spawn(head.x - 1, head.y - 1, fast);
        }

        if (phase === 1) {
          crossAttack(1, false);
        }

        if (phase === 2) {
          if (state.bossAttackPattern % 2 === 0) {
            crossAttack(2, false);
          } else {
            ringAttack(2, false);
          }
        }

        if (phase === 3) {
          var pattern = state.bossAttackPattern % 3;

          if (pattern === 0) {
            crossAttack(3, true);
          } else if (pattern === 1) {
            ringAttack(2, true);
          } else {
            chaseTrapAttack(true);
          }
        }

        state.bossAttackCooldown = phase === 1 ? 24 : phase === 2 ? 18 : 13;
      }
    }

    state.timedHazards.forEach(function (tile) {
      tile.timer -= 1;

      if (tile.timer <= 0) {
        tile.phaseIndex += 1;
        tile.timer = tile.phaseDurations[tile.phaseIndex] || 0;
      }
    });

    state.timedHazards = state.timedHazards.filter(function (tile) {
      return tile.phaseIndex < tile.phaseDurations.length;
    });

    if (Math.random() < 0.025 && state.timedHazards.length < 3) {

      function isSafeSpawn(x, y) {
        // avoid snake
        if ((state.snake || []).some(function (s) {
          return s.x === x && s.y === y;
        })) return false;

        // avoid food
        if (state.food && state.food.x === x && state.food.y === y) return false;

        // avoid obstacles
        if ((state.obstacles || []).some(function (o) {
          return o.x === x && o.y === y;
        })) return false;

        // avoid moving hazards
        if ((state.movingHazards || []).some(function (h) {
          return h.x === x && h.y === y;
        })) return false;

        // avoid other timed hazards
        if ((state.timedHazards || []).some(function (t) {
          return t.x === x && t.y === y;
        })) return false;

        return true;
      }

      var attempts = 0;
      var maxAttempts = 30;

      while (attempts < maxAttempts) {
        var x = Math.floor(Math.random() * state.cols);
        var y = Math.floor(Math.random() * state.rows);

        if (isSafeSpawn(x, y)) {
          state.timedHazards.push({
            x: x,
            y: y,
            phaseIndex: 0,
            phaseDurations: [20, 15, 20],
            timer: 20
          });
          break;
        }

        attempts++;
      }
    }
  }

  function moveBoss(state) {
    if (!state.boss) return;

    var boss = state.boss;
    var head = state.snake && state.snake.length ? state.snake[0] : null;

    // INIT STATE
    boss.mode = boss.mode || "normal";
    boss.cooldown = boss.cooldown || 0;
    boss.dashDir = boss.dashDir || null;
    boss.dashSteps = boss.dashSteps || 0;

    boss.cooldown--;

    // ======================
    // DASH MODE
    // ======================
    if (boss.mode === "dash" && boss.dashDir && boss.dashSteps > 0) {
      boss.x += boss.dashDir.x;
      boss.y += boss.dashDir.y;

      boss.dashSteps--;

      // stop dash
      if (boss.dashSteps <= 0) {
        boss.mode = "normal";
        boss.cooldown = 18;
      }

      return;
    }

    // ======================
    // START DASH
    // ======================
    if (boss.cooldown <= 0 && head) {
      var dx = head.x - boss.x;
      var dy = head.y - boss.y;

      // choose main direction
      if (Math.abs(dx) > Math.abs(dy)) {
        boss.dashDir = { x: dx > 0 ? 1 : -1, y: 0 };
      } else {
        boss.dashDir = { x: 0, y: dy > 0 ? 1 : -1 };
      }

      boss.mode = "dash";
      boss.dashSteps = 3; // dash length
      boss.cooldown = 25;

      return;
    }

    // ======================
    // NORMAL MOVEMENT
    // ======================
    var moveX = 0;
    var moveY = 0;

    if (head) {
      if (Math.random() < 0.5) {
        moveX = head.x > boss.x ? 1 : -1;
      } else {
        moveY = head.y > boss.y ? 1 : -1;
      }
    }

    var nextX = boss.x + moveX;
    var nextY = boss.y + moveY;

    if (
      nextX >= 0 && nextX < state.cols &&
      nextY >= 0 && nextY < state.rows
    ) {
      boss.x = nextX;
      boss.y = nextY;
    }
  }

  function applyFoodEffect(state, type) {
    if (type === "poison" && state.snake.length > 2) {
      state.snake.pop();
      if (state.snake.length > 2) state.snake.pop();
    }
  }

  function advanceState(state, direction, config) {
    if (!state.alive) return state;

    var rules = config || {};
    var nextDir = direction || state.direction;
    state.direction = nextDir;

    var move = DIRECTIONS[nextDir];
    var head = state.snake[0];
    var nextHead = {
      x: head.x + move.x,
      y: head.y + move.y
    };

    // 🔥 BOSS COLLISION (PLAYER MOVES INTO BOSS)
    if (state.boss && nextHead.x === state.boss.x && nextHead.y === state.boss.y) {
      state.alive = false;
      state.lastEvent = { type: "death", reason: "boss" };
      return state;
    }

    if (
      nextHead.x < 0 ||
      nextHead.x >= state.cols ||
      nextHead.y < 0 ||
      nextHead.y >= state.rows
    ) {
      state.alive = false;
      state.lastEvent = { type: "death", reason: "wall" };
      return state;
    }

    moveHazards(state);
    updateTimedHazards(state);
    moveBoss(state);

    // 🔥 BOSS COLLISION (BOSS MOVES INTO PLAYER HEAD)
    if (state.boss && state.snake && state.snake.length) {
      var headNow = state.snake[0];

      if (headNow.x === state.boss.x && headNow.y === state.boss.y) {
        state.alive = false;
        state.lastEvent = { type: "death", reason: "boss" };
        return state;
      }
    }

    if (hitsSelf(nextHead, state.snake)) {
      state.alive = false;
      state.lastEvent = { type: "death", reason: "self" };
      return state;
    }

    if (rules.useObstacles && hitsObstacle(nextHead, state.obstacles)) {
      state.alive = false;
      state.lastEvent = { type: "death", reason: "obstacle" };
      return state;
    }

    if (rules.useMovingHazards && hitsMovingHazard(nextHead, state.movingHazards)) {
      state.alive = false;
      state.lastEvent = { type: "death", reason: "hazard" };
      return state;
    }

    if (state.timedHazards && state.timedHazards.some(function (tile) {
      return tile.phaseIndex === 2 && tile.x === nextHead.x && tile.y === nextHead.y;
    })) {
      state.alive = false;
      state.lastEvent = { type: "death", reason: "timed-hazard" };
      return state;
    }

    if (rules.useBoss && hitsBoss(nextHead, state.boss)) {
      state.alive = false;
      state.lastEvent = { type: "death", reason: "boss" };
      return state;
    }

    state.snake.unshift(nextHead);

    var ateFood = state.food && isSameCell(nextHead, state.food);

    if (ateFood) {
      var points = foodPoints(state.food.type);

      state.score += points;
      state.applesEaten += 1;
      applyFoodEffect(state, state.food.type);
      state.lastEvent = {
        type: "food",
        points: points,
        foodType: state.food.type,
        x: state.food.x,
        y: state.food.y
      };
      state.food = placeFood(
        state.snake,
        state.cols,
        state.rows,
        getRandomSource(rules, state.applesEaten * 47 + 77),
        getFoodBlockedCells(state)
      );
    } else {
      state.snake.pop();
      state.lastEvent = null;
    }

    return state;
  }

  global.SnakeLogic = {
    DIRECTIONS: DIRECTIONS,
    OPPOSITE: OPPOSITE,
    canQueueDirection: canQueueDirection,
    cloneCell: cloneCell,
    isSameCell: isSameCell,
    getLevel: getLevel,
    getDifficultyStage: getDifficultyStage,
    foodPoints: foodPoints,
    placeFood: placeFood,
    buildSpawnBlocked: buildSpawnBlocked,
    createInitialState: createInitialState,
    createRunState: createRunState,
    refreshWorldForLevel: refreshWorldForLevel,
    getTickSpeed: getTickSpeed,
    advanceState: advanceState
  };
})(window);