// #50701220

/*
-- ПРИНЦИП РАБОТЫ --
Принцип работы алгоритма разделяется на несколько вариаций в зависимости от узла, который требуется удалить

Запускается поиск по дереву необходимого узла
- В случае если удаляемы узел является листом и не имеет детей, узел удаляется, путем удаления у родителя связи с текущим узлом
- В случае если у есть левый ЛИБО правый ребенок, связь родителя устанавливается к нему
- В случае если есть оба ребенка, происходит поиск самого левого узла в правом поддереве, те узел < всех правых узлов и > всех левых узлов
и связки искомого узла с родителоями и детьми привязываются к данному узлу

-- ВРЕМЕННАЯ СЛОЖНОСТЬ --
Временная сложность алгоритма в худшем случае будет равна O(h) - где h === высота дерева

-- ПРОСТРАНСТВЕННАЯ СЛОЖНОСТЬ --
Для реализации алгоритма необходима память для хранения промежуточного значения при замене связей в дереве o(1);
* */

function getSmallestNode(node) {
  while(!node.left === null) {
    node = node.left;
  }
  return node;
}

function remove(node, key) {
  if(!node) return node;

  if(node.value === key) {
    if(!node.right && !node.left) return null;
    if(!node.right) return node.left;
    if(!node.left) return node.right;

    let temp = getSmallestNode(node.right);
    node.value = temp.value;

    node.right = remove(node.right, temp.value);
    return node;
  }

  if(key > node.value) {
    node.right = remove(node.right, key);
    return node;
  }
  if(key < node.value) {
    node.left = remove(node.left, key);
    return node;
  }
}