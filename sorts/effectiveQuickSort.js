// ID 46962832

const fs = require('fs');
const readline = require('readline');

const config = { input: fs.createReadStream('input.txt') };

const ioInterface = readline.createInterface(config);

let dataArr = [];
let arrLength;
let lineNum = 0;

// ====== input utils fn
const strToNum = str => +str;

/** @param {String} line
 *  @returns {Array.<String>}
 * */
const convertLine = (line) => line.split(' ');

/** @param {Array.<String>} user
 *  @returns {Object}
 * */
function createUserObj(user) {
  return {
    name: user[0],
    tasks: strToNum(user[1]),
    errors: strToNum(user[2]),
  }
}
// ========= input utils fn end
ioInterface.on('line', line => {
  if(lineNum === 0) {
    arrLength = strToNum(line)
  } else if(lineNum < arrLength + 1){
    const [name, tasks, errors] = line.split(' ');
    dataArr.push({name: name, tasks: strToNum(tasks), errors: strToNum(errors)});
  }
  lineNum++;
});

const sortType = {
  TASKS: 'tasks',
  ERRORS: 'errors',
  NAME: 'name',
};

/*
-- ПРИНЦИП РАБОТЫ --
* За основу реализации сортировки используется быстрая сортировка in-place
*
* На вход принимается массив объектов с параметрами, используемыми для последующей сортировки
* Если условия не совпадают с базовым случаем и массив содержит >= 2 значений, запускаем рекурсивно быструю сортировку,
* разбивая массив на 2 части и рекурсивно сортируя каждую из них.
* Для экономии памяти при обработке не создается новых массивов, а сортируется все в рамках одного, входного массива,
* устанавливая курсоры на левой и правой границах и смещая курсоры к центру, меняя местами элементы при необходимости
*
* Принцип сравнения
* при сравнении 2х элементов сравниваются их задачи в порядке убывания, затем штрафы в обратном порядке и в конце имена
 Для части левее середины используется  checkIsGreaterByKey, тк первое сравнения идет по задачам и большее их количество должно оказаться
 в начале массива
*
-- ВРЕМЕННАЯ СЛОЖНОСТЬ --
Для сортировки используется алгоритм быстрой сортировки, других операций кроме сравнения элементов не присутсвует,
сложность алгоритма будет в худшем случае O(n^2), в большинстве случаев, сложность будет равна O(n*log n)

-- ПРОСТРАНСТВЕННАЯ СЛОЖНОСТЬ --
Во время сортировки не выделяется никакой дополнительной памяти, кроме контантных параметров, поэтому простарнственная сложноть
будет равно O(1)
* */

function randomInteger(min, max) {
  // случайное число от min до (max+1)
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}

function checkIsLessByKey(a, b) {
  if(a.tasks === b.tasks) {
    if(a.errors === b.errors) {
      if(a.name.localeCompare(b.name) === 0) {
        return false;
      }
      return a.name.localeCompare(b.name) === 1;
    }
    return a.errors > b.errors
  }
  return a.tasks < b.tasks;
}

function checkIsGreaterByKey(a, b) {
  if(a.tasks === b.tasks) {
    if(a.errors === b.errors) {
      if(a.name.localeCompare(b.name) === 0) {
        return false;
      }
      return a.name.localeCompare(b.name) === -1;
    }
    return a.errors < b.errors
  }
  return a.tasks > b.tasks;
}

/**
 * swap arr elements
 * @param {Array} arr
 * @param {Number} l - left index
 * @param {Number} r - right index
 * */
function swap(arr, l, r) {
  let temp = arr[l];
  arr[l] = arr[r];
  arr[r] = temp;
}

/**
 * @param {Array} arr
 * @param {Number} left
 * @param {Number} right
 * */
function partition(arr, left, right) {
  const pivot = arr[randomInteger(left, right)];
  let l = left;
  let r = right;
  while(l <= r) {
    while(checkIsGreaterByKey(arr[l], pivot)) {
      l++
    }
    while(checkIsLessByKey(arr[r], pivot)) {
      r--
    }
    if(l <= r) {
      swap(arr, l, r);
      l++;
      r--;
    }
  }
  return l;
}

/**
 * @param {Array.<Array>} arr - input arr
 * @param {Number} left
 * @param {Number} right
 * */
function quickSort(arr, left, right) {
  if(arr.length < 2) return arr;
  const i = partition(arr, left, right);
  if(left < i - 1) {
    quickSort(arr, left, i - 1)
  }
  if(i < right) {
    quickSort(arr, i, right)
  }
  return arr;
}
/**
 * @param {Array.<Array>} arr - input arr
 * */
const initFn = (arr) => {
  return quickSort(arr, 0, arr.length - 1);
};
ioInterface.on('close', () => {
  const res = initFn(dataArr);
  res.forEach(item => {
    process.stdout.write(`${item.name}\n`);
  })
});