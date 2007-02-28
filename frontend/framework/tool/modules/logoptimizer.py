import re
import tree

levels = ["all", "debug", "info", "warn", "error", "fatal", "off"]
cmds = ["debug", "info", "warn", "error", "fatal"]


def search(node, level="all", verbose=False):
    if level == "all":
        return

    if not level in levels:
        print "    - Error: \"%s\" is not a supported log level" % level
        sys.exit(1)

    if level == "off":
        remove = cmds
    else:
        remove = cmds[:cmds.index(level)]

    if verbose:
        print "      - Removing log statements: %s" % ", ".join(remove)

    cleanup(node, remove, verbose)



def cleanup(node, remove, verbose):
    if node.type == "call":
        oper = node.getChild("operand")

        if oper.hasChild("variable"):
            last = oper.getChild("variable").getLastChild(True, True)

            if last.type == "identifier":
                name = last.get("name")

                if name in remove:
                    if verbose:
                        print "        - Removing statement \"%s\" in line %s" % (name, node.get("line"))

                    target = node
                    while target.parent.type == "right" and target.parent.parent.type == "accessor":
                        if verbose:
                            print "          - Accessor based complex statement..."

                        target = target.parent.parent

                    if target.parent.type in ["block", "statement"]:
                        target.parent.removeChild(target)
                        return

                    elif verbose:
                        print "          - Invalid parent node. Could not remove element securely!"

    if node.hasChildren():
        for child in node.children[:]:
            cleanup(child, remove, verbose)
