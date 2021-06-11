// ID 47625566

const fs = require('fs');
const readline = require('readline');

const config = { input: fs.createReadStream('input.txt') };

const ioInterface = readline.createInterface(config);

const searchList = [];
const docsList = [];
let docsLength;
let searchLength;
let lineNum = 0;

// ====== input utils fn
const strToNum = str => +str;
const convertLine = (line) => line.split(' ');

const LENGTH_COUNT_LINE = 1;

ioInterface.on('line', line => {
  if(lineNum === 0) {
    docsLength = strToNum(line);
  } else {
    // handle docs data
    const docsLines = docsLength + LENGTH_COUNT_LINE;
    if(lineNum < docsLines) docsList.push(convertLine(line));
    // handle search list data
    if(lineNum === docsLines)
      searchLength = strToNum(line);
    if(lineNum > docsLines && lineNum <= docsLength + searchLength + LENGTH_COUNT_LINE * 2) {
      searchList.push(new Set(convertLine(line)));
    }
  }
  lineNum++;
});


/*
-- ПРИНЦИП РАБОТЫ --
* В основе используется хеш-таблица для более быстрого доступа к необходимым данным

Первым этапом (prepareWordsRelevantMap) обрабатывается список документов и создается список, где ключом является слово, а значением другой
список, где фиксируются по id документа релевантность данного слова в текущем документе

Вторым этапом перебираются входные поисковые запросы, из которых формируются списки ключевых слов:
- `searchList.push(new Set(convertLine(line)));`
которые в дальнейшем сверяются с созданным списком слов, и суммируется релевантность слова для конкретного поискового запроса и
записывается в виде массива, где индексом является id документа, а значением объект, в котором хранится этот же id и значение
релевантности

Последним этапом полученный массив сортируется в соответствии с условиями и результат уходит на вывод

-- ВРЕМЕННАЯ СЛОЖНОСТЬ --
Перебор всех слов из документов осуществляется за O(n) время
Время рассчета релевантности документов так де осуществляется за O(L) где L длина мапы с подсчитанной релевантностью документов
O(1) сложение релевантности и O(n) перебор слов из запроса, из чего можно сделать вывод что временная сложность алгоритма O(n)

-- ПРОСТРАНСТВЕННАЯ СЛОЖНОСТЬ --
Для реализации выделяется память на хранение списков слов документов и запросов O(n) + память для храенения мап слов и релевантности по
запросам, пространтсвенная сложность будет O(n)
* */

/** Fn count document word relevant
 * @param {Object} hashMap - words map [key]: value, where:
 * key === wordName, value === { [docIdx]: [relevantCount]}
 * @param {String} wordName
 * @param {Number} docIdx
 * */
const createOrIncreaseCount = (hashMap, wordName, docIdx) => {
  if(hashMap[wordName][docIdx]) {
    hashMap[wordName][docIdx] += 1;
  } else {
    hashMap[wordName][docIdx] = 1;
  }
};

/** Fn create document word relevant map
 * @param {Array.<Array>} docsList
 * */
const prepareWordsRelevantMap = (docsList) => {
  const wordsMap = {};
  docsList.forEach((docsItem, docIndex) => {
    const docIdx = docIndex + 1;
    for (let word of docsItem) {
      if(!wordsMap[word]) {
        wordsMap[word] = { [docIdx]: 1 };
      } else {
        createOrIncreaseCount(wordsMap, word, docIdx);
      }
    }
  });
  return wordsMap;
};

/**
 * @param {Array.<Object>} relevantList - array of word relevant list where
 * relevantList[docIdx]: { id: [docIdx], relevant: [count] }
 * @param {String} currWordKey
 * */
const setDocsRelevantByWord = (relevantList, currWordKey) => {
  Object.keys(currWordKey).forEach(key => {
    if(relevantList[key]) {
      relevantList[key].relevant += currWordKey[key];
    } else {
      relevantList[key] = { id: strToNum(key), relevant: currWordKey[key] }
    }
  });
};

/**
 * @param {Array.<Array>} searchList
 * @param {Object} wordsMap
 * */
const getRelevantBySearchLines = (searchList, wordsMap) => {
  let res = [];
  searchList.forEach((line) => {
    const relevantList = [];
    line.forEach((searchWord) => {
      if(wordsMap[searchWord]) {
        const currWordKey = wordsMap[searchWord];
        setDocsRelevantByWord(relevantList, currWordKey);
      }
    });
    res.push(sortMap(relevantList).join(' '));
  });
  return res;
};

/**
 * @param {Object} left
 * @param {Number} left.relevant
 * @param {Number} left.id
 *
 * @param {Object} right
 * @param {Number} right.relevant
 * @param {Number} right.id
 * */
const comparator = (left, right) => {
  if (left.relevant < right.relevant) {
    return 1;
  }
  if (left.relevant > right.relevant) {
    return -1;
  }
  if (left.id > right.id) {
    return 1;
  }
  return -1;
};

/**
 * @param {Array.<Object>} list
 * */
const sortMap = (list) => list.sort(comparator).slice(0, 5).map((item) => item.id)

/**
 * @param {Array.<Array>} docsList
 * @param {Array.<Array>} searchList
 * */
const initFn = (searchList, docsList) => {
  const preparedWordsMap = prepareWordsRelevantMap(docsList);
  return getRelevantBySearchLines(searchList, preparedWordsMap);
};

ioInterface.on('close', () => {
  const res = initFn(searchList, docsList);
  process.stdout.write(`${res.join('\n')}`);
});