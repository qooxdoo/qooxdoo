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
         '  <li id="info">item 1</li>',
         '  <li>item 2</li>',
         '</ul>'],
  javascript: function() {
    var nodeText = q.getNodeText(q("#info")[0]);
    // (nodeText === "item 1")
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
    var isBlockNode4 = q.isBlockNode({});
    // (isBlockNode4 === false)
    var isBlockNode5 = q.isBlockNode(null);
    // (isBlockNode5 === false)
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
    var isElement3 = q.isElement({});
    // (isElement3 === false)
    var isElement4 = q.isElement(null);
    // (isElement4 === false)
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
    var isNode2 = q.isNode({});
    // (isNode2 === false)
    var isNode3 = q.isNode(null);
    // (isNode3 === false)
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
    var isNodeName2 = q.isNodeName({}, "li");
    // (isNodeName2 === false)
    var isNodeName3 = q.isNodeName(null, "li");
    // (isNodeName3 === false)
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
    q("li:odd").add(q("li:first")[0]).addClass("selected");
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
