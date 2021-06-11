// #51823316
const fs = require('fs');
const readline = require('readline');

const config = { input: fs.createReadStream('input.txt') };

const ioInterface = readline.createInterface(config);

const bracketsSymbols = {
  START: '[',
  END: ']'
};

let lineNum = 0;
let sum = 0;
let inputArr = [];

// utils
const convertToNum = str => +str;


/*
-- ПРИНЦИП РАБОТЫ --
Алгоритм состоит из 2х этапов
- "распаковка" через рекурсию строк, где происходит поиск по строке, в случае если определяется открытая скобка (bracketsSymbols.START),
запускается повторно функция распаковки, происходит поиск закрытой строки и возврат значения между скобкам, с длинной строки, на котороую происходит смещение
вперед после обработки ответа рекурсии

- поиск префикса
при поиске наибольщего префикса, перед обработкой массив строк сортируется и затем проверяется первый и последний элементы списка, побуквенно сравнивая значения

-- ВРЕМЕННАЯ СЛОЖНОСТЬ --
- при распаковке нам необходимо перебрать каждую строку один раз, что занимает O(n*L) - n - количество строк, L - длины строк
- для поиска префикс функции мы сортируем массив распакованных слов, что имеет сложность O(n log n), после сортировки у нас
есть первая и самая "дальняя" от нее строка в конце списка, результатом их сравнения и будет являтся самый длинный общий префикс во
всем списке. Для сравнения происходит перебор наиболее короткого слова, и при обнаружении различия, выход из функции, следовательно сложность
равна O(L), где L - максимальная длина строки
- общая сложность алгоритма будет равна O(n*L)

-- ПРОСТРАНСТВЕННАЯ СЛОЖНОСТЬ --
- для работы алгоритма используется память только для хранения данных при распаковке, финальных и промежуточных в вызовах рекурсии, общая сложность алгоритма
O(n*L)
* */

/**
 * @param {String} str
 * */
function unPackStr(str) {
  let unpackedRes = '';
  let count = 0;
  while(count < str.length) {
    let letter = str[count];
    if(letter === bracketsSymbols.END) return [unpackedRes, count];
    if(letter === bracketsSymbols.START) {
      const [strToRepeat, stepCount] = unPackStr(str.substr(count + 1));
      let repeatCount = str[count - 1];
      count += stepCount + 1;
      unpackedRes += strToRepeat.repeat(repeatCount);
    }
    else if(!+letter){
      unpackedRes += str[count];
    }
    count += 1;
  }
  return unpackedRes;
}

ioInterface.on('line', line => {
  if(lineNum === 0) {
    sum = convertToNum(line);
  }
  if(lineNum > 0 && lineNum <= sum + 1) {
    inputArr.push(unPackStr(line));
  }
  lineNum++;
});

function getPrefix(list) {
  let count = 0;
  const firstItem = list[0];
  const lastItem = list[list.length - 1];
  const minStrSize = Math.min(firstItem.length, lastItem.length);
  while(lastItem[count] === firstItem[count] && count < minStrSize) {
    count += 1;
  }
  return firstItem.substr(0, count);
}

ioInterface.on('close', () => {
  const res = getPrefix(inputArr.sort());
  process.stdout.write(`${res}`);
});