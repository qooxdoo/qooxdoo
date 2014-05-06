addSample("q.getDocument", {
  html: ['<ul>',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '</ul>'],
  javascript: function() {
    var doc = q.getDocument(q("li:first")[0]);
    q("ul").append("<li>"+doc.title+"</li>");
  },
  executable: true
});

addSample("q.getNodeName", {
  html: ['<ul>',
         '  <li id="info">item 1</li>',
         '  <li>item 2</li>',
         '</ul>'],
  javascript: function() {
    var nodeName = q.getNodeName(q("#info")[0]);
    // (nodeName === "li")
  },
  executable: true
});

addSample("q.getNodeText", {
  html: ['<ul>',
         '  <li id="less">text 1</li>',
         '  <li id="more">text 2 <span>span</span> text 2</li>',
         '</ul>'],
  javascript: function() {
    var nodeTextLess = q.getNodeText(q("#less")[0]);
    // (nodeTextLess === "text 1")
    var nodeTextMore = q.getNodeText(q("#more")[0]);
    // (nodeTextMore === "text 2 span text 2")
  },
  executable: true
});

addSample("q.getWindow", {
  html: ['<ul>',
         '  <li id="info">item 1</li>',
         '  <li>item 2</li>',
         '</ul>'],
  javascript: function() {
    var wndw = q.getWindow(q("#info")[0]);
    q("ul").append("<li>"+wndw.location.href+"</li>");
  },
  executable: true
});

addSample("q.isBlockNode", {
  html: ['<ul>',
         '  <li id="info">item 1</li>',
         '  <li><span id="desc">item 2</span></li>',
         '</ul>'],
  javascript: function() {
    var isBlockNode1 = q.isBlockNode(q("#info")[0]);
    // (isBlockNode1 === true)
    var isBlockNode2 = q.isBlockNode(q("#desc")[0]);
    // (isBlockNode2 === false)

    // note:
    // (q.isBlockNode({}) === false)
    // (q.isBlockNode(null) === false)
  },
  executable: true
});

addSample("q.isDocument", {
  html: ['<ul>',
         '  <li id="info">item 1</li>',
         '  <li>item 2</li>',
         '</ul>'],
  javascript: function() {
    var doc = q.getDocument(q("#info")[0]);
    var isDoc = q.isDocument(doc);
    // (isDoc === true)

    // note:
    // (q.isDocument({}) === false);
    // (q.isDocument(null) === false;
  },
  executable: true
});

addSample("q.isElement", {
  html: ['<ul>',
         '  <li id="info">item 1</li>',
         '  <li><span id="desc">item 2</span></li>',
         '</ul>'],
  javascript: function() {
    var isElement1 = q.isElement(q("#info")[0]);
    // (isElement1 === true)
    var isElement2 = q.isElement(q("#desc")[0]);
    // (isElement2 === true)

    // note:
    // (q.isElement({}) === false)
    // (q.isElement(null) === false)
  },
  executable: true
});

addSample("q.isNode", {
  html: ['<ul>',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '</ul>'],
  javascript: function() {
    var isNode1 = q.isNode(q("li:first"));
    // (isNode1 === true)

    // note:
    // (q.isNode({}) === false)
    // (q.isNode(null) === false)
  },
  executable: true
});

addSample("q.isNodeName", {
  html: ['<ul>',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '</ul>'],
  javascript: function() {
    var isNodeName1 = q.isNodeName(q("li:first"), "li");
    // (isNodeName1 === true)

    // note:
    // (q.isNodeName({}, "li") === false)
    // (q.isNodeName(null, "li") === false)
  },
  executable: true
});

addSample("q.isTextNode", {
  html: ['<ul>',
         '  <li id="less">text</li>',
         '  <li id="more">text <span>span</span> text</li>',
         '</ul>'],
  javascript: function() {
    var lessContents = q("#less").getContents()[0];
    var isTextNode1 = q.isTextNode(lessContents);
    // (isTextNode1 === true)

    var moreContents = q("#more").getChildren().getContents()[0];
    var isTextNode2 = q.isTextNode(moreContents);
    // (isTextNode2 === true)

    // note:
    // (q.isTextNode("") === false)
    // (q.isTextNode(null) === false)
  },
  executable: true
});

addSample("q.isWindow", {
  html: ['<ul>',
         '  <li id="info">item 1</li>',
         '  <li>item 2</li>',
         '</ul>'],
  javascript: function() {
    var isWindow = q.isWindow(q.getWindow(q("#info")[0]));
    // (isWindow === true)

    // note:
    // (q.isWindow({}) === false)
    // (q.isWindow(null) === false)
  },
  executable: true
});

addSample(".add", {
  html: ['<ul>',
         '  <li>item 0</li>',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '  <li>item 3</li>',
         '</ul>'],
  css: [
        '.selected {',
        '  color: red;',
        '}'],
  javascript: function() {
    // remember regarding odd/even: counting begins at 0
    q("li:odd").add(q("li:first")).addClass("selected");
  },
  executable: true
});

addSample(".eq", {
  html: ['<ul>',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '  <li>item 3</li>',
         '</ul>'],
  css: [
        '.selected {',
        '  color: red;',
        '}'],
  javascript: function() {
    // index is 0-based
    q("li").eq(1).addClass("selected");
  },
  executable: true
});

addSample(".find", {
  html: ['<ul id="level1">',
         '  <li>item 1.1</li>',
         '  <li>item 1.2',
         '    <ul id="level2">',
         '      <li>item 1.2.1</li>',
         '      <li>item 1.2.2',
         '       <ul id="level3">',
         '         <li>item 1.2.2.1</li>',
         '       </ul>',
         '      </li>',
         '    </ul>',
         '  </li>',
         '</ul>'],
  css: ['.desc {',
        '  color: red;',
        '}'],
  javascript: function() {
    q('#level1 li').find("li").addClass("desc");
  },
  executable: true
});

addSample(".forEach", {
  html: ['<div>',
         '  <p>para 1</p>',
         '  <p>para 2</p>',
         '  <span>span 1</span>',
         '  <span>span 2</span>',
         '</div>'],
  css: ['.selected {',
        '  color: red;',
        '}'],
  javascript: function() {
    q("div").getChildren().forEach(function(item) {
        var current = q(item);
        if (current.is("span") && current.getPrev().is("p")) {
            current.addClass("selected");
        }
    });
  },
  executable: true
});

addSample(".getAncestors", {
  html: ['<ul id="level1">',
         '  <li>item 1.1</li>',
         '  <li>item 1.2',
         '    <ul id="level2">',
         '      <li>item 1.2.1</li>',
         '      <li>item 1.2.2',
         '       <ul id="level3">',
         '         <li>item 1.2.2.1</li>',
         '       </ul>',
         '      </li>',
         '    </ul>',
         '  </li>',
         '</ul>'],
  css: ['.ancestor {',
        '  color: red;',
        '}',
        '.sublist {',
        '  background-color: #ffd;',
        '}'],
  javascript: function() {
    var col = q("#level3");
    col.getAncestors("li > ul").addClass("sublist");
    col.getAncestors().addClass("ancestor");
  },
  executable: true
});

addSample(".getAncestorsUntil", {
  html: ['<ul id="level1">',
         '  <li>item 1.1</li>',
         '  <li>item 1.2',
         '    <ul id="level2">',
         '      <li>item 1.2.1</li>',
         '      <li>item 1.2.2',
         '       <ul id="level3">',
         '         <li>item 1.2.2.1</li>',
         '       </ul>',
         '      </li>',
         '    </ul>',
         '  </li>',
         '</ul>'],
  css: ['.ancestor {',
        '  color: red;',
        '}',
        '.until {',
        '  background-color: #ffd;',
        '}'],
  javascript: function() {
    var col = q("#level3");
    col.getAncestorsUntil("#level2").addClass("until");
    col.getAncestorsUntil().addClass("ancestor");
  },
  executable: true
});

addSample(".getChildren", {
  html: ['<ul>',
         '  <li>text',
         '    <span>without desc</span>',
         '    text',
         '  </li>',
         '  <li>text',
         '    <span class="desc">with desc</span>',
         '    text',
         '  </li>',
         '</ul>'],
  css: ['.featured {',
        '  background-color: #ffd;',
        '}',
        '.selected {',
        '  color: red;',
        '}'],
  javascript: function() {
    // all children
    q("ul").getChildren().addClass("featured");

    // only children which match '.desc'
    q("li").getChildren(".desc").addClass("selected");
  },
  executable: true
});

addSample(".getClosest", {
  html: ['<ul id="level1">',
         '  <li>item 1.1</li>',
         '  <li>item 1.2',
         '    <ul id="level2">',
         '      <li>item 1.2.1</li>',
         '      <li>item 1.2.2',
         '       <ul id="level3">',
         '         <li>item 1.2.2.1</li>',
         '       </ul>',
         '      </li>',
         '    </ul>',
         '  </li>',
         '</ul>'],
  css: ['.closest-ul {',
        '  color: red;',
        '}',
        '.closest-li {',
        '  background-color: #ffd;',
        '}'],
  javascript: function() {
    var col = q("#level3");
    col.getClosest("ul").addClass("closest-ul");
    col.getClosest("li").addClass("closest-li");
  },
  executable: true
});

addSample(".getContents", {
  html: ['<ul>',
         '  <li id="less">text</li>',
         '  <li id="more">text <span>span</span> text</li>',
         '</ul>'],
  javascript: function() {
    var lessContents = q("#less").getContents();
    // (lessContents.length === 1) => [tn]
    var moreContents = q("#more").getContents();
    // (lessContents.length === 3) => [tn, eln, tn]

    // legend:
    // tn = textNodeObj
    // eln = elementNodeObj (e.g. HTMLSpanElement)
  },
  executable: true
});

addSample(".getFirst", {
  html: ['<div>',
         '  <p>para 1</p>',
         '  <ul>',
         '    <li>item 1</li>',
         '    <li>item 2</li>',
        '   </ul>',
         '  <p>para 2</p>',
         '</div>'],
  css: [
        '.selected {',
        '  color: red;',
        '}'],
  javascript: function() {
    q("div").getChildren().getFirst().addClass("selected");
  },
  executable: true
});

addSample(".getLast", {
  html: ['<div>',
         '  <p>para 1</p>',
         '  <ul>',
         '    <li>item 1</li>',
         '    <li>item 2</li>',
        '   </ul>',
         '  <p>para 2</p>',
         '</div>'],
  css: [
        '.selected {',
        '  color: red;',
        '}'],
  javascript: function() {
    q("div").getChildren().getLast().addClass("selected");
  },
  executable: true
});

addSample(".getNext", {
  html: ['<div>',
         '  <p>para 1</p>',
         '  <div>',
         '    <p>inner para 1a</p>',
         '  </div>',
         '  <div>',
         '    <p>inner para 1b</p>',
         '  </div>',
         '  <p class="desc">desc para 1</p>',
         '</div>',
         '<div>',
         '  <p>para 2</p>',
         '  <div>',
         '    <p>inner para 2a</p>',
         '  </div>',
         '  <div>',
         '    <p>inner para 2b</p>',
         '  </div>',
         '  <p class="desc">desc para 2</p>',
         '</div>'],
  css: ['.bgcolor {',
        '  background-color: #ffd;',
        '}',
        '.color {',
        '  color: red;',
        '}',
        '.letterspacing {',
        '  letter-spacing: 10px;',
        '}'],
  javascript: function() {
    q("p").getNext().addClass("bgcolor");
    // (length === 1)

    q("p").getNextUntil(".desc").addClass("letterspacing");
    // (length === 2)

    q("p").getNextAll().addClass("color");
    // (length === 3)
  },
  executable: true
});

addSample(".getNextAll", {
  html: ['<div>',
         '  <p>para 1</p>',
         '  <div>',
         '    <p>inner para 1a</p>',
         '  </div>',
         '  <div>',
         '    <p>inner para 1b</p>',
         '  </div>',
         '  <p class="desc">desc para 1</p>',
         '</div>',
         '<div>',
         '  <p>para 2</p>',
         '  <div>',
         '    <p>inner para 2a</p>',
         '  </div>',
         '  <div>',
         '    <p>inner para 2b</p>',
         '  </div>',
         '  <p class="desc">desc para 2</p>',
         '</div>'],
  css: ['.bgcolor {',
        '  background-color: #ffd;',
        '}',
        '.color {',
        '  color: red;',
        '}',
        '.letterspacing {',
        '  letter-spacing: 10px;',
        '}'],
  javascript: function() {
    q("p").getNext().addClass("bgcolor");
    // (length === 1)

    q("p").getNextUntil(".desc").addClass("letterspacing");
    // (length === 2)

    q("p").getNextAll().addClass("color");
    // (length === 3)
  },
  executable: true
});

addSample(".getNextUntil", {
  html: ['<div>',
         '  <p>para 1</p>',
         '  <div>',
         '    <p>inner para 1a</p>',
         '  </div>',
         '  <div>',
         '    <p>inner para 1b</p>',
         '  </div>',
         '  <p class="desc">desc para 1</p>',
         '</div>',
         '<div>',
         '  <p>para 2</p>',
         '  <div>',
         '    <p>inner para 2a</p>',
         '  </div>',
         '  <div>',
         '    <p>inner para 2b</p>',
         '  </div>',
         '  <p class="desc">desc para 2</p>',
         '</div>'],
  css: ['.bgcolor {',
        '  background-color: #ffd;',
        '}',
        '.color {',
        '  color: red;',
        '}',
        '.letterspacing {',
        '  letter-spacing: 10px;',
        '}'],
  javascript: function() {
    q("p").getNext().addClass("bgcolor");
    // (length === 1)

    q("p").getNextUntil(".desc").addClass("letterspacing");
    // (length === 2)

    q("p").getNextAll().addClass("color");
    // (length === 3)
  },
  executable: true
});

addSample(".getOffsetParent", {
  html: ['<ul id="level1">',
         '  <li>item 1.1</li>',
         '  <li class="positioned">item 1.2',
         '    <ul id="level2">',
         '      <li>item 1.2.1</li>',
         '      <li>item 1.2.2',
         '       <ul id="level3">',
         '         <li>item 1.2.2.1</li>',
         '       </ul>',
         '      </li>',
         '    </ul>',
         '  </li>',
         '</ul>'],
  css: ['.positioned {',
        '  position: relative;',
        '}',
        '.selected {',
        '  background-color: #ffd;',
        '}'],
  javascript: function() {
    q("#level3").getOffsetParent().addClass("selected");
  },
  executable: true
});

addSample(".getParents", {
  html: ['<div>',
         '  <p>para <span>span 1</span> para</p>',
         '  <span>span 2</span>',
         '</div>'],
  css: ['.selected {',
        '  color: red;',
        '}',
        '.featured {',
        '  background-color: #ffd;',
        '}'],
  javascript: function() {
    q("span").getParents().addClass("selected");
    q("span").getParents("div > p").addClass("featured");
  },
  executable: true
});

addSample(".getPrev", {
  html: ['<div>',
         '  <p class="desc">desc para 1</p>',
         '  <div>',
         '    <p>inner para 1a</p>',
         '  </div>',
         '  <div>',
         '    <p>inner para 1b</p>',
         '  </div>',
         '  <p>para 1</p>',
         '</div>',
         '<div>',
         '  <p class="desc">desc para 2</p>',
         '  <div>',
         '    <p>inner para 2a</p>',
         '  </div>',
         '  <div>',
         '    <p>inner para 2b</p>',
         '  </div>',
         '  <p>para 2</p>',
         '</div>'],
  css: ['.bgcolor {',
        '  background-color: #ffd;',
        '}',
        '.color {',
        '  color: red;',
        '}',
        '.letterspacing {',
        '  letter-spacing: 10px;',
        '}'],
  javascript: function() {
    q("p").getPrev().addClass("bgcolor");
    // (length === 1)

    q("p").getPrevUntil(".desc").addClass("letterspacing");
    // (length === 2)

    q("p").getPrevAll().addClass("color");
    // (length === 3)
  },
  executable: true
});

addSample(".getPrevAll", {
  html: ['<div>',
         '  <p class="desc">desc para 1</p>',
         '  <div>',
         '    <p>inner para 1a</p>',
         '  </div>',
         '  <div>',
         '    <p>inner para 1b</p>',
         '  </div>',
         '  <p>para 1</p>',
         '</div>',
         '<div>',
         '  <p class="desc">desc para 2</p>',
         '  <div>',
         '    <p>inner para 2a</p>',
         '  </div>',
         '  <div>',
         '    <p>inner para 2b</p>',
         '  </div>',
         '  <p>para 2</p>',
         '</div>'],
  css: ['.bgcolor {',
        '  background-color: #ffd;',
        '}',
        '.color {',
        '  color: red;',
        '}',
        '.letterspacing {',
        '  letter-spacing: 10px;',
        '}'],
  javascript: function() {
    q("p").getPrev().addClass("bgcolor");
    // (length === 1)

    q("p").getPrevUntil(".desc").addClass("letterspacing");
    // (length === 2)

    q("p").getPrevAll().addClass("color");
    // (length === 3)
  },
  executable: true
});

addSample(".getPrevUntil", {
  html: ['<div>',
         '  <p class="desc">desc para 1</p>',
         '  <div>',
         '    <p>inner para 1a</p>',
         '  </div>',
         '  <div>',
         '    <p>inner para 1b</p>',
         '  </div>',
         '  <p>para 1</p>',
         '</div>',
         '<div>',
         '  <p class="desc">desc para 2</p>',
         '  <div>',
         '    <p>inner para 2a</p>',
         '  </div>',
         '  <div>',
         '    <p>inner para 2b</p>',
         '  </div>',
         '  <p>para 2</p>',
         '</div>'],
  css: ['.bgcolor {',
        '  background-color: #ffd;',
        '}',
        '.color {',
        '  color: red;',
        '}',
        '.letterspacing {',
        '  letter-spacing: 10px;',
        '}'],
  javascript: function() {
    q("p").getPrev().addClass("bgcolor");
    // (length === 1)

    q("p").getPrevUntil(".desc").addClass("letterspacing");
    // (length === 2)

    q("p").getPrevAll().addClass("color");
    // (length === 3)
  },
  executable: true
});

addSample(".getSiblings", {
  html: ['<ul id="level1">',
         '  <li>item 1.1</li>',
         '  <li>item 1.2',
         '    <ul id="level2">',
         '      <li>item 1.2.1</li>',
         '      <li>item 1.2.2',
         '       <ul id="level3">',
         '         <li>item 1.2.2.1</li>',
         '         <li>item 1.2.2.2</li>',
         '       </ul>',
         '      </li>',
         '    </ul>',
         '  </li>',
         '</ul>'],
  css: ['.desc {',
        '  color: red;',
        '}',
        '.info {',
        '  background-color: #ffd;',
        '}'],
  javascript: function() {
    q('#level1 li').getSiblings().addClass("desc");
    q('#level3 li').getSiblings().addClass("info");
  },
  executable: true
});

addSample(".has", {
  html: ['<ul id="level1">',
         '  <li>item 1.1</li>',
         '  <li>item 1.2',
         '    <ul id="level2">',
         '      <li>item 1.2.1</li>',
         '      <li>item 1.2.2</li>',
         '    </ul>',
         '  </li>',
         '</ul>'],
  css: ['.sublist {',
        '  color: red;',
        '}'],
  javascript: function() {
    q("li").has("ul").addClass("sublist");
  },
  executable: true
});

addSample(".is", {
  html: ['<div>',
         '  <p>para 1</p>',
         '  <p>para 2</p>',
         '  <span class="interesting">span 1</span>',
         '  <span>span 2</span>',
         '</div>'],
  css: ['.featured {',
        '  color: red;',
        '}'],
  javascript: function() {
    var collection = q("div").getChildren();
    if (collection.is(".interesting")) {
        collection.addClass("featured");
    }
  },
  executable: true
});

addSample(".not", {
  html: ['<div>',
         '  <p>para 1</p>',
         '  <p class="hot">para 2</p>',
         '  <span class="hot">span 1</span>',
         '  <span>span 2</span>',
         '</div>'],
  css: ['.boring {',
        '  color: red;',
        '}'],
  javascript: function() {
    q("div").getChildren().not(".hot").addClass("boring");
  },
  executable: true
});

addSample(".isChildOf", {
  html: ['<div id="first">',
         '  <p>para 1</p>',
         '  <p class="desc">para 2</p>',
         '</div>',
         '<div id="second">',
         '  <p class="summary">para 3</p>',
         '</div>'],
  css: ['.desc {',
        '  color: #eee;',
        '}'],
  javascript: function() {
    // you can use the 'isChildOf' method to e.g. check within an event listener
    // if the user clicked outside a given container element.
    q('p.desc').isChildOf('div#first'); // true
    q('p.desc').isChildOf('div#second'); // false
  },
  executable: true
});