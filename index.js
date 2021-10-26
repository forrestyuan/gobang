config = {
  canvasW: 570, // 画布宽
  canvasH: 570, // 画布高
  gridW: 30, //棋盘格子宽
  gridH: 30, //棋盘格子高
  me: true, // 哪方先下棋
  meChessColor: '#222', // 我方棋子颜色
  friendChessColor: '#fff', // 对方棋子颜色
  winnerColor: '#aacf53', //赢家连线棋子颜色
  meChessValue: 1,  // 我方棋子代码
  friendChessValue: 2, //对方棋子代码
  tagBoard: [], //棋盘，保存代码数据，用于标识落子位置
//   meNum: 0, // 我方下棋数量,通过Object.defineProperty设置
//   friendNum: 0, // 对方下棋子数量,通过Object.defineProperty设置
};
const store = {
  rows: 0, //保存的棋盘行数
  cols: 0, //保存的棋盘列数
  context: null, //画布上下文
  canvas: null, // 画布对象
  currenAxis:[], //落子的坐标记录
  drawHistory:[], //落子前的棋盘图像数据记录
  dirLoseWin: { // 判断输赢的方向坐标数据
    TB: { me: [], friend: [] }, //上+下         "|"
    TRBL: { me: [], friend: [] }, //上右 +下左    "/"
    LR: { me: [], friend: [] }, // 左+右         "--"
    RBLT: { me: [], friend: [] }, // 右下 + 左上  "\"
  },
};

/**
 * @description 监听落子数量，更新页面
 */
function listenChessNum() {
  let meNum = 0;
  let friendNum = 0;
  Object.defineProperties(config, {
    meNum: {
      configurable: true,
      get: function () {
        return meNum;
      },
      set: function (value) {
        meNum = value;
        document.getElementById('meNum').innerText = value;
      },
    },
    friendNum: {
      configurable: true,
      get: function () {
        return friendNum;
      },
      set: function (value) {
        friendNum = value;
        document.getElementById('friendNum').innerText = value;
      },
    },
  });
}
// 页面加载后，初始化棋盘
window.onload = function () {
  init(config, store);
};

/**
 * @description 初始化棋盘，监听落子事件，监听棋子数量变化更新页面
 * @param {Object} config 配置信息
 * @param {Object} store 用于保存数据
 */
function init(config,store) {
  var canvas = document.getElementById('canvas');
  canvas.width = config.canvasW;                    //设置画布宽度
  canvas.height = config.canvasH;                   // 设置画布高度
  var context = canvas.getContext('2d');
  store.context = context;                          // 保存画布上下文到store中
  store.canvas = canvas;                            //保存画布到上下文
  let [rows, cols] = drawBoard(context, config);    //绘制棋盘
  store.rows = rows;                                //保存棋盘行数
  store.cols = cols;                                //保存棋盘列数
  listenChessNum();                                 //绑定监听棋子数量变化
  store.canvas.addEventListener('click', clickChessHandler);//点击落棋子绑定事件
}


/**
 * @description 落子事件句柄，绘制棋子的同时判断输赢
 * @param {Event} e 事件对象
 */
function clickChessHandler(e) {
  // 判断【上+左】边界棋子是否越界
  var outsideLeftTop =
    e.offsetX < config.gridW ? false : e.offsetY < config.gridH ? false : true;
  // 判断【下+右】边界棋子是否越界
  let outsideRgithBottom =
    e.offsetX > config.canvasW - config.gridW / 2
      ? false
      : e.offsetY > config.canvasH - config.gridH / 2
      ? false
      : true;
  // 如果都没越界
  if (outsideLeftTop && outsideRgithBottom) {
    var xy = judgeMouseXY(e.offsetX, e.offsetY, config); // 判断棋子落在各自的哪个顶点
    // 保存落子前的画布图像数据
    store.drawHistory.push(
      store.context.getImageData(0, 0, config.canvasW, config.canvasH),
    );
    // 绘制棋子，落子
    drawChess(store.context, config, xy[0], xy[1], xy[2], xy[3], config.me);
    // 保存落子后的坐标数据
    store.currenAxis.push([xy[2], xy[3]]);
    // 判断输赢
    try {
      judgeWin(xy[2], xy[3]);
    } catch (err) {
      console.log('只是判断越界，正常逻辑，基操勿6');
    }
  } else {
    console.log('大哥你落子棋盘歪了');
  }
}

/**
 * @description 绘制棋盘，底部标语/格子
 * @param {CanvasRenderingContext2D} ctx 画布上下文
 * @param {Object} config 配置对象
 * @returns {Array} 棋盘行数和列数【rows,cols】
 */
function drawBoard(ctx, config) {
  //绘制标语
  ctx.font = '40px Arial';
  ctx.fillStyle = '#ffc';
  ctx.strokeStyle = '#222';
  ctx.fillText(
    'Go Bang Game',
    Math.floor(config.canvasW / 2) - 138,
    Math.floor(config.canvasH / 2),
  );
  //计算行数和列数
  var rowNums = Math.floor(config.canvasH / config.gridH);
  var colNums = Math.floor(config.canvasW / config.gridW);
  // 初始化棋盘代码数据：0
  for (var row = 1; row < rowNums; row++) {
    config.tagBoard[row] = [];
    for (var col = 1; col < colNums; col++) {
      config.tagBoard[row][col] = 0;
    }
  }
  //绘制横线
  for (var row = 1; row < rowNums; row++) {
    ctx.beginPath();
    ctx.lineTo(config.gridW, row * config.gridH);
    ctx.lineTo(config.canvasW - config.gridW, row * config.gridH);
    ctx.stroke();
  }
  //绘制竖线
  for (var col = 1; col < colNums; col++) {
    ctx.beginPath();
    ctx.lineTo(col * config.gridW, config.gridH);
    ctx.lineTo(col * config.gridW, config.canvasH - config.gridH);
    ctx.stroke();
  }
  // 返回行数和列数
  return [rowNums, colNums];
}


/**
 * @description 绘制棋子
 * @param {CanvasRenderingContext2D} ctx 画布上下文
 * @param {Object} config 配置信息
 * @param {number} x 绘制横坐标 eg: 5*gridW
 * @param {number} y 绘制纵坐标 eg: 5*gridH
 * @param {number} tagX 棋盘数据所在格子横向位置 eg: 5
 * @param {number} tagY 棋盘数据所在格子纵向位置 eg: 5
 * @param {boolean} isMe 我方还是对方
 */
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
}
 
/**
 * @description 绘制赢方棋子
 * @param {Array} axis 连线的棋子坐标数据
 */
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


/**
 * @description 判断落子位置边界处理
 * @param {number} x 点击后的x轴位置，需要计算后确定落子位置
 * @param {number} y 点击后的y轴位置，需要计算后确定落子位置
 * @param {Object} config 配置对象
 * @returns {Array} 棋子实际落子的坐标信息 =>[落子横坐标，落子纵坐标，落子所在横向格子数，落子所在纵向格子数]
 */
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
/**
 * 
 * @param {Array} role 当前角色的落子标记数据，连续的坐标数据
 * @param {Boolean} isMe 是否我方
 * @param {String} dir 方向代码 'TB'｜'TRBL'｜ 'LR'｜ 'RBLT'
 * @returns 
 */
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

/**
 * @description 检测棋子连续性
 * @param {Array} role 当前角色的落子标记数据，连续的坐标数据
 * @param {String} dir 方向代码 'TB'｜'TRBL'｜ 'LR'｜ 'RBLT'
 * @returns {Boolean} 是否连续
 */
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
/**
 * 
 * @param {number} x 棋子实际落子横向格子位置
 * @param {number} y 棋子实际落子纵向向格子位置
 */
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

/**
 * @description 悔棋绘制
 */
function drawBack(){
    if(store.drawHistory.length === 0){
        alert('无棋可悔....你好水哦😯😂')
        return
    }
    !config.me ? --config.meNum: --config.friendNum;
    config.me  = !config.me;
    let tagBoardData = store.currenAxis.pop()
    config.tagBoard[tagBoardData[0]][tagBoardData[1]] = 0;
    let imgData = store.drawHistory.pop()
    store.context.clearRect(0, 0, config.canvasW, config.canvasH)
    store.context.putImageData(imgData, 0, 0)
}
