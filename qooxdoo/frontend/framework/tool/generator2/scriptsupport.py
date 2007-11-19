import optparse

from modules import tokenizer
from modules import treegenerator
from modules import variableoptimizer
from modules import compiler


def generateScriptIncluder(files, format=False, callback=""):
    code = []

    code.append('var files=["%s"];' % '","'.join(files))
    code.append('var head = document.getElementsByTagName("head")[0];')

    code.append('function load(url, i, callback){')
    code.append('var elem = document.createElement("script");')
    code.append('elem.charset = "utf-8";')
    code.append('elem.src = url;')
    code.append('elem.onload = elem.onreadystatechange = function(){')
    code.append('if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete"){')
    code.append('elem.onload = elem.onreadystatechange = undefined;next();}')
    code.append('};head.appendChild(elem);}')

    code.append('var pos=0;')
    code.append('function next() {')
    code.append('if(files.length==pos){')
    code.append(callback)
    code.append('return;')
    code.append('}')
    code.append('load(files[pos++]);}')

    code.append('next();')

    return blocksToCode(code, format)


def generateHttpIncluder(files, format=False, callback=""):
    code = []

    code.append('var arr=["%s"]' % '","'.join(files))

    code.append('function empty(){}')
    code.append('function load(url, i, callback){')
    code.append('var xml = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();')
    code.append('xml.open("GET", url, true);')
    code.append('xml.onreadystatechange=function(){')
    code.append('if(xml.readyState==4){')
    code.append('if(!xml.status && location.protocol == "file:" || (xml.status >= 200 && xml.status < 300) || xml.status == 304){')
    code.append('callback(i, xml.responseText);')
    code.append('}else{')
    code.append('throw new Error("Could not load URL: " + url);')
    code.append('}')
    code.append('xml.onreadystatechange=empty;')
    code.append('}')
    code.append('};')
    code.append('xml.send();')
    code.append('}')

    code.append('var content=[];')
    code.append('var count=0;')
    code.append('var length;')

    code.append('function callback(i, response){')
    code.append('content[i]=response;')
    code.append('count++;')
    code.append('if(count==length){')
    code.append('eval(content.join(""));')
    code.append(callback)
    code.append('}')
    code.append('}')

    code.append('function include(arr){')
    code.append('length=arr.length;')
    code.append('for (var i=0; i<length; i++){')
    code.append('load(arr[i], i, callback);')
    code.append('}')
    code.append('}')

    code.append('include(arr);')

    return blocksToCode(code, format)


def protectJavaScript(code):
    return "(function(){" + code + "})();"


def blocksToCode(code, format=False):
    if format:
        result = "\n".join(code)
    else:
        result = "".join(code)

    result = protectJavaScript(result)

    if not format:
        result = optimizeJavaScript(result)

    return result


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
