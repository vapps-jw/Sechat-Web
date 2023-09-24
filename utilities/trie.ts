class TrieNode {
  data: string;
  root: TrieNode;
  isEnd: boolean;
  children: Map<string, TrieNode>;

  //Constructor, Time O(1), Space O(1)
  constructor(c: string) {
    this.data = c;
    this.isEnd = false;
    this.children = new Map(); //map
  }
}

class Trie {
  //Constructor, Time O(1), Space O(1)
  root: TrieNode;

  constructor() {
    this.root = new TrieNode("");
  }

  //inserts a word into the trie. Time O(s), Space O(s), s is word length
  insert(word: string) {
    var node = this.root;
    for (let ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode(ch));
      node = node.children.get(ch);
    }
    node.isEnd = true;
  }

  //find all word with given prefix, call recursion function
  //Time O(n), Space O(n), n is number of nodes involved (include prefix and branches)
  autocomplete(word: string) {
    var res = new Array();
    var node = this.root;
    for (let ch of word) {
      if (node.children.has(ch)) node = node.children.get(ch);
      else return res;
    }
    this.checkChildren(node, res, word.substring(0, word.length - 1));
    return res;
  }

  //recursive function called by autocomplete
  //Time O(n), Space O(n), n is number of nodes in branches
  checkChildren(node: TrieNode, res: Array<string>, prefix: string) {
    if (node.isEnd) res.push(prefix + node.data);
    for (let c of node.children.keys())
      this.checkChildren(node.children.get(c), res, prefix + node.data);
  }
}
