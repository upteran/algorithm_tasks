// #51687457
const fs = require('fs');
const readline = require('readline');

const config = { input: fs.createReadStream('input.txt') };

const ioInterface = readline.createInterface(config);

let lineNum = 0;
let size;
let points;
let sum = 0;

const convertLine = (line) => line.split(' ');
const convertToNum = str => +str;

/**
 * @param {Array<String>} arr
 * */
const getListSum = (arr) => {
  let sum = 0;
  for (let i = 0;i < arr.length;i++) sum += convertToNum(arr[i]);
  return sum;
};


ioInterface.on('line', line => {
  if(lineNum === 0) {
    size = line;
  }
  if(lineNum === 1) {
    points = convertLine(line);
    sum = getListSum(points);
  }
  lineNum++;
});

/*
-- ПРИНЦИП РАБОТЫ --
Для определения возможности разбить полученный список на 2 равные суммы, используется метод динамического программирование
Задача разбивается на мелкие подзадачи, на основе которых уже получаем ответ
- Список подзадач хранится двумерный массив dp[i][j], в него мы записывает строку [j] подмножество необходимой суммы
 и столбец [i], элементы исходного списка.
- в случае отсутсвия исходной строки или если она равна 0, ответ всегда будет === false
- так же в случае, если сумма элементов исходного списка не делится на 2, ответ будет === false
- в процессе перехода динамики мы вычисляем, можем ли мы составить искомую сумму из элементов списка в подмножестве суммы
- заполняем матрицу отрицательными значениями, затем перебираем каждый элемент списка [i] и элементы подмножества суммы [j],
проверяя, образует ли [i] в сумме с другим элементом значение [j], если элемент меньше/равен текущему элементу подмножества
point[i - 1] <= j, и образует в сумме с предыдущими элементами эту сумму dp[i - 1][j - point[i -1]], устанавливаем данному элементу
значение === true, перебирая все элементы и проверяя значение прошлых dp[i - 1][j], выстраивается путь до конечного результата
- ответ на задачу будет хранится в массиве dp в крайней правйо ячейке dp[points.length][sum], где points.length - размер исходного списка,
sum - искомая сумма

-- ВРЕМЕННАЯ СЛОЖНОСТЬ --
В алгоритме каждый элемент списка проверяется для каждого подмножества необходимой суммы, опуская переборы для составления
матрицы и установки базовых случаев, можем сказать, что временная сложность алгоритма O(N*M), где N подножество из которого мы составляем сумму,
а M это подмножество самой суммы


-- ПРОСТРАНСТВЕННАЯ СЛОЖНОСТЬ --
пространственная сложность так же равно O(N*M), тк нам необходимо хранить данные матрицы
* */

/**
 * create and fill dp table
 * @param {Number} rowSize
 * @param {Number} colSize
 * @returns {Array<array>}
 * */
function createDpTable(rowSize, colSize) {
  return Array(rowSize)
    .fill(0)
    .map(() => Array(colSize));
}

function getSubSetSum(points) {
  // базовый случай, если не возможно разделить сумму на 2 части
  if(sum % 2 !== 0) return 0;

  const size = sum / 2;

  const dp = createDpTable(points.length + 1, size + 1);

  for (let i = 0; i <= points.length; i++) dp[i][0] = true;

  for (let i = 1;i <= points.length;i++) {
    for (let j = 1;j < size + 1;j++) {
      const currNum = points[i - 1];
      if (dp[i - 1][j]) {
        dp[i][j] = dp[i - 1][j];
      } else if (j >= currNum) {
        dp[i][j] = dp[i - 1][j - currNum];
      }
    }
  }

  return dp[points.length][size];
}

ioInterface.on('close', () => {
  const res = getSubSetSum(points);
  process.stdout.write(`${res ? 'True' : 'False'}`);
});