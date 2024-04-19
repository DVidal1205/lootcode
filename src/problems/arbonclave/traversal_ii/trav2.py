class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

class BinarySearchTree:
    def __init__(self):
        self.root = None

    def insert(self, value):
        if self.root is None:
            self.root = Node(value)
        else:
            self._insert_recursive(self.root, value)

    def _insert_recursive(self, node, value):
        if value < node.value:
            if node.left is None:
                node.left = Node(value)
            else:
                self._insert_recursive(node.left, value)
        else:
            if node.right is None:
                node.right = Node(value)
            else:
                self._insert_recursive(node.right, value)

    def preorder_traversal(self):
        traversal = []
        self._preorder_recursive(self.root, traversal)
        return traversal

    def _preorder_recursive(self, node, traversal):
        if node is not None:
            traversal.append(node.value)
            self._preorder_recursive(node.left, traversal)
            self._preorder_recursive(node.right, traversal)

    def inorder_traversal(self):
        traversal = []
        self._inorder_recursive(self.root, traversal)
        return traversal

    def _inorder_recursive(self, node, traversal):
        if node is not None:
            self._inorder_recursive(node.left, traversal)
            traversal.append(node.value)
            self._inorder_recursive(node.right, traversal)

    def postorder_traversal(self):
        traversal = []
        self._postorder_recursive(self.root, traversal)
        return traversal

    def _postorder_recursive(self, node, traversal):
        if node is not None:
            self._postorder_recursive(node.left, traversal)
            self._postorder_recursive(node.right, traversal)
            traversal.append(node.value)

    def breadth_first_traversal(self):
        traversal = []
        queue = [self.root]
        while len(queue) > 0:
            node = queue.pop(0)
            if node is not None:
                traversal.append(node.value)
                queue.append(node.left)
                queue.append(node.right)
        return traversal

# Read in an array
n = int(input())
array = list(map(int, input().split()))

# Insert each number into the BST
bst = BinarySearchTree()
for num in array:
    bst.insert(num)

# Call the three traversal methods
order = bst.breadth_first_traversal()
print(*order, sep=" ")