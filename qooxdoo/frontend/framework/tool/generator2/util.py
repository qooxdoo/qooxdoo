################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2008 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#
################################################################################

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
    

def computeCombinations(variants):
    # convert dict to list
    variantPossibilities = []
    for variantId in variants:
        innerList = []
        for variantValue in variants[variantId]:
            innerList.append({"id" : variantId, "value" : variantValue})
        variantPossibilities.append(innerList)

    combinations = _findCombinations(variantPossibilities)
    result = []

    # convert to dict[]
    for pos, entry in enumerate(combinations):
        result.append({})
        for item in entry:
            result[pos][item["id"]] = item["value"]

    return result


def generateId(variants):
    if variants == None:
        return ""
    
    sortedList = _getSortedCopy(variants)

    sortedString = []
    for entry in sortedList:
        sortedString.append("%s_%s" % (entry["id"], entry["value"]))

    return "|".join(sortedString)


def _findCombinations(a):
    result = [[]]

    for x in a:
        t = []
        for y in x:
            for i in result:
                t.append(i+[y])
        result = t

    return result


def _getSortedCopy(entries):
    # Convert dict to array
    result = []
    for key in entries:
        result.append({ "id" : key, "value" : entries[key] })

    def _compare(x, y):
        if x["id"] > y["id"]:
            return 1

        if x["id"] < y["id"]:
            return -1

        return 0

    result.sort(_compare)

    return result
