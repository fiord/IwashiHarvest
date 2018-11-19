// title: iwashi harvest(iwashi収穫祭)
module.exports.presets = {};

// convert player's output from str to obj
// arg: player's output
// return: array of objects which showes how player to move.
const normalize = (stdout) => {
    const dx = [0, 1, 0, -1];
    const dy = [1, 0, -1, 0];
    const dir = "SENW".split("");
    line = stdout.toString().trim().split("\n")[0].split("");
    moves = line.map((c) => {
        let move = {x: 0, y: 0};
        dir.forEach((str, i) => {
            if(c === str) {
                move = {
                    x: dx[i],
                    y: dy[i]
                };
            }
        });
        return move;
    });
    return moves;
};

module.exports.normalize = normalize;

// make maps
// arg: height, width and mode
// return: maps
const initMaps = (height, width, mode) => {
    if(mode === "random") {
        // rate: 25%
        let maps = Array(height).fill().map((_, i) => (i==0||i==height-1?Array(width).fill("#"):["#"].concat(Array(width - 2).fill("."), ["#"])));
        let count = Math.max(Math.floor(height * width / 4), 0);
        while(count--) {
            let x = Math.max(0, Math.min(width - 1, Math.floor(Math.random() * (width - 2)) + 1));
            let y = Math.max(0, Math.min(height - 1, Math.floor(Math.random() * (height - 2)) + 1));
            while(maps[y][x] === "#") {
                x = Math.max(0, Math.min(width - 1, Math.floor(Math.random() * (width - 2)) + 1));
                y = Math.max(0, Math.min(height - 1, Math.floor(Math.random() * (height - 2)) + 1));
            }
            mapx[y][x] = "#";
        }
        return maps.map((v) => v.join(""));
    }
    else if(mode === "challenge") {
        /* looks like this!
        #######
        #.....#
        #.#####
        #.....#
        #####.#
        #.....#
        #######
        */
       return Array(height).fill().map((v, i) => {
           if(i == 0 || i == height - 1) {
               return "#".repeat(width);
           }
           else if(i % 2 == 1) {
               return "#".repeat(width);
           }
           else if(i % 4 == 0) {
               return "#".repeat(width - 2) + ".#";
           }
           else {
               return "#." + "#".repeat(width - 2);
           }
       })
    }
};

module.exports.initMaps = initMaps;

// init iwashiがつちからはえてくるんだ
// arg: maps, height, width, turns, and number of iwashi
// ret: iwashi and iwashiMap
const initIwashi = (maps, H, W, T, N) => {
    const iwashi = Array(N).fill().map(() => {
        let x = 0;
        let y = 0;
        while(maps[y][x] === "#") {
            x = Math.max(0, Math.min(width - 1, Math.floor(Math.random() * (width - 2)) + 1));
            y = Math.max(0, Math.min(height - 1, Math.floor(Math.random() * (height - 2)) + 1));
        }
        return {
            x: x,
            y: y,
            t: Math.max(0, Math.min(T, Math.floor(Math.random() * T)))
        };
    });
    let iwashiMap = Array(H).fill().map(() => Array(W).fill(0));
    for(const dat of iwashi) {
        if(dat.t == 0) {
            iwashiMap[dat.y][dat.x]++;
        }
    }
    return {iwashi, iwashiMap};
};

module.exports.initIwashi = initIwashi;

// change position of player 
// arg: map of TSG, player data and move datum
// return: player's new position
const movePlayer = (maps, player, move) => {
    let x = player.x + move.x;
    let y = player.y + move.y;
    if(maps[y][x] !== "#" && player.paralyzed === 0) {
        return {
            x: x,
            y: y,
            paralyzed: player.paralyzed
        };
    }
    else {
        return player;
    }
};

module.exports.movePlayer = movePlayer;

// iwashi moves.
// arg: iwashiMap, map of TSG, player data, H and W.
// ret: new iwashiMap
const iwashiMove = (iwashiMap, maps, player, H, W) => {
    var distanceMap = new Array(H);
    for(let i = 0; i < H; i++)  distanceMap[i] = new Array(W).fill(H * W);
    var queue = [];
    const dx = [0, 1, 0, -1, 0];
    const dy = [-1, 0, 1, 0, 0];
    
    // player
    if(player.paralyzed === 0) {
        distanceMap[player.y][player.x] = 0;
        queue.push({x: player.x, y: player.y});
    }
    // iwashi
    for(let i = 0; i < H; i++) {
        for(let j = 0; j < W; j++) {
            if(iwashiMap[i][j] > 0) {
                distanceMap[i][j] = 0;
                queue.push({x: j, y: i});
            }
            else if(player.pos == {x: j, y: i}) {
                distanceMap[i][j] = 0;
                queue.push({x: j, y: i});
            }
        }
    }

    while(queue.length > 0) {
        var pos = queue.shift();
        for(let i = 0; i < 4; i++) {
            let nx = pos.x + dx[i];
            let ny = pos.y + dy[i];
            if(maps[ny][nx] === "#")  continue;
            if(distanceMap[ny][nx] > distanceMap[pos.y][pos.x] + 1) {
                distanceMap[ny][nx] = distanceMap[pos.y][pos.x] + 1;
                queue.push({x: nx, y: ny});
            }
        }
    }

    var nextIwashiMap = new Array(H);
    for(let i = 0; i < H; i++)  nextIwashiMap[i] = new Array(W).fill(0);
    
    for(let i = 0; i < H; i++) {
        for(let j = 0; j < W; j++) {
            if(iwashiMap[i][j] > 0) {
                if(nextIwashiMap[i][j] > 0) {
                    nextIwashiMap[i][j] += iwashiMap[i][j];
                }
                else {
                        for(let k = 0; k < 5; k++) {
                        let ni = i + dy[k];
                        let nj = j + dx[k];
                        if(maps[ni][nj] === "#")    continue;
                        if(distanceMap[i][j] > distanceMap[ni][nj] || k == 4) {
                            nextIwashiMap[ni][nj] += iwashiMap[i][j];
                            break;
                        }
                    }
                }
            }
        }
    }

    return nextIwashiMap;
};

module.exports.iwashiMove = iwashiMove;

// calculate current Score(this is called every turn)
// arg: current iwashi map, player data, ,current score, iwashi data and current turn.
// ret: new score and new player data.
const calculateScore = (iwashiMap, player, score, iwashi, turn) => {
    let newPlayer = Object.assign(player);
    let newIwashi = iwashiMap.map((iwashi) => iwashi.slice());

    // iwashiがつちからはえてくるんだ
    while(iwashi.length > 0 && iwashi[0].t < turn)  iwashi.shift();
    while(iwashi.length > 0 && iwashi[0].t === turn) {
        newIwashi[iwashi[0].y][iwashi[0].x]++;
        iwashi.shift();
    }

    if(newPlayer.paralyzed > 0) {
        newPlayer.paralyzed--;
    }
    else if(0 < newIwashi[newPlayer.y][newPlayer.x] && newIwashi[newPlayer.y][newPlayer.x] <= 5){
        score += newIwashi[newPlayer.y][newPlayer.x];
        newIwashi[newPlayer.y][newPlayer.x] = 0;
    }
    else if(newIwashi[newPlayer.y][newPlayer.x] > 5) {
        newPlayer.paralyzed += 5;
    }
    return {
        score: score,
        newIwashi: newIwashi,
        player: newPlayer,
        iwashi: iwashi
    };
};

module.exports.calculateScore = calculateScore;

const serialize = ({params, state}) => {
    let head = [
        `${params.height} ${params.width} ${params.turn} ${params.n}`,
        `${state.player.x} ${state.player.y}`
    ];
    let end = state.iwashi.map((dat) => `${dat.x} ${dat.y} ${dat.t}`);
    return head.concat(state.maps, end).join("\n");
};

const deserialize = (stdin) => {
    const lines = stdin.trim().split("\n").map((line) => line.split(" "));
    return {
        params: {
            height: parseInt(lines[0][0]),
            width: parseInt(lines[0][1]),
            turn: parseInt(lines[0][2]),
            n: parseInt(lines[0][3]),
            maps: lines.slice(2, 2+parseInt(lines[0][0]))
        },
        state: {
            player: {
                x: parseInt(lines[1][0]),
                y: parseInt(lines[1][1]),
                paralyzed: 0
            },
        }
    }
}

module.exports.deserialize = deserialize;

module.exports.battler = async(execute, params, {onFrame = noop, initState} = {}) => {
    const maps = initMaps(params.height, params.width, params.mode);
    let iwashi = initIwashi(maps, params.height, params.width, params.turn, parmas.n).sort((a, b) => (a.t - b.t));
    const initialState = initState || {
        maps: maps,
        iwashiMap: iwashi.iwashiMap,
        iwashi: iwashi.iwashi,
        player: {
            x: 0,
            y: 0,
            paralyzed: 0
        }
    };
    const {state} = deserialize(serialize({params, state: initialState}));
    const {stdout} = await execute(serialize({params, state}), 0);
    const turns = normalize(stdout);

    // doing hogehoge
    turnCnt = 1;
    for(const turn of turns.slice(0, 1)) {
        if(turnCnt > state.T)  break;
        let player = movePlayer(state.maps, state.player, turn);
        let iwashiMap = iwashiMove(state.iwashiMap, state.maps, player, params.H, params.W);
        const result = calculateScore(iwashiMap, player, score, state.iwashi, turnCnt);
        onFrame({...state, player: result.player, iwashiMap: result.iwashiMap, score: result.score, iwashi: result.iwashi});
        turnCnt++;
    }
    
    return {
        result: "settled",
        winner: 0,
        scores: [state.score]
    };
};

module.exports.configs = [
    {
        default: true,
        id: "little",
        name: "20 x 20 little",
        params: {
            mode: "random",
            height: 20,
            width: 20,
            turns: 1000,
            n: 250,
        }
    },
    {
        id: "much",
        name: "20 x 20 much",
        params: {
            mode: "random",
            height: 20,
            width: 20,
            turns: 1000,
            n: 3000,
        }
    },
    {
        id: "challenge",
        name: "challenge",
        params: {
            mode: "challenge",
            height: 20,
            width: 20,
            turns: 1000,
            n: 1000,
        }
    }
];

module.exports.matchConfigs = [
    ...Array(6).fill().map(() => ({
        config: "little",
        players: [0]
    })),
    ...Array(6).fill.map(() => ({
        config: "much",
        players: [0]
    })),
    ...Array(3).fill.map(() => ({
        config: "challenge",
        players: [0]
    }))
];

module.exports.judgeMatch = (results) => ({
    result: results[0].result,
    winner: results[0].winner,
    scores: [sumBy(results, ({scores}) => scores[0])]
});