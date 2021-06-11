// ID 48017661

const fs = require('fs');
const readline = require('readline');

const config = { input: fs.createReadStream('input.txt') };

const ioInterface = readline.createInterface(config);

let dataLength = 0;
let dataList = [];
let lineNum = 0;
let maxKey = 5;

// ====== input utils fn
const strToNum = str => +str;
const convertLine = (line) => line.split(' ');

const LENGTH_COUNT_LINE = 1;

/**
 * @param {Array.<String>} data
 * */
const prepareData = (data) => {
  const params = {};
  params.key = strToNum(data[1]);
  if(data[0] === 'put') {
    params.value = strToNum(data[2]);
  }
  return {
    method: data[0],
    params
  }
};

ioInterface.on('line', line => {
  if(lineNum === 0) {
    dataLength = strToNum(line);
  } else if(lineNum > 0 && lineNum < (dataLength + LENGTH_COUNT_LINE)){
    const inputData = convertLine(line);
    const key = strToNum(inputData[1]);
    if(maxKey < key) maxKey = key;
    dataList.push(prepareData(inputData));
  }
  lineNum++;
});


/*
-- ПРИНЦИП РАБОТЫ --
- Для вычисления номера корзины используется метод деления
- Для избежания коллизий используется метод открытой адресации, все записи в корзине осуществялются в виде [(key, value)]

put - при добавлении в таблицу, вычисляется хеш-функция, если корзина существует, проверяется наличие записи в ней, при обноружении
коллизии, проверяются записи по ключу, если записей с входным ключем нет, инкрементируется индекс и делается новая запись, если запись
с ключом уже есть, данные перезаписываются

другие методы работают по аналогии с методом put, проверяя наличие записей и коллизий в корзине

-- ВРЕМЕННАЯ СЛОЖНОСТЬ --
Временная сложность в среднем и лучшем случае O(1), тк для любой операции с записью и чтением вызывается вычисление хеш функции
и по номеру будет получен элемент, а мы знаем что сложность получения по индексу массива O(1)

В худшем случае сложность может быть O(n), при возникновении большого количества коллизий и необходимости поиска в корзине необходимого
элемента

-- ПРОСТРАНСТВЕННАЯ СЛОЖНОСТЬ --
Пространственная сложность будет O(n), тк для хранения каждого (n) элемента в хеш таблице необходимо выделить память
* */

class HashTable {
  constructor(dataLength, maxKey) {
    this.ERROR_MSG = 'None';
    this.storage = [];
    this.BUCKET_LIMIT = Math.pow(10, 5);
    this.maxKeyPrime = this._nextPrime(maxKey);
    this.hashRandomA = this._randomInteger(1, this.maxKeyPrime);
    this.hashRandomB = this._randomInteger(1, this.maxKeyPrime);
  }


  _isPrimeCheck(maxKey) {
    for(let i = 2;i <= Math.sqrt(maxKey);i++) {
      if(maxKey % i === 0) return false;
    }
    return true;
  }

  _nextPrime(num) {
    let isPrime = false;
    let currNum = num + 1;
    while(!isPrime) {
      if(this._isPrimeCheck(currNum)) {
        isPrime = true;
      } else {
        currNum++;
      }
    }
    return currNum;
  }

  _randomInteger(min = 10, max = 2000) {
    const rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }

  // спасибо за разъяснение, стало понятнее по теме универсального семейства
  // только теперь вопрос по реализации, в this.maxKeyPrime записывается простое число > самого большого входного ключа,
  // сложность определения простого числа возможна за O(sqrt n), нельзя ли в данном случае так же задать ключи с
  // так называемой killer последовательностю, состсоящую из больших чисел, которая может так же замедлить выполнение алгоритма
  getHash(h) {
    return ((this.hashRandomA * h + this.hashRandomB) % this.maxKeyPrime) % this.BUCKET_LIMIT
  }

  get({ key }) {
    const hash = this.getHash(key);
    if(!this.storage[hash]) return this.ERROR_MSG;

    const bucket = this.storage[hash];
    for (let idx = 0;idx <= bucket.length;idx++) {
      if(bucket[idx] && bucket[idx].key === key)
        return  bucket[idx].value;
    }
    return this.ERROR_MSG;
  }

  delete({ key }) {
    const hash = this.getHash(key);
    if(!this.storage[hash]) return this.ERROR_MSG;

    const bucket = this.storage[hash];
    for (let idx = 0;idx <= bucket.length;idx++) {
      if(bucket[idx] && bucket[idx].key === key) {
        const temp = bucket[idx].value;
        bucket[idx] = null;
        return temp;
      }
    }
    return this.ERROR_MSG;
  }

  put({ key, value }) {
    const hash = this.getHash(key);
    if(!this.storage[hash]) {
      const idx = 0;
      this.storage[hash] = [];
      this.storage[hash][idx] = { key, value };
    } else {
      const bucket = this.storage[hash];
      let idx = 0;
      while(bucket[idx] && bucket[idx].key !== key) {
        idx++;
      }
      bucket[idx] = { key, value };
    }
  }
}


/**
 * @param {Array.<Object>} dataList
 * @param {Object} dataList[0]
 * @param {String} dataList[0].method
 * @param {Object} dataList[0].params
 * @param {Number} dataList[0].params.key
 * @param {Number} dataList[0].params.value
 * @param {Number} dataLength
 * @param {Number} maxKey
 * */
const initFn = (dataList, dataLength, maxKey) => {
  const hTable = new HashTable(dataLength, maxKey);
  const res = [];
  dataList.forEach(({ method, params }) => {
    const temp = hTable[method](params);
    if(temp) {
      res.push(temp);
    }
  });
  return res;
};

ioInterface.on('close', () => {
  const res = initFn(dataList, dataLength, maxKey);
  process.stdout.write(`${res.join('\n')}`);
});