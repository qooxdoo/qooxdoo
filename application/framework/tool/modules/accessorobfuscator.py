import tree, treeutil

def process(node, verbose=False):
    return process_loop(node, verbose)

def process_loop(node, verbose):
    if node.type == "variable" and node.hasChildren():
        repl = ""
        first = True

        for child in node.children:
            if child.type == "identifier":
                if first:
                  repl = child.get("name")
                  first = False
                else:
                  repl += '["' + child.get("name") + '"]'

            else:
              return

        replNode = treeutil.compileString(repl)
        node.parent.replaceChild(node, replNode)

        return

    if node.hasChildren():
        for child in node.children:
            process_loop(child, verbose)
