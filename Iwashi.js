// 内部で動かすプログラム
// 外部にplayer = {x, y}とそれを動かすプログラムがある前提で、他の動作を各種関数で実装しています。
class Iwashi {
    constructor() {
        // W,H = 22
        // T = 1000
        // M = 2
        // iwashiMapでiwashiと壁の情報を同時に与える(壁は-1)
        // the number of iwashies when this game is started = 5

        this.T = 1000;
        this.currentTurn = 1;
        this.H = 22;
        this.W = 22;
        this.score = 0;
        this.M = 3;
        this.player = {
            x: 0,
            y: 0,
            paralyzed: 0
        };
        this.iwashiMap = [];
    }

    isInside(y, x) {
        return (0<=x && x<this.W && 0<=y && y<this.H);
    }

    // move iwashi. return new iwashiMap.
    getIwashiMove(iwashiMap, player) {
        var distanceMap = new Array(this.H);
        for(let i = 0; i < this.H; i++)  distanceMap[i] = new Array(this.W).fill(this.H * this.W);
        var queue = [];
        const dx = [0, 1, 0, -1, 0];
        const dy = [-1, 0, 1, 0, 0];
        
        for(let i = 0; i < this.H; i++) {
            for(let j = 0; j < this.W; j++) {
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
                if(!this.isInside(ny, nx))   continue;
                if(this.iwashiMap[ny][nx] < 0)  continue;
                if(distanceMap[ny][nx] > distanceMap[pos.y][pos.x] + 1) {
                    distanceMap[ny][nx] = distanceMap[pos.y][pos.x] + 1;
                    queue.push({x: nx, y: ny});
                }
            }
        }

        var nextIwashiMap = new Array(this.H);
        for(let i = 0; i < this.H; i++)  nextIwashiMap[i] = new Array(this.W).fill(0);
        for(let i = 0; i < this.H; i++) {
            for(let j = 0; j < this.W; j++) {
                if(this.iwashiMap[i][j] < 0) {
                    nextIwashiMap[i][j] = -1;
                }
            }
        }
        for(let i = 0; i < this.H; i++) {
            for(let j = 0; j < this.W; j++) {
                if(this.iwashiMap[i][j] > 0) {
                    if(nextIwashiMap[i][j] > 0) {
                        nextIwashiMap[i][j] += iwashiMap[i][j];
                    }
                    else {
                            for(let k = 0; k < 5; k++) {
                            let ni = i + dy[k];
                            let nj = j + dx[k];
                            if(!this.isInside(ni, nj))  continue;
                            if(this.iwashiMap[ni][nj] < 0)    continue;
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
    }

    // get moving(what direction player want to move by "NEWS") and change position of player.
    playerMove(moving) {
        if(this.player.paralyzed == 0) {
            const direction = "NEWS";
            const dx = [0, 1, -1, 0];
            const dy = [-1, 0, 0, 1];
            for(let i = 0; i < 4; i++) {
                if(moving == direction[i]) {
                    let nx = this.player.x + dx[i];
                    let ny = this.player.y + dy[i];
                    if(!this.isInside(ny, nx)) {
                        console.log("this move will go outside.");
                        return;
                    }
                    if(this.iwashiMap[ny][nx] < 0) {
                        console.log("player try to go to wall.");
                        return;
                    }
                    this.player.x += dx[i];
                    this.player.y += dy[i];
                }
            }
        }
        else {
            this.player.paralyzed -= 1;
        }
    }

    // call before player's move. return Array of String.
    output() {
        var ret = [String(this.H) + " " + String(this.W) + " " + String(this.T) + " " + String(this.currentTurn) + " " + String(this.score)];
        ret.push(String(this.player.y) + " " + String(this.player.x) + " " + String(this.player.paralyzed));
        for(let i = 0; i < this.H; i++) {
            let add = new Array(this.W);
            for(let j = 0; j < this.W; j++) {
                if(this.iwashiMap[i][j] < 0) {
                    add[j] = -1;
                }
                else {
                    add[j] = this.iwashiMap[i][j];
                }
            }
            ret.push(add.join(" "));
        }
        return ret;
    }

    // call after player's move. this function is for scoreing.
    // move is any one of "NEWS". if otherwise, player won't move.
    scoreing(move) {
        // player's move.
        this.playerMove(move);
        // iwashies' move.
        this.iwashiMap = this.getIwashiMove(this.iwashiMap, this.player);
      
        // iwashies appear.
        var addM = Math.ceil(Math.random() * this.M);
        for(let i = 0; i < addM; i++) {
            let x = Math.floor(Math.random() * this.W);
            let y = Math.floor(Math.random() * this.H);
            while(this.iwashiMap[y][x] < 0) {
                x = Math.floor(Math.random() * this.W);
                y = Math.floor(Math.random() * this.H);
            }
            this.iwashiMap[y][x] += 1;
        }
        
        // try to harvest iwashi.
        if(this.iwashiMap[this.player.y][this.player.x] <= 5) {
            this.score += this.iwashiMap[this.player.y][this.player.x];
            this.iwashiMap[this.player.y][this.player.x] = 0;
        }
        else {
            this.player.paralyzed += 5;
            this.iwashiMap[this.player.y][this.player.x] = 0;
        }

        this.currentTurn += 1;
        return this.score;
    }
};

module.exports = new Iwashi();