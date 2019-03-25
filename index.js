config = {
    canvasW: 570,
    canvasH: 570,
    gridW: 30,
    gridH: 30,
    me: true,
    tagBoard:[],
    meNum:0,
    friendNum:0
};

window.onload = function(){
    init(config);
}

function init(config){
    var canvas= document.getElementById("canvas");
        canvas.width = config.canvasW;
        canvas.height = config.canvasH;
    var context = canvas.getContext("2d");
    //画棋盘
    drawBoard(context, config);
    //画棋子
    canvas.onclick = function(e){
        var noset = e.offsetX < config.gridW ? false : e.offsetY < config.gridH ? false :true;
        if(noset){
            var xy = judgeMouseXY(e.offsetX, e.offsetY,config);
            // console.log(xy)
            drawChess(context, config, xy[0], xy[1],xy[2],xy[3], config.me);
        }
    }
    

}

function drawBoard(ctx,config){
    ctx.font="40px Arial";
    ctx.fillStyle = "#ffc";
    ctx.strokeStyle = "#222";
    ctx.fillText("CHUXINRIZHI", Math.floor(config.canvasW / 2) - 125, Math.floor(config.canvasH / 2));
    var rowNums = Math.floor(config.canvasH / config.gridH);
    var colNums = Math.floor(config.canvasW / config.gridW);
    //init tagboard
    for(var row = 1; row < rowNums; row ++ ){
        config.tagBoard[row] = [];
        for(var col = 1; col < colNums; col ++ ){
            config.tagBoard[row][col] = 0;
        }
    }
    //draw row lines
    for(var row = 1; row < rowNums; row ++ ){
        ctx.beginPath();
        ctx.lineTo(config.gridW, row * config.gridH);
        ctx.lineTo(config.canvasW - config.gridW, row * config.gridH);
        ctx.stroke();
    }
    //draw column lines
    for(var col = 1; col < colNums; col ++ ){
        ctx.beginPath();
        ctx.lineTo(col * config.gridW, config.gridH);
        ctx.lineTo(col * config.gridW, config.canvasH - config.gridH);
        ctx.stroke();
    }
}

function drawChess(ctx, config, x, y, tagX, tagY,isMe){
    if(config.tagBoard[tagX][tagY] === 1 || config.tagBoard[tagX][tagY] === 2){
        return;
    }
    ctx.beginPath();
    if(isMe){
        ctx.fillStyle = "#222";
        config.tagBoard[tagX][tagY] = 1;
        config.meNum ++;
    }else{
        ctx.fillStyle = "#fff";
        config.tagBoard[tagX][tagY] = 2;
        config.friendNum ++;
    }
    ctx.arc(x, y, Math.floor(config.gridW / 2), 0, Math.PI * 2);
    ctx.fill();
    config.me = !config.me;
    document.getElementById('meNum').innerText = config.meNum;
    document.getElementById('friendNum').innerText = config.friendNum;
}

function judgeMouseXY(x, y, config){
    var cordinates = [[0,0],[1,0],[0,1],[1,1]];
    var offsetD = Number.MAX_VALUE;
    var index = -1;
    var tmpX = x / config.gridW - Math.floor(x / config.gridW);
    var tmpY = y / config.gridH - Math.floor(y / config.gridH);
    for(var i = 0; i < cordinates.length; i++){
        var curNum = Math.sqrt(Math.pow(tmpX - cordinates[i][0], 2) + Math.pow(tmpY - cordinates[i][1], 2));
        if(offsetD > curNum){
            offsetD = curNum;
            index = i;
        }
        // console.log(curNum)
    }
    if(index !== -1){
        tmpX = (cordinates[index][0] + Math.floor(x / config.gridW));
        tmpY = (cordinates[index][1] + Math.floor(y / config.gridH));
    }else{
        tmpX = Math.floor(x / config.gridW);
        tmpY = Math.floor(y / config.gridH);
    }
    return [tmpX * config.gridW, tmpY * config.gridW, tmpX, tmpY];
}

function judgeWin(boardArr,x, y, config){
    for(var row = 1; row < boardArr; row ++){
        for(var col = 1; col < boardArr; col ++){
            
        }

    }

}