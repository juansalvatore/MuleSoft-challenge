var treeify = require('treeify');

process.stdin.resume();
process.stdin.setEncoding('ascii');
var input = '';
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {

  // now we can read/parse input
  const commands = input.split('\n').filter(command => command !== '');
  var tree = new Tree('root');
  const cmd = new commandProcessor(tree);

  // iterate over each command
  commands.forEach(command => {
   
    // "quit" the application terminates
    if (command === 'quit') return;

    // de-structure commandName and commandArgument
    let [commandName, commandArgument] = command.split(/\s+/);

    // call each command's respective function
    if (['pwd', 'ls', 'mkdir', 'cd', 'touch','tree'].indexOf(commandName) !== -1) {
      let res = cmd[commandName](commandArgument);
      res ? console.log(res) : null;
    }
    
  });
});

class commandProcessor {
  constructor(tree) {
    this.directoryPath = '/root';
    this.rootDirectory = tree;
    this.currentDirectory = tree._root;
  }

  pwd() {
    return this.directoryPath;
  }

  tree() {
    console.log(treeify.asTree(this.rootDirectory, true));
  }

  ls(recursive) {
    if(!this.currentDirectory) return console.log('')
    if(recursive) {
      this.currentDirectory.traverseBF(function(node) {
        if(node.data != this.currentDirectory.data){
          console.log(node.data)
        }
      }.bind(this))
    } else {
      this.currentDirectory.children.forEach(child => {
        console.log(child.data)
      })
    }
  }

  cd(dirName) {
    
    // going back one directory
    if (dirName === '..' && this.directoryPath !== '/root') {
      this.directoryPath = this.directoryPath
        .split('/')
        .slice(0, -1)
        .join('/');
      this.currentDirectory = this.currentDirectory.parent
      return;
    }

    let parent = null
    
    // Look for a specific directory and console log
    this.rootDirectory.contains(function(node) {
      if (node.data === dirName && !node.file) {
        parent = node;
      }
    }, this.rootDirectory.traverseBF);
    this.currentDirectory = parent
    
    // going into one directory
    if (parent) {
      this.directoryPath += `/${dirName}`;
    } else {
      return 'Directory not found';
    }
  }

  mkdir(dirName) {
    var parent = this.currentDirectory.data;
    this.rootDirectory.add(
      dirName,
      parent,
      this.rootDirectory.traverseBF
    );
  }

  touch(fileName) {
    if (fileName.length > 100) return 'Invalid File or Folder Name';

    // create file
    var parent = this.currentDirectory.data;
    this.rootDirectory.add(
      fileName,
      parent,
      this.rootDirectory.traverseBF,
      true // sets file to true
    );
  }
}

function Node(data) {
  this.data = data;
  this.parent = null;
  this.file = false
  this.children = [];
}

function Tree(data) {
  var node = new Node(data);
  this._root = node;
}

function Queue() {
  this.dataStore = [];
  this.enqueue = function enqueue(element) {
    this.dataStore.push(element);
  };
  this.dequeue = function dequeue() {
    return this.dataStore.shift();
  };
  this.front = function front() {
    return this.dataStore[0];
  };
  this.back = function back() {
    return this.dataStore[this.dataStore.length - 1];
  };
}

Tree.prototype.traverseBF = function(callback) {
  var queue = new Queue();

  queue.enqueue(this._root);

  currentNode = queue.dequeue();

  while (currentNode) {
    for (var i = 0, length = currentNode.children.length; i < length; i++) {
      queue.enqueue(currentNode.children[i]);
    }

    callback(currentNode);
    currentNode = queue.dequeue();
  }
};

Node.prototype.traverseBF = function(callback) {
  var queue = new Queue();
  queue.enqueue(this);

  currentNode = queue.dequeue();

  while (currentNode) {
    for (var i = 0, length = currentNode.children.length; i < length; i++) {
      queue.enqueue(currentNode.children[i]);
    }

    callback(currentNode);
    currentNode = queue.dequeue();
  }
};

Tree.prototype.contains = function(callback, traversal) {
  traversal.call(this, callback);
};

Tree.prototype.add = function(data, toData, traversal, file = false) {
  var child = new Node(data),
    parent = null,
    callback = function(node) {
      if (node.data === toData) {
        parent = node;
      }
    };

  this.contains(callback, traversal);

  if (parent) {
    parent.children.push(child);
    child.parent = parent;
    child.file = file
  } else {
    throw new Error('Cannot add node to a non-existent parent.');
  }
};

// tree.add('test', 'root', tree.traverseBF);

// console.log(treeify.asTree(tree._root, true));

// Look for a specific directory and console log
// tree.contains(function(node) {
//   if (node.data === 'test2-a') {
//     console.log(node);
//   }
// }, tree.traverseBF);
