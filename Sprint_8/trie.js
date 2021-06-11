// #51823394

const fs = require('fs');
const readline = require('readline');

const config = { input: fs.createReadStream('input.txt') };

const ioInterface = readline.createInterface(config);

let lineNum = 0;
let searchStr = '';
let size = 0;
let words = [];

const convertToNum = str => +str;

ioInterface.on('line', line => {
  if(lineNum === 0) {
    searchStr = line;
  }
  if(lineNum === 1) {
    size = convertToNum(line);
  }
  if(lineNum > 1 && lineNum <= size + 1) {
    words.push(line);
  }
  lineNum++;
});

/*
ПРИНЦИП РАБОТЫ

В основне алгоритма лежит построение бора со списком слов, вхождение которых затем проверяется во входной строке

Построение дерева
- в цикле перебираются слова, и каждое побуквенно в отдельности
- если в дереве уже есть узел с начальной буквой, осуществляются переходы по данному узлу
- если буква была не найдена изначально, либо при переходе по узлам, создается новый узел
- последняя буква слова помечается как терминальная, для дальнейшего определения окончания слова в узлах (isTerminalNode)

Разбиение входящей строки по словам
- создается массив по количеству букв в слове, для хранения отметок, где в строке заканчиваеются слова из бора (tempSteps)
- записываем базовый случай для старта цикла
- создаются 2 цикла для перебора букв в слове, 1ый осуществляет перебор только c индексов, где хранятся отметки о найденых словах, 2ой цикл перебирает буквы по порядку,
утсанавливая отметки, когда обнаружено окончание слова
- результат возможности разбиения строки берем из последнего индекса tempSteps

-- ВРЕМЕННАЯ СЛОЖНОСТЬ --
При работе алгоритма
- создание бора, временная сложность которого O(L), где L суммарная длина слов
- поиск по самому бору будет занимать O(n*M), где n - длина текста, а M = max_m - длина самого длинного шаблона
Общая временная сложность алгоритма будет: O(n*M)

-- ПРОСТРАНСТВЕННАЯ СЛОЖНОСТЬ --
Для выполнения алгоритма нам необходимо хранить данные буквенных значений слов, O(n + E), где n количество слов, а E количетсво букв
Хранить массив с окончанием слов при поиске, O(n), где n количество букв в строке поиска
Общая пространственная сложность будет равна O(n + E)
* */

class TrieNode {
  constructor() {
    this.children = {};
    this.isTerminalNode = false
  }

  get isWordEnd() {
    return this.isTerminalNode;
  }

  set terminalUpdate(value) {
    this.isTerminalNode = value;
  }

  addChildren(key) {
    if(!this.children[key]) {
      this.children[key] = new TrieNode()
    }
  }

  getChild(key) {
    return this.children[key]
  }
}

/**
 * @param {Object} head - trie head node
 * @param {Array<string>} data - trie head node
 * @return {Object} updated trie
 * */
function createTrie(head, data) {
  let currNode = head;
  data.forEach(str => {
    for (let i = 0;i < str.length;i++) {
      const letter = str[i];
      currNode.addChildren(letter);
      currNode = currNode.getChild(letter)
    }
    currNode.terminalUpdate = true;
    currNode = head;
  });
  return head;
}

/**
 * @param {String} searchStr
 * @param {Array<string>} words
 * @param {Object} trie
 * @return {Boolean}
 * */
function checkWordsConsist(searchStr, words, trie) {
  let tempSteps = new Array(searchStr.length).fill(false);
  tempSteps[0] = 1;
  for (let i = 0;i < searchStr.length;i++) {
    if(!tempSteps) {
      continue;
    }
    if(tempSteps[i]) {
      let next = trie;
      for (let j = i;j < searchStr.length;j++) {
        if(!next) break;
        let letter = searchStr[j];
        next = next.getChild(letter);
        if(next && next.isWordEnd) {
          tempSteps[j + 1] = 1;
        }
      }
    }
  }
  return !!tempSteps[searchStr.length];
}

ioInterface.on('close', () => {
  const headTrie = new TrieNode();
  const createdTrie = createTrie(headTrie, words);
  const res = checkWordsConsist(searchStr, words, createdTrie);
  process.stdout.write(`${res ? 'YES' : 'NO'}`);
});