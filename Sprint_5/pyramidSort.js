// #50689487

const fs = require('fs');
const readline = require('readline');

const config = { input: fs.createReadStream('input.txt') };

const ioInterface = readline.createInterface(config);

let dataArr = [];
let arrLength;
let lineNum = 0;

// ====== input utils fn
const strToNum = str => +str;

// ========= input utils fn end
ioInterface.on('line', line => {
  if(lineNum === 0) {
    arrLength = strToNum(line)
  } else if(lineNum <= arrLength){
    const [name, tasks, errors] = line.split(' ');
    dataArr.push({name: name, tasks: strToNum(tasks), errors: strToNum(errors)});
  }
  lineNum++;
});



/*
-- ПРИНЦИП РАБОТЫ --
* В основе алгоритма лежит сортировка кучи через просеивание вверх и вниз
В первой итерации создается массив и заполняется входными данными с сохранением свойств кучи, при завершении цикла
мы имеем в результате элементы с наиболее приоритетным на вершине

Во второй итерации происходит запись наиболее приоритетного элемента в результирующий массив с последующим удалением его из кучи и
запуском просеивания вниз, для восстановления свойств упорядоченности, алгоритм повторяется, пока не будут записаны в результат все элементы кучи

-- ВРЕМЕННАЯ СЛОЖНОСТЬ --
Создание бинарной кучи происходит за O(1)
Вставка элементов в бинарную кучу будет происходить за O(logn) + O(logn)+...+O(logn) = O(nlogn)
Извлечение ээлементов для создания результирующего массива так же будет выполняться за O(nlogn) в худшем случае

Общая временная сложность первого цикла будет равна T = O(1) + O(nlogn) + O(nlogn) = O(nlogn)

-- ПРОСТРАНСТВЕННАЯ СЛОЖНОСТЬ --
В первом цикле создания бинарной кучи и вставки элементов необходимо выделить O(n) памяти для хранения текущизх элементов + O(n) для хранения конечного результата
Пространственная сложность алгоритма будет равна O(n)
* */


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

// check less value from input object helper
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

/**
 * add value to heap
 * @param {Array} heap
 * @param {Object} value
 * @param {Number} index
 * @return undefined
 * */
function heapAdd(heap, value, index) {
  const idx = index + 1; // start from 1 instead 0 index
  heap[idx] = value;
  shiftUp(heap, idx);
}

/**
 * @param {Array} heap
 * @param {Number} idx
 * @return undefined
 * */
function shiftUp(heap, idx) {
  if(idx === 1 || !heap[idx]) return;
  const parentIdx = Math.floor(idx / 2);
  if(checkIsLessByKey(heap[parentIdx], heap[idx])) {
    swap(heap, parentIdx, idx);
  }
  shiftUp(heap, parentIdx);
}

/**
 * @param {Array} heap
 * @param {Number} idx
 * @return undefined
 * */
function shiftDown(heap, idx) {
  const l = idx * 2;
  const r = idx * 2 + 1;
  let largestIds = l;
  if(heap.length - 1 < l) return;
  if(heap.length - 1 >= r && checkIsLessByKey(heap[l], heap[r])) {
    largestIds = r;
  }
  if(checkIsLessByKey(heap[idx], heap[largestIds])) {
    swap(heap, idx, largestIds);
  }
  shiftDown(heap, largestIds);
}

/**
 * @param {Array} heap
 * @param {String} heap[0].name
 * @param {Number} heap[0].tasks
 * @param {Number} heap[0].errors
 * @return {Array<object>}
 * */
function getMaxNode(heap) {
  const res = [];
  const size = heap.length;
  for(let i = 1;i < size;i++) {
    const x = heap[1];
    heap[1] = heap[heap.length - 1];
    res.push(x);
    heap.pop();
    shiftDown(heap, 1);
  }
  return res;
}

/**
 * @param {Array} data
 * @param {String} data[0].name
 * @param {Number} data[0].tasks
 * @param {Number} data[0].errors
 * @param {Number} listLength
 * @return {Array<object>}
 * */
function initFn(data, listLength) {
  const heap = [];
  for (let i = 0;i < listLength;i++) {
    heapAdd(heap, data[i], i);
  }
  return getMaxNode(heap);
}

ioInterface.on('close', () => {
  const res = initFn(dataArr, arrLength);
  res.forEach(item => {
    process.stdout.write(`${item.name}\n`);
  })
});