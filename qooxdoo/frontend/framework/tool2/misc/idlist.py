def toString(data):
    if data == None:
        return ""
    
    sortedList = _getSortedCopy(data)

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
