// #51687435
const fs = require('fs');
const readline = require('readline');

const config = { input: fs.createReadStream('input.txt') };

const ioInterface = readline.createInterface(config);

let lineNum = 0;
let strA;
let strB;

ioInterface.on('line', line => {
  if(lineNum === 0) {
    strA = line;
  }
  if(lineNum === 1) {
    strB = line;
  }
  lineNum++;
});

/*
-- ПРИНЦИП РАБОТЫ --
Для определения разницы между строками и количества необходимых операций используется метод динамического программирования,
- Для хранения данных используется двумерный массив dp[i][j], где в строке и в столбце хранятся исходные строки
- базовый случай определяется, когда одна или обе строки не заданы и === 0
- при переходе динамики проверяется каждый символ одной из строк, с первым символом второй строки, прибавляя после проверки следующий символ 2ой строки
- при подсчете мы проверяем символы строк и при обнаружении разных символов оцениваем сложность опреации, которую необходимо сделать,
сложность можно вычислить по формуле: min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + subCost), где:
 - dp[i -1][j] + 1 - цена удаления + прошлое значение
 - dp[i -1][j] + 1 - цена вставки + прошлое значение
 - dp[i - 1][j - 1] + subCost - сложность замены символов + прошлое значение
- результат можно получить из массива в ячейке dp[strA.length][strB.length]


-- ВРЕМЕННАЯ СЛОЖНОСТЬ --
В алгоритме каждый символ первой строки проверяется с каждым элементом второй строки, поэтому временная сложность алгоритма будет O(N*M), где N и M
соответсвующие строки

-- ПРОСТРАНСТВЕННАЯ СЛОЖНОСТЬ --
пространственная сложность так же равно O(N*M), тк нам необходимо хранить данные строк в матрице
* */

/**
 * @param {Array<array>} dp
 * @param {String} a
 * @param {String} b
 * */
function getDistance(dp, a, b) {
  for (let i = 1;i < strA.length + 1;i++) {
    for (let j = 1;j < strB.length + 1;j++) {
      const subCost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i -1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + subCost);
    }
  }

  return dp[strA.length][strB.length];
}

/**
 * @param {String} strA
 * @param {String} strB
 * */
function createDpTable(strA, strB) {
  let dp = [];
  for (let i = 0;i < strA.length + 1;i++) {
    let temp = [];
    for (let j = 0;j < strB.length + 1;j++) {
      temp[j] = 0;
    }
    dp.push(temp)
  }
  for (let i = 0;i < strA.length + 1;i++) {
    dp[i][0] = i;
  }
  for (let j = 0;j < strB.length + 1;j++) {
    dp[0][j] = j;
  }
  return dp;
}

ioInterface.on('close', () => {
  const dp = createDpTable(strA, strB);
  const res = getDistance(dp, strA, strB);
  process.stdout.write(`${res}`);
});