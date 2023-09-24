export class TrieNode {
  data: string;
  root: TrieNode;
  isEnd: boolean;
  children: Map<string, TrieNode>;

  constructor(c: string) {
    this.data = c;
    this.isEnd = false;
    this.children = new Map(); //map
  }
}

export class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode("");
  }

  insert(word: string) {
    var node = this.root;
    for (let ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode(ch));
      node = node.children.get(ch);
    }
    node.isEnd = true;
  }

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

  checkChildren(node: TrieNode, res: Array<string>, prefix: string) {
    if (node.isEnd) res.push(prefix + node.data);
    for (let c of node.children.keys())
      this.checkChildren(node.children.get(c), res, prefix + node.data);
  }
}
