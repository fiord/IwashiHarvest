// 内部用。プログラムを動かすやつ(今回はAI.jsで)
var Iwashi = require('./Iwashi');
var AI = require('./AI');
var fs = require("fs");

const H = 22, W = 22, T = 1000;

// 取り敢えずテスト盤面。25%=100マスを壁に
// 本番では、テキストファイルにマップの情報は入れる予定です
var testMap = new Array(H);
for(let i = 0; i < H; i++)  testMap[i] = new Array(W).fill(0);
for(let i = 0; i < H; i++)  testMap[i][0] = testMap[i][W-1] = -1;
for(let i = 0; i < W; i++)  testMap[0][i] = testMap[H-1][i] = -1;
var x = Math.floor(Math.random() * W);
var y = Math.floor(Math.random() * H);
for(let i = 0; i < 80; i++) {
    while(testMap[y][x] < 0) {
        x = Math.floor(Math.random() * W);
        y = Math.floor(Math.random() * H);
    }
    testMap[y][x] = -1;
}

// iwashi
for(let i = 0; i < 80; i++) {
    while(testMap[y][x] < 0) {
        x = Math.floor(Math.random() * W);
        y = Math.floor(Math.random() * H);
    }
    testMap[y][x] += 1;
}
Iwashi.iwashiMap = testMap;

// player
while(testMap[y][x] != 0) {
    x = Math.floor(Math.random() * W);
    y = Math.floor(Math.random() * H);
}
Iwashi.player.x = x;
Iwashi.player.y = y;

while(Iwashi.currentTurn <= Iwashi.T) {
    console.log(Iwashi.currentTurn, Iwashi.score);
    let input = Iwashi.output();
    let filename = `./data/test_${("00"+(Iwashi.currentTurn-1)).split(-3)}.txt`;
    fs.writeFile(filename, input.join("\n"), (err) => {if(err) throw err;});
    let move = AI.run(input);
    console.log(move);
    Iwashi.scoreing(move);
}