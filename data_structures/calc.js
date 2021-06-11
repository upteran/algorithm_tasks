// ID 46008254

const fs = require('fs');
const readline = require('readline');

const config = { input: fs.createReadStream('input.txt') };

const ioInterface = readline.createInterface(config);

let data;

/** convert string to arr
 * @param {String} line - input line
 * @returns {Array}
 * */
const convertLine = (line) => line.split(' ');

ioInterface.on('line', line => {
  data = convertLine(line);
});

/*
-- ПРИНЦИП РАБОТЫ --
В классе Calc создается стек с максимальным количеством элеменитов === количеству входных данных,
чтобы не расширять массив при добавлении результатов, создается массив с постоянной длинной и курсором для записи по индексу

Создается список с возможными операциями над входными параметрами (this.operationsActions)
Если на вход подается операнед, он записывается в стек по курсору
Если подается знак операции, используется соответсвующая функция для последнего входного параметра в стеке и следующего за ним элемента, итоговый результат
записывается в вершине стека, пока не останется последний

В случае если знаков операции нет, отдается последний элемент из списка с результатами

*
-- ВРЕМЕННАЯ СЛОЖНОСТЬ --
Перебор n элементов массива стоит O(n)

Запись в массив по индексу и применение операций стоит O(1)

В сумме стоимость будет равна O(n)

-- ПРОСТРАНСТВЕННАЯ СЛОЖНОСТЬ --
Стек в классе содержит массив определенной длины n

Хранение типов операций всегда постоянно O(1)

Можно сделать вывод что потребляемая память O(n) зависит от количества входных данных n
* */

// список возможных операций
const actions = {
  '-': (a, b) => a - b,
  '+': (a, b) => a + b,
  '/': (a, b) => Math.floor(a / b),
  '*': (a, b) => a * b
};

class Calc {
  constructor(data) {
    this.stack = data;
    this.tempStack = new Array(data.length);
    this.nextCount = 0;
    this.operationsActions = actions;
  }


  /**
   * Обработка пустой строки
   * @param {String} num
   * @returns {Number|String}
   * */
  _convertToNum (num) {
    if(num === '') return '';
    return +num;
  };

  checkInputValue() {
    this.stack.forEach(item => {
      if(!this.operationsActions[item]) {
        this.tempStack[this.nextCount] = this._convertToNum(item);
        this.nextCount += 1;
      } else {
        this.nextCount -= 1;
        const prevIndex = this.nextCount - 1;
        this.tempStack[prevIndex] = this.operationsActions[item](this.tempStack[prevIndex], this.tempStack[this.nextCount]);
      }
    });
    return this.nextCount === this.stack.length ? this.getLastElement() : this.tempStack[0];
  }

  getLastElement() {
    return this.tempStack[this.tempStack.length - 1]
  }
}

const finalFn = (data) => {
  const calc = new Calc(data);
  return  calc.checkInputValue();
};

ioInterface.on('close', () => {
  const res = finalFn(data);
  process.stdout.write(`${res}`);
});