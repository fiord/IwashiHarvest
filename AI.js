// test AI program.
class AI {
    isInside(x, y, W, H) {
        return 0<=x && x<W && 0<=y && y<H;
    }

    getDist(x1, y1, x2, y2) {
        return Math.abs(x1-x2) + Math.abs(y1-y2);
    }
    
    iwashiMove(iwashiMap, player, maps, H, W) {
        const dx = [0, 1, 0, -1, 0];
        const dy = [-1, 0, 1, 0, 0];
        let nextIwashiMap = new Array(H);
        for (let i = 0; i < H; i++) {
            nextIwashiMap[i] = new Array(W).fill(0);
        }
        for (let i = 0; i < H; i++) {
            for (let j = 0; j < W; j++) {
                if (maps[i][j] === '#') {
                    continue;
                } else if (nextIwashiMap[i][j] > 0) {
                    nextIwashiMap[i][j] += iwashiMap[i][j];
                    continue;
                }
                let distanceMap = new Array(H);
                for (let k = 0; k < H; k++) {
                    distanceMap[k] = new Array(W).fill(H * W);
                }
                let queue = [];
                for (let y = 0; y < H; y++) {
                    for (let x = 0; x < W; x++) {
                        if (maps[y][x] === '#') continue;
                        if (i === y && j === x) continue;
                        if (iwashiMap[y][x] > 0) {
                            distanceMap[y][x] = 0;
                            queue.push({y, x});
                        }
                    }
                }
                if (player.paralyzed === 0) {
                    distanceMap[player.y][player.x] = 0;
                    queue.push({y: player.y, x: player.x});
                }
                while (queue.length > 0) {
                    let pos = queue.shift();
                    for(let k = 0; k < 4; k++) {
                        let nx = pos.x + dx[k];
                        let ny = pos.y + dy[k];
                        if (!this.isInside(ny, nx)) continue;
                        if (maps[ny][nx] === '#')   continue;
                        if (distanceMap[ny][nx] > distanceMap[pos.y][pos.x] + 1) {
                            distanceMap[ny][nx] = distanceMap[pos.y][pos.x] + 1;
                            queue.push({x: nx, y: ny});
                        }
                    }
                }
                for (let k = 0; k < 5; k++) {
                    let ni = i + dy[k];
                    let nj = j + dx[k];
                    if (!this.isInside(ni, nj)) continue;
                    if (maps[ni][nj] === '#') continue;
                    if (distanceMap[i][j] > distanceMap[ni][nj] || k === 4) {
                        nextIwashiMap[ni][nj] += iwashiMap[i][j];
                        break;
                    }
                }
            }
        }

        return nextIwashiMap;
    }

    run(input) {
        input = input.split("\n");
        const dx = [0, 1, 0, -1, 0];
        const dy = [1, 0, -1, 0, 0];
        const str = "SENWX";
        
        var arr = input[0].split(" ");
        var H = Number(arr[0]), W = Number(arr[1]), T = Number(arr[2]), N = Number(arr[3]);
        arr = input[1].split(" ");
        var player = {
            x: Number(arr[1]),
            y: Number(arr[0]),
            paralyzed: Number(arr[2])
        };

        
        var maps = new Array(H);
        for(let i = 0; i < H; i++) {
            maps[i] = input[i + 2];
        }
        var iwashi = new Array(N);
        for(let i = 0; i < N; i++) {
            let line = input[i + 2 + H].split(" ");
            iwashi[i] = {
                x: parseInt(line[0]),
                y: parseInt(line[1]),
                t: parseInt(line[2])
            };
        }
        
        var iwashiMap = new Array(H);
        for(let i = 0; i < H; i++)  iwashiMap[i] = new Array(W).fill(0);
        var iwashiIdx = 0;
        iwashi.sort((a, b) => (a.t-b.t));
        while(iwashiIdx < N && iwashi[iwashiIdx].t === 0) {
            iwashiMap[iwashi[iwashiIdx].y][iwashi[iwashiIdx].x]++;
            iwashiIdx++;
        }
        
        let ret = "";
        let turn = 0;
        while(turn++ < T) {
            if(player.paralyzed > 0) {
                ret += "A";
            }
            else {
                // 各マスからスコアマップを作成
                let scoreMap = new Array(H);
                for(let i = 0; i < H; i++)  scoreMap[i] = new Array(W).fill(0);
                for(let i = 0; i < H; i++) {
                    for(let j = 0; j < W; j++) {
                        if(iwashiMap[i][j] > 0) {
                            let iwashiValue = iwashiMap[i][j] * 3;
                            if(iwashiValue > 5) {
                                iwashiValue = -10;
                            }
                            let addMap = new Array(H);
                            for(let i = 0; i < H; i++)  addMap[i] = new Array(W).fill(0);
                            let queue = [{x: j, y: i}];
                            addMap[i][j] = iwashiValue;
                            while(queue.length > 0) {
                                let pos = queue.shift();
                                for(let k = 0; k < 4; k++) {
                                    let nx = pos.x + dx[k];
                                    let ny = pos.y + dy[k];
                                    if(!this.isInside(nx, ny, W, H))    continue;
                                    if(maps[ny][nx] === "#")   continue;
                                    if(addMap[ny][nx] !== 0) continue;
                                    addMap[ny][nx] += addMap[pos.y][pos.x] * 0.5;
                                    queue.push({x: nx, y: ny});
                                }
                            }
                            for(let y = 0; y < H; y++) {
                                for(let x = 0; x < W; x++) {
                                    scoreMap[y][x] += addMap[y][x];
                                }
                            }
                        }
                    }
                }
                // 一番スコアが高い方向へ移動
                let to = 4;
                for(let i = 4; i >= 0; i--) {
                    let nx = player.x + dx[i];
                    let ny = player.y + dy[i];
                    if(!this.isInside(nx, ny, W, H)) {
                        continue;
                    }
                    if(maps[ny][nx] === "#")   continue;
                    if(scoreMap[ny][nx] >= scoreMap[player.y + dy[to]][player.x + dx[to]]) {
                        to = i;
                    }
                }
                ret += str[to];
                player.x += dx[to];
                player.y += dy[to];
            }

            // iwashimove
            iwashiMap = this.iwashiMove(iwashiMap, player, maps, H, W);

            if(player.paralyzed > 0) {
                player.paralyzed--;
            }
            else if(0 < iwashiMap[player.y][player.x] && iwashiMap[player.y][player.x] <= 5){
                iwashiMap[player.y][player.x] = 0;
            }
            else if(iwashiMap[player.y][player.x] > 5) {
                player.paralyzed += 5;
                iwashiMap[player.y][player.x] = 0;
            }
        }
        return ret;
    }
}

module.exports = new AI();