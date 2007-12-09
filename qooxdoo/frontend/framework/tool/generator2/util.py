import zlib

def splitListToDict(data, divider=":"):
    result = {}
    for entry in data:
        splitted = entry.split(divider)
        result[splitted[0]] = splitted[1]

    return result


    
def getContentSize(content):
    # Convert to utf-8 first
    uni = unicode(content).encode("utf-8")

    # Calculate sizes
    origSize = len(uni) / 1024
    compressedSize = len(zlib.compress(uni, 9)) / 1024

    return "%sKB / %sKB" % (origSize, compressedSize)
        
            