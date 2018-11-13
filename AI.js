// test AI program.
class AI {
    isInside(x, y, W, H) {
        return 0<=x && x<W && 0<=y && y<H;
    }

    getDist(x1, y1, x2, y2) {
        return Math.abs(x1-x2) + Math.abs(y1-y2);
    }

    run(input) {
        const dx = [0, 1, 0, -1, 0];
        const dy = [1, 0, -1, 0, 0];
        const str = "SENWX";
        
        var arr = input[0].split(" ");
        var H = Number(arr[0]), W = Number(arr[1]), T = Number(arr[2]), curT = Number(arr[3]);
        arr = input[1].split(" ");
        var player = {
            x: Number(arr[1]),
            y: Number(arr[0]),
            paralyzed: Number(arr[2])
        };
        
        if(player.paralyzed > 0) {
            return "I hate math.";
        }
        var iwashiMap = new Array(H);
        for(let i = 0; i < H; i++) {
            iwashiMap[i] = input[i + 2].split(" ").map((v) => Number(v));
        }
        
        // 各マスからスコアマップを作成
        var scoreMap = new Array(H);
        for(let i = 0; i < H; i++)  scoreMap[i] = new Array(W).fill(0);
        for(let i = 0; i < H; i++) {
            for(let j = 0; j < W; j++) {
                if(iwashiMap[i][j] > 0) {
                    let iwashiValue = iwashiMap[i][j] * 3;
                    if(iwashiValue > 5) {
                        continue;
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
                            if(iwashiMap[ny][nx] < 0)   continue;
                            if(addMap[ny][nx] != 0) continue;
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
            if(iwashiMap[ny][nx] < 0)   continue;
            if(scoreMap[ny][nx] >= scoreMap[player.y + dy[to]][player.x + dx[to]]) {
                to = i;
            }
        }
        return str[to];
    }
}

module.exports = new AI();