config = {
  canvasW: 570, // 画布宽
  canvasH: 570, // 画布高
  gridW: 30, //棋盘格子宽
  gridH: 30, //棋盘格子高
  me: true, // 哪方先下棋
  meChessColor: '#222',
  friendChessColor: '#fff',
  winnerColor: '#aacf53',
  meChessValue: 1,
  friendChessValue: 2,
  tagBoard: [], //
  meNum: 0, // 我方下棋数量
  friendNum: 0, // 对方下棋子数量
};
const store = {
  rows: 0,
  cols: 0,
  context: null,
  canvas: null,
  dirLoseWin: {
    TB: { me: [], friend: [] }, //上+下         "|"
    TRBL: { me: [], friend: [] }, //上右 +下左    "/"
    LR: { me: [], friend: [] }, // 左+右         "--"
    RBLT: { me: [], friend: [] }, // 右下 + 左上  "\"
  },
};

window.onload = function () {
  init(config);
};
// 初始化
function init(config) {
  var canvas = document.getElementById('canvas');
  canvas.width = config.canvasW;
  canvas.height = config.canvasH;
  var context = canvas.getContext('2d');
  store.context = context;
  store.canvas = canvas;
  //画棋盘
  let [rows, cols] = drawBoard(context, config);
  store.rows = rows;
  store.cols = cols;
  //点击落棋子绑定事件
  store.canvas.addEventListener('click', clickChessHandler);
}

//处理落棋子事件
function clickChessHandler(e) {
  var noset =
    e.offsetX < config.gridW ? false : e.offsetY < config.gridH ? false : true;
  if (noset) {
    var xy = judgeMouseXY(e.offsetX, e.offsetY, config);
    drawChess(store.context, config, xy[0], xy[1], xy[2], xy[3], config.me);
    try {
      judgeWin(xy[2], xy[3]);
    } catch (err) {
      console.log('只是判断越界，正常逻辑，基操勿6');
    }
  }
}
// 绘制棋盘
function drawBoard(ctx, config) {
  ctx.font = '40px Arial';
  ctx.fillStyle = '#ffc';
  ctx.strokeStyle = '#222';
  ctx.fillText(
    'Go Bang Game',
    Math.floor(config.canvasW / 2) - 138,
    Math.floor(config.canvasH / 2),
  );
  var rowNums = Math.floor(config.canvasH / config.gridH);
  var colNums = Math.floor(config.canvasW / config.gridW);
  //init tagboard
  for (var row = 1; row < rowNums; row++) {
    config.tagBoard[row] = [];
    for (var col = 1; col < colNums; col++) {
      config.tagBoard[row][col] = 0;
    }
  }
  //draw row lines
  for (var row = 1; row < rowNums; row++) {
    ctx.beginPath();
    ctx.lineTo(config.gridW, row * config.gridH);
    ctx.lineTo(config.canvasW - config.gridW, row * config.gridH);
    ctx.stroke();
  }
  //draw column lines
  for (var col = 1; col < colNums; col++) {
    ctx.beginPath();
    ctx.lineTo(col * config.gridW, config.gridH);
    ctx.lineTo(col * config.gridW, config.canvasH - config.gridH);
    ctx.stroke();
  }
  return [rowNums, colNums];
}

// 绘制棋子
function drawChess(ctx, config, x, y, tagX, tagY, isMe) {
  if (
    config.tagBoard[tagX][tagY] === config.meChessValue ||
    config.tagBoard[tagX][tagY] === config.friendChessValue
  ) {
    return;
  }
  ctx.beginPath();
  if (isMe) {
    ctx.fillStyle = config.meChessColor;
    config.tagBoard[tagX][tagY] = config.meChessValue;
    config.meNum++;
  } else {
    ctx.fillStyle = config.friendChessColor;
    config.tagBoard[tagX][tagY] = config.friendChessValue;
    config.friendNum++;
  }
  ctx.arc(x, y, Math.floor(config.gridW / 2), 0, Math.PI * 2);
  ctx.fill();
  config.me = !config.me;
  document.getElementById('meNum').innerText = config.meNum;
  document.getElementById('friendNum').innerText = config.friendNum;
}

// 绘制赢方棋子
function drawWinner(axis) {
  for (let i = 0; i < axis.length; i++) {
    let x = axis[i][0] * config.gridW;
    let y = axis[i][1] * config.gridH;
    store.context.beginPath();
    store.context.fillStyle = config.winnerColor;
    store.context.arc(x, y, Math.floor(config.gridW / 4), 0, Math.PI * 2);
    store.context.fill();
  }
  console.log(axis);
}

// 判断落子位置边界处理
function judgeMouseXY(x, y, config) {
  var cordinates = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ];
  var offsetD = Number.MAX_VALUE;
  var index = -1;
  var tmpX = x / config.gridW - Math.floor(x / config.gridW);
  var tmpY = y / config.gridH - Math.floor(y / config.gridH);
  for (var i = 0; i < cordinates.length; i++) {
    var curNum = Math.sqrt(
      Math.pow(tmpX - cordinates[i][0], 2) +
      Math.pow(tmpY - cordinates[i][1], 2),
    );
    if (offsetD > curNum) {
      offsetD = curNum;
      index = i;
    }
    // console.log(curNum)
  }
  if (index !== -1) {
    tmpX = cordinates[index][0] + Math.floor(x / config.gridW);
    tmpY = cordinates[index][1] + Math.floor(y / config.gridH);
  } else {
    tmpX = Math.floor(x / config.gridW);
    tmpY = Math.floor(y / config.gridH);
  }
  return [tmpX * config.gridW, tmpY * config.gridW, tmpX, tmpY];
}

// 检测落子数
function checkWin(role, isMe, dir) {
  if (role.length >= 5) {
    let isContinue = checkContinuous(role, dir);
    if (!isContinue) {
      return false
    }
    setTimeout(function () {
      alert(!isMe ? '白旗胜利✌️' : '黑棋胜利✌️');
    }, 200);
    store.canvas.removeEventListener('click', clickChessHandler);
    console.log(role);
    drawWinner(role);
    return true;
  }
  return false;
}
//检测连续性
function checkContinuous(role, dir) {
  let judgeX = function (role) {
    let step = 1;
    for (let i = 1; i < role.length; i++) {
      step += 1;
      if (Math.abs(role[i][0] - role[i - 1][0]) !== 1) {
        step -= 1;
      }
    }
    console.log('x', step)
    return step >= 5;
  }
  let judgeY = function (role) {
    let step = 1;
    for (let i = 1; i < role.length; i++) {
      step += 1;
      console.log(Math.abs(role[i][1] - role[i - 1][1]), '！==1？')
      if (Math.abs(role[i][1] - role[i - 1][1]) !== 1) {
        step -= 1;
      }
    }
    console.log(step)
    return step >= 5;
  }
  switch (dir) {
    case 'TB':
      return judgeY(role);
    case 'LR':
      return judgeX(role);
    case 'RBLT':
    case 'TRBL':
      return judgeX(role) && judgeY(role);
    default: return false
  }
}
// 判断输赢
function judgeWin(x, y) {
  let board = config.tagBoard;
  let { TB, TRBL, LR, RBLT } = store.dirLoseWin;
  let isMe = !config.me;
  let chessValue = isMe ? config.meChessValue : config.friendChessValue;
  let dirs = ['TB', 'TRBL', 'LR', 'RBLT'];
  for (let dir = 0; dir < dirs.length; dir++) {
    TB.me = TB.friend = [];
    TRBL.me = TRBL.friend = [];
    LR.me = LR.friend = [];
    RBLT.me = RBLT.friend = [];
    let role = [];
    switch (dirs[dir]) {
      case 'TB':
        role = TB[isMe ? 'me' : 'friend'];
        for (let i = -4; i <= 4; i++) {
          board[x][y + i] === chessValue && role.push([x, y + i]);
          if (checkWin(role, isMe, dirs[dir])) return;
        }
        break;
      case 'TRBL':
        role = TRBL[isMe ? 'me' : 'friend'];
        for (let i = -4; i <= 4; i++) {
          board[x + i][y + i] === chessValue && role.push([x + i, y + i]);
          if (checkWin(role, isMe, dirs[dir])) return;
        }
        break;
      case 'LR':
        role = TRBL[isMe ? 'me' : 'friend'];
        for (let i = -4; i <= 4; i++) {
          board[x + i][y] === chessValue && role.push([x + i, y]);
          if (checkWin(role, isMe, dirs[dir])) return;
        }
        break;
      case 'RBLT':
        role = TRBL[isMe ? 'me' : 'friend'];
        for (let i = -4; i <= 4; i++) {
          board[x + i][y - i] === chessValue && role.push([x + i, y - i]);
          if (checkWin(role, isMe, dirs[dir])) return;
        }
        break;
      default:
        break;
    }
  }
}
