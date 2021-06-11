// #51382763
const fs = require('fs');
const readline = require('readline');

const config = { input: fs.createReadStream('input.txt') };

const ioInterface = readline.createInterface(config);

/*
-- ПРИНЦИП РАБОТЫ --
В основе алгоритма поиска максимального остового дерева лежит алгоритм Прима
Для реализации нам необходимы (class MTS):
 - вершины, которые не были еще добавлены в остовое дерево (notAdded)
 - сумму списка ребер максимального остового дерева (sum)
 - промежуточные ребра смежных вершин, для последующего сравнения по весу (edgesHeap)

Основные этапы работы алгоритма:
 - пробегаемся по списку не обработанных вершин
 - добвляем в промежуточный список (edgesHeap) смежные с текущей вершиной ребра
 - достаем из списка максимальное ребро
 - если вершина смежная с текущей не обработана, добавляем вес ребра к конечному результату, в проивном случае удаляем ребро из
 промежуточного списка (edgesHeap) и переходим к следующему ребру

Для более быстрого поиска максимального ребра используется приоритетная очередь (class Heap)
 - создаем дерево, сохраняя его значения в кучу
 - при добавлении новых ребер добавляем значение в конец кучи
 - "просеиваем" дерево и меняем местами значения листьев если необходимо, добавляя максимальное значение в начало кучи
 - когда получаем максимальное значение при формировании остового дерева, удаляем из кучи максимальное значение, и затем осуществляем
 просеивание вниз, сортируя при необходимости дерево

-- ВРЕМЕННАЯ СЛОЖНОСТЬ --
Для получения окончательного результата нам понадобиться обойти все ребра [O(E)], при поиске максимального ребра используется алгоритм
приоритетной очереди, где поиск максимального значения в худшем случае состовляет O(logn), так же мы обходим все вершины, соответсвенно в текущем
решении сложность будет O(|V| * log|E|)

-- ПРОСТРАНСТВЕННАЯ СЛОЖНОСТЬ --
Для реализации граф хранится в виде матрицы смежности, при данном представлении тратится O(V^2) памяти, для хранения ребер используется
куча, на которую выделяется O(E), соответвенно пространственная сложность алгоритма будет равна: O(V^2) + O(E)
* */

class MaxHeap {
  constructor(heap) {
    this.heap = heap || [];
  }

  get heapSize () {
    return this.heap.length;
  }
  /** swap arr elements
   * @param {Array} arr
   * @param {Number} l - left index
   * @param {Number} r - right index
   * */
  _swap(arr, l, r) {
    let temp = arr[l];
    arr[l] = arr[r];
    arr[r] = temp;
  }

  // check less value from input object helper
  _checkIsLessByKey(a, b) {
    return a.weight < b.weight;
  }

  /**
   * @param {Number} idx
   * @return undefined
   * */
   _shiftUp(idx) {
    if(idx === 1 || !this.heap[idx]) return;
    const parentIdx = Math.floor(idx / 2);
    if(this._checkIsLessByKey(this.heap[parentIdx], this.heap[idx])) {
      this._swap(this.heap, parentIdx, idx);
    }
    this._shiftUp(parentIdx);
  }

  /**
   * @param {Number} idx
   * @return undefined
   * */
   _shiftDown(idx) {
    const l = idx * 2;
    const r = idx * 2 + 1;
    let largestIds = l;
    if(this.heap.length - 1 < l) return;
    if(this.heap.length - 1 >= r && this._checkIsLessByKey(this.heap[l], this.heap[r])) {
      largestIds = r;
    }
    if(this._checkIsLessByKey(this.heap[idx], this.heap[largestIds])) {
      this._swap(this.heap, idx, largestIds);
    }
    this._shiftDown(largestIds);
  }

  /**
   * add value to heap
   * @param {Object} value
   * @return undefined
   * */
  heapAdd(value) {
    const idx = !this.heap.length ? 1 : this.heap.length;
    this.heap[idx] = value;
    this._shiftUp(idx);
  }

  /**
   * @return {Object} res
   * @return {Number} res.start
   * @return {Number} res.end
   * @return {Number} res.weight
   * */
  getMaxNode() {
    const res = [];
    const x = this.heap[1];
    this.heap[1] = this.heap[this.heap.length - 1];
    res.push(x);
    this.heap.pop();
    this._shiftDown(1);
    console.log(this.heap)
    return res[0];
  }
}



let lineNum = 0;
let inputDataSize = 0;

const strToNum = str => +str;
const convertLine = line => line.split(' ');

class MTS {
  constructor(heap) {
    this.edgesHeap = heap;
    this.notAdded = new Set();
    this.sum = 0;
    this.matrix = [];
  }


  set graphMatrix(size) {
    for(let i = 0;i < size;i++) {
      let temp = new Array(size).fill(null);
      this.matrix.push(temp);
    }
  }

  run(from) {
    return this._getMaxThree(from);
  }

  addToList(item) {
    const [from, to, weight] = convertLine(item, strToNum);
    const w = +weight;
    this.notAdded.add(+from);
    this.notAdded.add(+to);
    const row = from - 1;
    const cell = to - 1;
    if(!this.matrix[row][cell]) {
      this.matrix[row][cell] = w;
      this.matrix[cell][row] = w;
      return;
    }
    if(this.matrix[row][cell] < w) {
      this.matrix[row][cell] = w;
      this.matrix[cell][row] = w;
    }
  }

  _addVertex(v) {
    this.notAdded.delete(v);
    for(let i = 1;i <= this.matrix.length;i++) {
      if(this.matrix[v - 1][i - 1] && this.notAdded.has(i)) {
        this.edgesHeap.heapAdd({ start: v, end: i, weight: this.matrix[v - 1][i - 1] });
      }
    }
  }

  _extractMax() {
    return this.edgesHeap.getMaxNode();
  }

  _getMaxThree(from) {
    // если в списке только 1 вершина, сумма ребер всегда будет === 0
    if(this.matrix.length === 1) return 0;
    this._addVertex(from);
    while(this.notAdded.size !== 0 && this.edgesHeap.heapSize !== 1) {
      const e = this._extractMax();
      if(this.notAdded.has(e.end)) {
        this._addVertex(e.end);
        this.sum += +e.weight;
      }
    }
    if(this.notAdded.size !== 0 || !this.sum) {
      return 'Oops! I did it again';
    }
    return this.sum;
  }
}

const heap = new MaxHeap();
const mts = new MTS(heap);

ioInterface.on('line', line => {
  if(lineNum === 0) {
    const [v, e] = convertLine(line, strToNum);
    inputDataSize = strToNum(e);
    mts.graphMatrix = strToNum(v);
  }
  if(lineNum !== 0 && inputDataSize >= lineNum) {
    mts.addToList(line, lineNum);
  }
  lineNum++;
});

ioInterface.on('close', () => {
  const res = mts.run(1);
  process.stdout.write(`${res}`);
});