// 内部用。プログラムを動かすやつ(今回はAI.jsで)
var Iwashi = require('./Iwashi');
var AI = require('./AI');
var fs = require("fs");

const H = 22, W = 22, T = 1000;

// 取り敢えずテスト盤面。25%=100マスを壁に
// 本番では、テキストファイルにマップの情報は入れる予定です
var testMap = new Array(H);
for(let i = 0; i < H; i++)  testMap[i] = new Array(W).fill('.');
for(let i = 0; i < H; i++)  testMap[i][0] = testMap[i][W-1] = '#';
for(let i = 0; i < W; i++)  testMap[0][i] = testMap[H-1][i] = '#';
var x = Math.floor(Math.random() * W);
var y = Math.floor(Math.random() * H);
for(let i = 0; i < 80; i++) {
    while(testMap[y][x] === '#') {
        x = Math.floor(Math.random() * W);
        y = Math.floor(Math.random() * H);
    }
    testMap[y][x] = '#';
}

// iwashi
let iwashiQueue = Array(1000).fill();
for(let i = 0; i < 1000; i++) {
    do {
        x = Math.floor(Math.random() * W);
        y = Math.floor(Math.random() * H);
    }while(testMap[y][x] === '#');
    iwashiQueue[i] = {
        x,
        y,
        t: Math.floor(Math.random() * T)
    };
}
iwashiQueue.sort((a,b) => a.t-b.t);
Iwashi.maps = testMap;
Iwashi.iwashiMap = Array(H).fill().map(() => Array(W).fill(0));
Iwashi.iwashi = iwashiQueue;
// player
while(testMap[y][x] === '#') {
    x = Math.floor(Math.random() * W);
    y = Math.floor(Math.random() * H);
}
Iwashi.player.x = x;
Iwashi.player.y = y;

const input = Iwashi.output();
console.log("start running...");
const output = AI.run(input.join('\n'));
console.log(output);
for (const i of iwashiQueue) {
    if (i.t === 0) {
        Iwashi.iwashiMap[i.y][i.x]++;
    }
}

for (let turn = 0; turn < 1000; turn++) {
    if (output.length === turn) {
        break;
    }
    let filename = `./data/test_${("00"+(Iwashi.currentTurn-1)).slice(-3)}.txt`;
    let writes = Iwashi.iwashiMap.map((i) => i.join(" ")).join("\n");
    fs.writeFile(filename, writes, (err) => {if(err) throw err;});
    let move = output[turn];
    Iwashi.scoreing(move);
    console.log(Iwashi.currentTurn, Iwashi.score);
}