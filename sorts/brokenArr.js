// ID 46900119

const fs = require('fs');
const readline = require('readline');

const config = { input: fs.createReadStream('input.txt') };

// ====== input utils fn
const strToNum = str => +str;

/** @param {String} line
 *  @returns {Array.<String>}
 * */
const convertLine = (line) => line.split(' ');

/**
 * Convert strings values of array to numbers
 * @param {Array.<String>} arr
 * @returns {Array.<Number>}
 * */
const convertStrArrToNum = (arr) => {
  const res = [];
  for (let i = 0;i < arr.length;i++) {
    res.push(strToNum(arr[i]));
  }
  return res;
};
// ========= input utils fn end

const ioInterface = readline.createInterface(config);

let dataArr = [];
let searchValue;
let lineNum = 0;

ioInterface.on('line', line => {
  if(lineNum === 1) searchValue = strToNum(line);
  if(lineNum === 2) {
    dataArr = convertStrArrToNum(convertLine(line));
  }
  lineNum++;
});

/*
-- ПРИНЦИП РАБОТЫ --
* За основу реализации поиска индекса взял алгоритм бинарного поиска
*
* Входной массив частично отсортирован по 2м половининам, поэтому можно взять за основу бинарный поиск, обрабатывая кейсы
* когда встречается не отсортированнй участок
* Берется левый и правый курсоры, если попадается отсортированный участок, проверяем по стандартным условиям бинарного поиска
* запуская рекурсивно поиск для левой или правой стороны
* Если попадается сломанный участок left > mid, делаем дополнительную проверку для определения возможного учатка нахождения
* искомого числа и запускаем рекурсивно бинарный поиск
*
-- ВРЕМЕННАЯ СЛОЖНОСТЬ --
Временная сложность бинарного поиска в худшем случае O(log n), дополнительных операций в функции не происходит поэтому сложность
всего поиска будет так же равна O(log n)

-- ПРОСТРАНСТВЕННАЯ СЛОЖНОСТЬ --
Во время поиска не выделяется никакой дополнительной памяти, кроме контантных параметров, поэтому простарнственная сложноть
будет равно O(1)
* */

/**
 * get middle of range
 * @param {Number} l
 * @param {Number} r
 * */
function getMiddlePivot(l, r) {
  return Math.floor((l + r) / 2)
}

/**
 * @param {Array.<Number>} arr
 * @param {Number} value - search value
 * @param {Number} left
 * @param {Number} right
 * @returns {Number} -1 || index of search value
 * */
function findByBinarySearch(arr, value, left, right) {
  // base case
  if(left > right) return -1;

  const mid = getMiddlePivot(left, right);
  if(arr[mid] === value) return mid;

  // e.g: [1, 2, 3, 4, 5] => [left]1 < [mid]3
  if(arr[left] <= arr[mid]) {
    if(value <= arr[mid] && value >= arr[left]) {
      return findByBinarySearch(arr, value, left, mid - 1);
    }
    return findByBinarySearch(arr, value, mid + 1, right);
  }
  // e.g: [10, 15, 1, 3, 4, 5, 9] => [left]10 > [mid]3
  if(value >= arr[mid] && value <= arr[right]) {
    return findByBinarySearch(arr, value, mid + 1, right);
  }
  return findByBinarySearch(arr, value, left, mid - 1);
}

ioInterface.on('close', () => {
  const res = findByBinarySearch(dataArr, searchValue, 0, dataArr.length - 1);
  process.stdout.write(`${res}`);
});