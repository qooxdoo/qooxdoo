import optparse

from modules import tokenizer
from modules import treegenerator
from modules import variableoptimizer
from modules import compiler


def optimizeJavaScript(code):
    restree = treegenerator.createSyntaxTree(tokenizer.parseStream(code))
    variableoptimizer.search(restree, [], 0, 0, "$")

    # Emulate options
    parser = optparse.OptionParser()
    parser.add_option("--p1", action="store_true", dest="prettyPrint", default=False)
    parser.add_option("--p2", action="store_true", dest="prettypIndentString", default="  ")
    parser.add_option("--p3", action="store_true", dest="prettypCommentsInlinePadding", default="  ")
    parser.add_option("--p4", action="store_true", dest="prettypCommentsTrailingCommentCols", default="")

    (options, args) = parser.parse_args([])

    return compiler.compile(restree, options)
