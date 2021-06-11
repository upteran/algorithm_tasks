// #51383239

const fs = require('fs');
const readline = require('readline');

const config = { input: fs.createReadStream('input.txt') };

const ioInterface = readline.createInterface(config);

/*
-- ПРИНЦИП РАБОТЫ --
В основе реализации лежит алгоритм DFS и поиска цикла в графе
В условиях указано, путь считается не оптимальным, если из одной вершины в другую ведут 2 типа дорог, из чего следует,
если один из типов дорог "развернуть" в обратную сторону, и путь является не оптимальным, мы должны обнаружить цикл в графе

Для реализации
- соврешаем обход по всем не обработанным вершинам (checkDfsCycle)
- устанавливаем текущей вершине статус посещенной (status.visited), затем проверяем все смежные с ней вершины,
добавляя их в массив stack
- повторяем цикл для только что добавленных в stack вершин
- при нахождении вершины, у которой нет ребер, отмечаем ее как завершенную (status.done) и идем обратно по списку (stack) отмечая все вершины завершенными
- при обработке смежных вершин, и получении вершины, которая была уже посещена ранее (имеет status.visited), можем делать вывод что граф
имеет цикл и путь является не оптимальным

-- ВРЕМЕННАЯ СЛОЖНОСТЬ --
Для реализации необходимо проверить все ребра, каждой вершины, поэтому сложность равна O(V) + O(E)

-- ПРОСТРАНСТВЕННАЯ СЛОЖНОСТЬ --
Для хранения данных мы используем
- vertexMap спсиок смежных вершин (O(V) + O(E))
- спсиок цветов вершин (colors) O(V)
- stack спсиок обрабатываемых вершин O(V)

Пространственная сложность в худшем случае равна O(V) + O(E)
* */

let lineNum = 0;
let citySum = 0;

const vertexMap = [];
let colors = [];

// color statuses
const status = {
  notVisited: 0,
  visited: 1,
  done: 2
};

// input data handle utils
const addVertexEdges = (map, num, value) => {
  if(!map[num]) {
    map[num] = [];
  }
  map[num].push(value);
};

const createLineVertex = (line, num) => {
  line.split('').forEach((item, idx) => {
    const curr = +num + idx + 1; // start from 1 index
    if(item === 'B') {
      addVertexEdges(vertexMap, num, curr);
    } else {
      // revert edge
      addVertexEdges(vertexMap, curr, num);
    }
  });
};

const strToNum = str => +str;

// dfs algorithm
function checkDfsCycle(startVertex) {
  const stack = [];
  stack.push(startVertex);

  while(stack.length) {
    // get vertex
    const curr = stack.pop();
    if(colors[curr - 1] === status.notVisited && vertexMap[curr]) {
      colors[curr - 1] = status.visited;
      stack.push(curr);
      if(vertexMap[curr].length) {
        const currVertexList = vertexMap[curr];
        for (let vertex of currVertexList) {
          if(colors[vertex - 1] === status.notVisited) {
            stack.push(vertex);
          }
          if(colors[vertex - 1] === status.visited) {
            return true;
          }
        }
      }
    } else {
      colors[curr - 1] = status.done;
    }
  }
  return false;
}

function checkGraphIsOptimal() {
  for(let i = 1;i < vertexMap.length;i++) {
    if(colors[i] === status.notVisited && checkDfsCycle(i)) {
      return false;
    }
  }
  return true;
}

// start read
ioInterface.on('line', line => {
  if(lineNum === 0) {
    citySum = strToNum(line);
    colors = new Array(citySum).fill(status.notVisited);
  }
  if(lineNum !== 0 && citySum - 1 >= lineNum) {
    createLineVertex(line, lineNum);
  }
  lineNum++;
});

ioInterface.on('close', () => {
  const res = checkGraphIsOptimal();
  process.stdout.write(res ? 'YES' : 'NO');
});