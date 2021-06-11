// ID 46007084

const fs = require('fs');
const readline = require('readline');

const config = { input: fs.createReadStream('input.txt') };

const ioInterface = readline.createInterface(config);

let data = [];
let maxSize = 0;
let lineNum = 0;
let maxCommands;

/** convert string to arr
 * @param {String} line - input line
 * @returns {Array}
 * */
const convertLine = (line) => line.split(' ');

/** convert string to number
 * @param {String} num
 * @returns {Number}
 * */
const getNumFromString = (num) => +num;

ioInterface.on('line', line => {
  if (lineNum > 1) {
    data.push(convertLine(line));
  }
  if (lineNum === 1) {
    maxSize = getNumFromString(line);
  }
  if (lineNum === 0) {
    maxCommands = getNumFromString(line);
  }
  lineNum += 1;
});

/*
-- ПРИНЦИП РАБОТЫ --
* За основу реализации дека взял очередь на кольцевом буфере
*
* Определены 2 курсора: head - для опредления позиции в начале стека и tail для определния конца стека
*
* При добавлении элемента в начало стека (pop_front), head смещается на еденицу вправо, результат добавляется в this.queue
* При добавленмии элемента в конец списка (pop_back), tail смещается на еденицу влево, результат записывается в this.queue
* Если массив с результатами заполнен, в ответ возвращается ошибка
*
* При удалении из начала и конца массива (pop_front/pop_back), head и tail смещаются в обратном направлении
*
-- ВРЕМЕННАЯ СЛОЖНОСТЬ --
Добавление в начало и конец списка стоит O(1) в худшем случае, потому что добавление по индексу массива стоит O(1)

-- ПРОСТРАНСТВЕННАЯ СЛОЖНОСТЬ --
При инициализации класса создается массив с результатами команд и массив с максимальной возможной длинной, для хранения чисел,
Число элементов массивов определяется из условий и остается всегда постоянным (n1 - количество команд, n2 - максимальный размер стека);
Стек, содержащий k элементов, занимает O(k) памяти

Дек содержащий 2 массива будет потреблять O(n1) + O(n2) = O(n) памяти
* */

class Deque {
  constructor(data, maxSize, maxCommands) {
    this.data = data;
    this.queue = new Array(maxSize);
    this.res = new Array(maxCommands);
    this.resCount = 0;
    this.maxSize = maxSize;
    this.sizeCount = 0;
    this.tail = 1;
    this.head = 0;
  }

  run() {
    this.data.forEach((command) => {
      const actionRes = this[command[0]](command[1]);
      if(actionRes !== undefined && actionRes !== null) {
        this.res[this.resCount] = actionRes;
        this.resCount++;
      }
    });
    return this.res;
  }

  /**
   * @param {String} type - тип смещаемого курсора
   * @param {String} dir - направление смещения курсора
   * @returns {Number|String} - возвращает строку 'error', если стек пуст,
   * в противном случае возвращает результат операции
   * */
  _pop_action(type, dir) {
    if(!this.sizeCount) return 'error';
    this.sizeCount--;
    let res = this.queue[this[type]];
    this.queue[this[type]] = 'None';
    this._direction_step(type, dir);
    return res;
  }

  /**
   * @param {Number} item - число, поступающее на вход
   * @param {String} type - тип смещаемого курсора
   * @param {String} dir - направление смещения курсора
   * @returns {String} - возвращает строку 'error', если стек переполнен
   * */
  _push_action(item, type, dir) {
    if(this.sizeCount === this.maxSize) return 'error';
    if(this.check_num(item)) {
      this._direction_step(type, dir);
      this.sizeCount += 1;
      this.queue[this[type]] = item;
    }
  }

  /**
   * @param {String} type - тип смещаемого курсора
   * @param {String} dir - направление смещения курсора
   * */
  _direction_step(type, dir) {
    if(dir === 'forward') {
      this[type] = (this[type] + 1) % this.maxSize;
    } else {
      this[type] = (this[type] || this.maxSize) - 1;
    }
  }

  pop_front() {
    return this._pop_action('head', 'back');
  }

  pop_back() {
    return this._pop_action('tail', 'forward');
  }

  push_back(item) {
    return this._push_action(item, 'tail', 'back');
  }

  push_front(item) {
    return this._push_action(item, 'head', 'forward');
  }

  check_num(item) {
    if(item !== null && !Number.isNaN(+item) && item !== undefined){
      return true;
    }
    return null
  }
}

const runDequeFn = (data, maxSize, maxCommands) => {
  const stack = new Deque(data, maxSize, maxCommands);
  return stack.run();
};

ioInterface.on('close', () => {
  const res = runDequeFn(data, maxSize, maxCommands);
  process.stdout.write(res.join('\n'));
});