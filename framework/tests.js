testrunner.globalSetup = function() {
  this.sandbox = q.create("<div id='sandbox'></div>");
  this.sandbox.appendTo(document.body);
};

testrunner.globalTeardown = function() {
  this.sandbox.remove();
};

testrunner.define({
  classname: "Manipulating",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testCreateDiv : function() {
    this.assertNotNull(q.create("<div/>"));
    this.assertEquals(1, q.create("<div/>")[0].nodeType);
  },

  testWrap : function() {
    var test = q.create("<div id='testdiv'/>");
    test.appendTo(this.sandbox[0]);
    var el = document.getElementById("testdiv");
    this.assertEquals(el, q.wrap(el)[0]);
    this.assertEquals(el, q.wrap([el])[0]);
    test.remove();
  },

  testAppendToRemove : function() {
    var test = q.create("<div/>");
    test.appendTo(this.sandbox[0]);
    this.assertEquals(this.sandbox[0], test[0].parentNode);
    test.remove();
    // In legacy IEs, nodes removed from the DOM will have a document fragment 
    // parent (node type 11)
    this.assert(!test[0].parentNode || test[0].parentNode.nodeType !== 1);
  },
  
  "test appendTo with cloned collection" : function() {
    var test = q.create('<span class="child">foo</span><span class="child">foo</span');
    test.appendTo(this.sandbox[0]);
    var parent = q.create('<div class="parent"></div><div class="parent"></div>');
    parent.appendTo(this.sandbox[0]);
    q(".child").appendTo(q(".parent"));
    this.assertEquals(q(".parent .child~.child").length, 2);
  },

  testEmpty : function() {
    var test = q.create("<div><p>test</p></div>");
    test.empty();
    this.assertEquals("", test[0].innerHTML);
  }
});



testrunner.define({
  classname : "Selector",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testId : function() {
    var test = q.create("<div id='testdiv'/>");
    test.appendTo(this.sandbox[0]);
    this.assertEquals(test[0], q("#testdiv")[0]);
    test.remove();
  }
});


testrunner.define({
  classname : "Traversing",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testAdd : function() {
    var test = q.create("<div id='testdiv'/>");
    this.assertEquals(1, test.length);
    test.add(document.body);
    this.assertEquals(2, test.length);
  },

  testGetChildren : function() {
    var test = q.create("<div><p>test</p></div>");
    this.assertEquals(1, test.getChildren().length);
    this.assertEquals(1, test.getChildren()[0].nodeType);
  },

  testGetChildrenSelector : function() {
    var test = q.create("<div><h1/><p/></div>");
    this.assertEquals(0, test.getChildren("div").length);
    this.assertEquals(1, test.getChildren("h1").length);
  },

  testforEach : function() {
    var test = q.create("<div id='testdiv'/>");
    test.add(q.create("<div/>")[0]);
    var self = this;
    var i = 0;
    test.forEach(function(item, id, array) {
      self.assertEquals(self, this);
      self.assertEquals(test[i], item);
      self.assertEquals(i, id);
      self.assertEquals(test, array);
      i++;
    }, this);
  },

  testGetParents : function() {
    var test = q.create("<div id='testdiv'/>");
    test.appendTo(this.sandbox[0]);
    this.assertEquals(this.sandbox[0], test.getParents()[0]);
    test.remove();
  },

  testGetParentsSelector : function() {
    var test = q.create("<a id='parent'><div id='test'/></a>");
    test.appendTo(this.sandbox[0]);
    var parent = q("#parent");
    this.assertEquals(parent[0], q("#test").getParents("a")[0], "Element mismatch");
    this.assertEquals(0, q("#test").getParents("div").length);
    test.remove();
  },
  
  testGetAncestors : function() {
    var test = q.create('<div id="ancestor"><div id="parent"><div id="child"></div></div></div>');
    test.appendTo(this.sandbox[0]);
    var ancestors = q("#child").getAncestors();
    //parent ancestor sandbox body documentElement document
    this.assertEquals(6, ancestors.length);
    
    this.assertEquals("parent", ancestors[0].id);
    this.assertEquals(document, ancestors[5]);
    test.remove();
  },
  
  testGetAncestorsSelector : function() {
    var test = q.create('<div id="ancestor"><div id="parent"><div id="child"></div></div></div>');
    test.appendTo(this.sandbox[0]);
    var ancestors = q("#child").getAncestors("div");
    this.assertEquals(3, ancestors.length);
    this.assertEquals("parent", ancestors[0].id);
    this.assertEquals("sandbox", ancestors[2].id);
    test.remove();
  },
  
  testGetAncestorsUntil : function() {
    var test = q.create('<div id="ancestor"><div id="parent"><div id="child"></div></div></div>');
    test.appendTo(this.sandbox[0]);
    var ancestors = q("#child").getAncestorsUntil("body");
    this.assertEquals(3, ancestors.length);
    this.assertEquals("parent", ancestors[0].id);
    this.assertEquals("sandbox", ancestors[2].id);
    
    ancestors = q("#child").getAncestorsUntil("body", "#sandbox");
    this.assertEquals(1, ancestors.length);
    this.assertEquals("sandbox", ancestors[0].id);
    test.remove();
  },

  testGetClosest : function() {
    var test = q.create("<div><a id='closest'><div><div id='test'/></div></a></div>");
    test.appendTo(this.sandbox[0]);
    this.assertEquals(q("#closest")[0], q("#test").getClosest("a")[0], "Element mismatch");
    this.assertEquals(1, q("#test").getClosest("a").length, "Ancestor not found");
    this.assertEquals(1, q("#test").getClosest("#test").length, "Self not found");
    this.assertEquals(0, q("#test").getClosest("#no").length, "Found unexpected");
    test.remove();
  },

  testFilter : function() {
    var test = q.create("<div id='test' class='item'/><div class='item'/>");
    test.appendTo(this.sandbox[0]);
    var collection = q(".item");
    this.assertEquals(q("#test")[0], collection.filter("#test")[0], "Element mismatch");
    this.assertEquals(1, collection.filter("#test").length);
    test.remove();
  },

  testFilterSelector : function() {
    var col = q.wrap([]);
    var test = q.create("<div id='test' class='item'/>");
    var other = q.create("<div class='item'/>");
    col.add(test[0]);
    col.add(other[0]);
    this.assertEquals(test[0], col.filter("#test")[0], "Element mismatch");
    this.assertEquals(1, col.filter("#test").length);
    this.assertEquals(2, col.filter("div").length);
  },
  
  testFilterFunction : function() {
    var test = q.create("<div id='test' class='item'/><div class='item'/>");
    test.appendTo(this.sandbox[0]);
    var collection = q(".item");
    this.assertEquals(q("#test")[0], collection.filter(function(item) {
      return item.id == "test";
    })[0], "Element mismatch");
    this.assertEquals(1, collection.filter("#test").length);
    test.remove();
  },
  
  /*
  testFilterByElement : function() {
    var test = q.create("<div id='test' class='item'/><div class='item'/>");
    test.appendTo(this.sandbox[0]);
    var collection = q(".item");
    this.assertEquals(q("#test")[0], collection.filter(document.getElementById("test"))[0],
      "Element mismatch");
    this.assertEquals(1, collection.filter("#test").length);
    test.remove();
  },
  */

  testFind : function() {
    var test = q.create("<div id='outer'><div><div id='test'/><div/></div></div>");
    test.appendTo(this.sandbox[0]);
    this.assertEquals(3, q("#outer").find("div").length);
    this.assertEquals(q("#test")[0], q("#outer").find("#test")[0], "Element mismatch");
    this.assertEquals(1, q("#outer").find("#test").length);
    test.remove();
  },
  
  testGetContents : function() {
    var html = "<div class='container'><h1>One</h1><!-- first comment -->foo</div>";
    html += "<div class='container'><h1>Two</h1><!-- second comment -->bar</div>";
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    var contents = q(".container").getContents();
    this.assertEquals(6, contents.length);
    this.assertEquals(1, contents[0].nodeType);
    this.assertEquals(8, contents[1].nodeType);
    this.assertEquals(3, contents[2].nodeType);
    this.assertEquals(1, contents[3].nodeType);
    this.assertEquals(8, contents[4].nodeType);
    this.assertEquals(3, contents[5].nodeType);
    test.remove();
  },
  
  testIs : function() {
    var html = "<ul class='test'><li>Item</li><li>Item</li><li class='foo'>Item</li></ul>";
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    this.assertTrue(q(".test li").is(".foo"));
    this.assertFalse(q(".test li").is("#bar"));
    test.remove();
  },
  
  testIsWithFunction : function() {
    var html = "<ul class='test'><li>Item</li><li>Item</li><li class='foo'>Item</li></ul>";
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    this.assertTrue(q(".test li").is(function(item) {
      return item.className == "foo";
    }));
    test.remove();
  },
  
  testEq : function() {
    var html = '<ul class="test"><li id="a">A</li><li id="b">B</li><li id="c">C</li></ul>';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    this.assertEquals("b", q(".test li").eq(1)[0].id);
    this.assertEquals("b", q(".test li").eq(-2)[0].id);
    test.remove();
  },
  
  testGetFirst : function() {
    var html = '<p id="first" class="foo">Affe</p><h2 class="foo">Juhu</h2><div class="foo">Hugo</div>';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    this.assertEquals(1, q(".foo").getFirst().length);
    this.assertEquals(document.getElementById("first"), q(".foo").getFirst()[0]);
    test.remove();
  },
  
  testGetLast : function() {
    var html = '<p class="foo">Affe</p><h2 class="foo">Juhu</h2><div id="last" class="foo">Hugo</div>';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    this.assertEquals(1, q(".foo").getLast().length);
    this.assertEquals(document.getElementById("last"), q(".foo").getLast()[0]);
    test.remove();
  },
  
  testHas : function() {
    var html = '<ul class="test">'
    + '  <li>Foo</li>'
    + '  <li id="target1"><a class="affe" href="#">Bar</a></li>'
    + '  <li>Baz</li>'
    + '</ul>'
    + '<ul class="test">'
    + '  <li>Foo</li>'
    + '  <li id="target2"><a class="affe" href="#">Bar</a></li>'
    + '  <li>Baz</li>'
    + '</ul>';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    this.assertEquals(6, q(".test li").length);
    this.assertEquals(2, q(".test li").has(".affe").length);
    this.assertEquals("target1", q(".test li").has(".affe")[0].id);
    this.assertEquals("target2", q(".test li").has(".affe")[1].id);
    test.remove();
  },
  
  testGetNext : function() {
    var html = '<p class="test" id="foo">foo</p>\nText\n<p id="bar">bar</p><p id="baz">baz</p>';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    this.assertEquals(1, q(".test").getNext().length);
    this.assertEquals("bar", q("#foo").getNext()[0].id);
    test.remove();
  },
  
  testGetNextWithSelector : function() {
    var html = '<div>a</div><p>f</p><div>f</div><p class="foo">e</p> ';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    this.assertEquals(1, q("#sandbox div").getNext(".foo").length);
    this.assertEquals("foo", q("#sandbox div").getNext(".foo")[0].className);
    test.remove();
  },
  
  testGetNextAll : function() {
    var html = '<div><span id="test">a</span><span>f</span><span id="foo">f</span></div><p>foo</p>';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    this.assertEquals(2, q("#test").getNextAll().length);
    this.assertEquals(1, q("#test").getNextAll("#foo").length);
    this.assertEquals(document.getElementById("foo"), q("#test").getNextAll("#foo")[0]);
    test.remove();
  },
  
  testGetNextUntil : function() {
    var html = '<ul>'
    + '  <li class="first">a</li>'
    + '  <li>f</li>'
    + '  <li>f</li>'
    + '  <li class="last">e</li>'
    + '</ul>'
    + '<p class="first">a</p>'
    + '<p>f</p>'
    + '<p>f</p>'
    + '<p class="last">e</p>';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    var res = q("#sandbox .first").getNextUntil(".last");
    this.assertEquals(4, res.length);
    this.assertEquals("LI", res[0].tagName);
    this.assertEquals("LI", res[1].tagName);
    this.assertEquals("P", res[2].tagName);
    this.assertEquals("P", res[3].tagName);
    test.remove();
  },
  
  testGetPrev : function() {
    var html = '<p class="test" id="foo">foo</p>\nText\n<p id="bar">bar</p><p id="baz">baz</p>';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    this.assertEquals(1, q("#baz").getPrev().length);
    this.assertEquals("bar", q("#baz").getPrev()[0].id);
    test.remove();
  },
  
  testGetPrevWithSelector : function() {
    var html = '<h1>A</h1><p>f</p>'
    + '<h2 class="foo">A</h2><p>f</p>'
    + '<h3>A</h3><p>f</p>'
    + '<h4 class="foo">A</h4><p>f</p>';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    var res = q("#sandbox p").getPrev(".foo");
    this.assertEquals(2, res.length);
    this.assertEquals("foo", res[0].className);
    this.assertEquals("foo", res[1].className);
    this.assertEquals("H2", res[0].tagName);
    this.assertEquals("H4", res[1].tagName);
    test.remove();
  },
  
  testGetPrevAll : function() {
    var html = '<p>foo</p><div><span>f</span><span id="foo">f</span><span id="test">a</span></div>';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    this.assertEquals(2, q("#test").getPrevAll().length);
    this.assertEquals(1, q("#test").getPrevAll("#foo").length);
    this.assertEquals(document.getElementById("foo"), q("#test").getPrevAll("#foo")[0]);
    test.remove();
  },
  
  testGetPrevUntil : function() {
    var html = '<ul>'
    + '  <li class="first">a ONE</li>'
    + '  <li>f TWO</li>'
    + '  <li>f THREE</li>'
    + '  <li class="last">e</li>'
    + '</ul>'
    + '<p class="first">a</p>'
    + '<p>f</p>'
    + '<p>f</p>'
    + '<p class="last">e</p>';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    var res = q("#sandbox .last").getPrevUntil(".first");
    this.assertEquals(4, res.length);
    this.assertEquals("LI", res[0].tagName);
    this.assertEquals("LI", res[1].tagName);
    this.assertEquals("P", res[2].tagName);
    this.assertEquals("P", res[3].tagName);
    test.remove();
  },
  
  testGetSiblings : function() {
    var html = '<ul class="test">'
    + '  <li id="juhu">A</li>'
    + '  <li>F</li>'
    + '  <li class="foo">F</li>'
    + '  <li>E</li>'
    + '</ul>';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    var res = q(".foo").getSiblings();
    this.assertEquals(3, res.length);
    this.assertEquals("A", res[0].innerHTML);
    this.assertEquals("F", res[1].innerHTML);
    this.assertEquals("E", res[2].innerHTML);
    
    res = q(".foo").getSiblings("#juhu");
    this.assertEquals(1, res.length);
    this.assertEquals("juhu", res[0].id);
    test.remove();
  },
  
  testNot : function() {
    var html = '<ul class="test">'
    + '  <li id="juhu">A</li>'
    + '  <li>F</li>'
    + '  <li class="foo">F</li>'
    + '  <li>E</li>'
    + '</ul>';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    var res = q(".test li").not(".foo");
    this.assertEquals(3, res.length);
    this.assertEquals(0, qx.bom.Selector.matches(".foo", res));
    test.remove();
  },
  
  testNotWithFunction : function() {
    var html = '<ul class="test">'
    + '  <li id="juhu">A</li>'
    + '  <li>F</li>'
    + '  <li class="foo">F</li>'
    + '  <li>E</li>'
    + '</ul>';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    var res = q(".test li").not(function(item) {
      return item.className.indexOf("foo") >=0;
    });
    this.assertEquals(3, res.length);
    this.assertEquals(0, qx.bom.Selector.matches(".foo", res));
    test.remove();
  },
  
  testGetOffsetParent : function() {
    var html = '<div><p class="foo">affe</p></div><div id="fixed" style="position:fixed"><p class="foo">affe</p></div>';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    var res = q(".foo").getOffsetParent();
    this.assertEquals(2, res.length);
    this.assertEquals(document.body, res[0]);
    this.assertEquals(document.getElementById("fixed"), res[1]);
    test.remove();
  }
});



testrunner.define({
  classname : "Css",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testStyle : function() {
    var test = q.create("<div/>");
    test.appendTo(this.sandbox[0]);
    test.setStyle("width", "10px");
    this.assertEquals("10px", test.getStyle("width"));
    test.setStyle("padding-top", "5px");
    this.assertEquals("5px", test.getStyle("padding-top"));
    this.assertEquals("5px", test.getStyle("paddingTop"));
    test.remove();
  },

  testStyles : function() {
    var test = q.create("<div/>");
    test.appendTo(this.sandbox[0]);
    test.setStyles({"width": "10px", "height": "20px", "marginBottom" : "15px"});
    var result = test.getStyles(["width", "height", "margin-bottom", "marginBottom"]);
    this.assertEquals("10px", result.width);
    this.assertEquals("20px", result.height);
    this.assertEquals("15px", result.marginBottom);
    this.assertEquals("15px", result["margin-bottom"]);
    test.remove();
  },

  testClass : function() {
    var test = q.create("<div/><div/>");
    test.addClass("test");
    this.assertEquals("test", test.getAttribute("class"));
    this.assertEquals("test", test.eq(1).getAttribute("class"));
    this.assertTrue(test.eq(0).hasClass("test"));
    this.assertTrue(test.eq(1).hasClass("test"));
    test.toggleClass("test");
    this.assertFalse(test.eq(0).hasClass("test"));
    this.assertFalse(test.eq(1).hasClass("test"));
    test.toggleClass("test");
    this.assertTrue(test.eq(0).hasClass("test"));
    this.assertTrue(test.eq(1).hasClass("test"));
    test.removeClass("test");
    this.assertFalse(test.eq(0).hasClass("test"));
    this.assertFalse(test.eq(1).hasClass("test"));
    test.addClass("test");
    test.replaceClass("test", "foo");
    this.assertFalse(test.eq(0).hasClass("test"));
    this.assertFalse(test.eq(1).hasClass("test"));
    this.assertTrue(test.eq(0).hasClass("foo"));
    this.assertTrue(test.eq(1).hasClass("foo"));
  },
  
  testClasses : function() {
    var test = q.create("<div/><div/>");
    test.addClasses(["foo", "bar"]);
    this.assertTrue(test.eq(0).hasClass("foo"));
    this.assertTrue(test.eq(0).hasClass("foo"));
    this.assertTrue(test.eq(1).hasClass("bar"));
    this.assertTrue(test.eq(1).hasClass("bar"));
    test.toggleClass("bar");
    this.assertTrue(test.eq(0).hasClass("foo"));
    this.assertFalse(test.eq(0).hasClass("bar"));
    this.assertTrue(test.eq(1).hasClass("foo"));
    this.assertFalse(test.eq(1).hasClass("bar"));
    test.addClass("bar");
    test.removeClasses(["foo", "bar"]);
    this.assertFalse(test.eq(0).hasClass("foo"));
    this.assertFalse(test.eq(0).hasClass("bar"));
    this.assertFalse(test.eq(1).hasClass("foo"));
    this.assertFalse(test.eq(1).hasClass("bar"));
    test.addClass("bar");
    test.toggleClasses(["foo", "bar", "baz"]);
    this.assertTrue(test.eq(0).hasClass("foo"));
    this.assertFalse(test.eq(0).hasClass("bar"));
    this.assertTrue(test.eq(0).hasClass("baz"));
    this.assertTrue(test.eq(1).hasClass("foo"));
    this.assertFalse(test.eq(1).hasClass("bar"));
    this.assertTrue(test.eq(1).hasClass("baz"));
  },

  testGetHeightElement : function() {
    var test = q.create("<div style='height: 100px'></div><div></div>");
    test.appendTo(this.sandbox[0]);
    this.assertNumber(test.getHeight());
    this.assertEquals(100, test.getHeight());
    test.remove();
  },

  testGetHeightDocument : function() {
    this.assertNumber(q.wrap(document).getHeight());
  },

  testGetHeightWindow : function() {
    this.assertNumber(q.wrap(window).getHeight());
  },
  
  testGetWidthElement : function() {
    var test = q.create("<div style='width: 100px'></div><div></div>");
    test.appendTo(this.sandbox[0]);
    this.assertNumber(test.getWidth());
    this.assertEquals(100, test.getWidth());
    test.remove();
  },

  testGetWidthDocument : function() {
    this.assertNumber(q.wrap(document).getWidth());
  },

  testGetWidthWindow : function() {
    this.assertNumber(q.wrap(window).getWidth());
  },

  testGetOffset : function() {
    var test = q.create("<div style='position: absolute; top: 100px'></div><div></div>");
    test.appendTo(this.sandbox[0]);
    this.assertNumber(test.getOffset().top);
    this.assertNumber(test.getOffset().right);
    this.assertNumber(test.getOffset().bottom);
    this.assertNumber(test.getOffset().left);
    this.assertEquals(100, test.getOffset().top);
  },
  
  testGetContentHeight : function() {
    var test = q.create("<div id='test'></div>").setStyles({ 
      position: "absolute",
      height: "200px",
      padding: "50px" });
    test.appendTo(this.sandbox[0]);
    
    this.assertEquals(200, test.getContentHeight());
  },
  
  testGetContentWidth : function() {
    var test = q.create("<div id='test'></div>").setStyles({ 
      position: "absolute",
      width: "200px",
      padding: "50px" });
    test.appendTo(this.sandbox[0]);
    
    this.assertEquals(200, test.getContentWidth());
  }
});



testrunner.define({
  classname : "Attribute",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testHtml : function() {
    var test = q.create("<div/>");
    test.setHtml("affe");
    this.assertEquals("affe", test[0].innerHTML);
    this.assertEquals("affe", test.getHtml());
  },

  testAttribute : function() {
    var test = q.create("<div/>");
    test.setAttribute("id", "affe");
    this.assertEquals("affe", test[0].getAttribute("id"));
    this.assertEquals("affe", test.getAttribute("id"));
  },

  testAttributes : function() {
    var test = q.create("<div/>");
    test.setAttributes({"id": "affe", "x": "y"});
    this.assertEquals("affe", test[0].getAttribute("id"));
    this.assertEquals("affe", test.getAttributes(["id", "x"]).id);
    this.assertEquals("y", test.getAttributes(["id", "x"]).x);
  },

  testProperty : function() {
    var test = q.create("<div/>");
    test.setProperty("affe", "AFFE");
    this.assertEquals("AFFE", test[0].affe);
    this.assertEquals("AFFE", test.getProperty("affe"));
  },

  testProperties : function() {
    var test = q.create("<div/>");
    test.setProperties({"affe": "AFFE", "x": "y"});
    this.assertEquals("AFFE", test[0].affe);
    this.assertEquals("AFFE", test.getProperties(["affe", "x"]).affe);
    this.assertEquals("y", test.getProperties(["affe", "x"]).x);
  }
});



testrunner.define({
  classname : "Animation",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testFadeOut : function() {
    var test = q.create("<div id='testdiv'/>");
    test.appendTo(this.sandbox[0]);
    var handle = test.fadeOut();
    handle.onEnd(function() {
      this.resume(function() {
        this.assertEquals("none", test[0].style["display"]);
        test.remove();
      }, this);
    }, this);
    this.wait();
  },

  testFadeIn : function() {
    var test = q.create("<div id='testdiv'/>");
    test.appendTo(this.sandbox[0]);
    var handle = test.fadeIn();
    this.assertEquals(0, test[0].style["opacity"]);
    handle.onEnd(function() {
      this.resume(function() {
        this.assertEquals(1, test[0].style["opacity"]);
        test.remove();
      }, this);
    }, this);
    this.wait();
  }
});



testrunner.define({
  classname : "Events",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testOnOffEmit : function() {
    var test = q.create("<div/>");
    var self = this;
    var called = 0;
    var listener = function(data) {
      self.assertEquals(self, this);
      self.assertEquals(sendData, data);
      called++;
    };
    test.on("changeName", listener, this);
    var sendData = {a: 12};
    test.emit("changeName", sendData);
    this.assertEquals(1, called);

    test.off("changeName", listener, this);
    test.emit("changeName", sendData);
    this.assertEquals(1, called);
  },

  testOnOffEmitChange : function() {
    var test = q.create("<div/>");
    var self = this;
    var called = 0;
    var listener = function(data) {
      self.assertEquals(self, this);
      self.assertEquals(sendData, data);
      called++;
    };
    test.on("changeName", listener, this);
    var sendData = {a: 12};
    test.emit("changeName", sendData);
    this.assertEquals(1, called);

    var test2 = q.wrap(test[0]);
    test2.emit("changeName", sendData);
    this.assertEquals(2, called);
  },


  testOnOffEmitMany : function() {
    var test = q.create("<div/>");
    test.add(q.create("<div/>")[0]);
    var self = this;
    var called = 0;
    var listener = function(data) {
      self.assertEquals(self, this);
      self.assertEquals(sendData, data);
      called++;
    };
    test.on("changeName", listener, this);
    var sendData = {a: 12};
    test.emit("changeName", sendData);
    this.assertEquals(2, called);

    test.off("changeName", listener, this);
    test.emit("changeName", sendData);
    this.assertEquals(2, called);
  },


  testOnce : function() {
    var test = q.create("<div/>");
    var self = this;
    var called = 0;
    var listener = function(data) {
      self.assertEquals(self, this);
      self.assertEquals(sendData, data);
      called++;
    };
    test.once("changeName", listener, this);
    var sendData = {a: 12};
    test.emit("changeName", sendData);
    this.assertEquals(1, called);

    test.emit("changeName", sendData);
    this.assertEquals(1, called);
  },


  testOnOffEmitNative : function()
  {
    var test = q.create("<div id='foo'/>");
    test.appendTo(this.sandbox[0]);
    var obj = {
      count : 0
    }
    var callback = function (ev) { 
      this.count++; 
    }
    var callback2 = function (ev) { 
      this.count += 2; 
    }
    // two listeners on the same element/event; make sure off() removes the 
    // right one
    q("#foo").on("mousedown", callback2, obj);
    q("#foo").on("mousedown", callback, obj);
    q("#foo").off("mousedown", callback, obj);
    q("#foo").emit("mousedown");
    this.assertEquals(2, obj.count);
    q("#foo").off("mousedown", callback2, obj);
    
    test.remove();
  },
  
  __registerNormalization : function(type, normalizer) {
    var now = new Date().getTime();
    qx.Bootstrap.define("EventNormalize" + now.toString(), {
      statics :
      {
        normalize : normalizer
      },
      defer : function(statics)
      {
        q.registerEventNormalization(type, statics.normalize);
      }
    });
  },
  
  testNormalization : function()
  {
    this.__registerNormalization("focus", function(event) {
      event.affe = "juhu";
      return event;
    });
    
    var normalizer = function(event) {
      event.affe += " hugo";
      return event;
    };
    this.__registerNormalization("focus", normalizer);
    
    this.__registerNormalization("focus", function(event) {
      event.affe += " affe";
      return event;
    });
    
    var obj = {
      normalized : false
    };
    var callback = function(ev) {
      if (ev.affe && ev.affe === "juhu affe") {
        this.normalized = true;
      }
    };
    
    var test = q.create('<input type="text"></input>');
    test.appendTo(this.sandbox[0]);
    test.on("focus", callback, obj);
    
    q.unregisterEventNormalization("focus", normalizer);
    
    var that = this;
    window.setTimeout(function() {
      test[0].focus();
    }, 100);
    
    this.wait(function() {
      this.assert(obj.normalized, "Event was not manipulated!");
    }, 200, this);
  },
  
  tearDownTestNormalization : function()
  {
    var registry = q.getEventNormalizationRegistry();
    delete registry.focus;
  },
  
  testNormalizationWildcard : function() {
    this.__registerNormalization("*", function(event) {
      event.affe = "juhu";
      return event;
    });
    
    var obj1, obj2;
    obj1 = obj2 = {
      normalized : false
    };
    var callback = function(ev) {
      if (ev.affe && ev.affe === "juhu") {
        this.normalized = true;
      }
    };
    
    var test = q.create('<input type="text"></input>');
    test.appendTo(this.sandbox[0]);
    test.on("focus", callback, obj1);
    test.on("blur", callback, obj2);
    
    
    var that = this;
    window.setTimeout(function() {
      test[0].focus();
      test[0].blur();
    }, 100);
    
    this.wait(function() {
      this.assert(obj1.normalized, "Event was not manipulated!");
      this.assert(obj2.normalized, "Event was not manipulated!");
    }, 200, this);
  },
  
  __normalizeFocusBlur : null,
  
  testNormalizationForMultipleTypes : function() {
    this.__normalizeFocusBlur = function(event) {
      event.affe = "juhu";
      return event;
    };
    this.__registerNormalization(["focus", "blur"], this.__normalizeFocusBlur);
    
    var obj1, obj2;
    obj1 = obj2 = {
      normalized : false
    };
    var callback = function(ev) {
      if (ev.affe && ev.affe === "juhu") {
        this.normalized = true;
      }
    };
    
    var test = q.create('<input type="text" />');
    test.appendTo(this.sandbox[0]);
    test.on("focus", callback, obj1);
    test.on("blur", callback, obj2);
    
    var that = this;
    window.setTimeout(function() {
      test[0].focus();
    }, 100);
    
    // IE < 9 won't fire the focus event if blur() is called immediately after
    // focus()
    window.setTimeout(function() {
      test[0].blur();
    }, 250);
    
    this.wait(function() {
      this.assert(obj1.normalized, "Focus event was not manipulated!");
      this.assert(obj2.normalized, "Blur event was not manipulated!");
    }, 500, this);
  },
  
  tearDownTestNormalizationForMultipleTypes : function() {
    var registry = q.getEventNormalizationRegistry();
    var before = registry["focus"].length + registry["blur"].length;
    q.unregisterEventNormalization(["focus", "blur"], this.__normalizeFocusBlur);
    var after = registry["focus"].length + registry["blur"].length;
    this.assertEquals((before - 2), after);
  }
});


testrunner.define({
  classname : "event.Native",
  
  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,
  
  testGetTarget : function()
  {
    var obj = {
      target : null
    };
    var callback = function(ev) {
      this.target = ev.getTarget();
      this.currentTarget = ev.getCurrentTarget();
    };
    
    var test = q.create('<input id="foo" type="text" />');
    test.appendTo(this.sandbox[0]);
    test.on("focus", callback, obj);
    
    var that = this;
    window.setTimeout(function() {
      test[0].focus();
    }, 100);
    
    this.wait(function() {
      this.assertEquals(test[0], obj.target);
      this.assertEquals(test[0], obj.currentTarget);
    }, 200, this);
  },
  
  testEventMethods : function()
  {
    var methods = ["getRelatedTarget", "preventDefault", "stopPropagation"];
    
    var obj = {
      target : null
    };
    var callback = function(ev) {
      for (var i=0, l=methods.length; i<l; i++) {
        var methodName = methods[i];
        this[methodName] = (typeof ev[methodName] == "function");
      }
    };
    
    var test = q.create('<input type="text"></input>');
    test.appendTo(this.sandbox[0]);
    test.on("focus", callback, obj);
    
    var that = this;
    window.setTimeout(function() {
      test[0].focus();
    }, 100);
    
    this.wait(function() {
      for (var i=0, l=methods.length; i<l; i++) {
        this.assertTrue(obj[methods[i]]);
      }
    }, 200, this);
  }
});

testrunner.define({
  classname : "event.Mouse",
  
  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,
  
  testEventMethods : function()
  {
    var eventTypes = qx.module.event.Mouse.TYPES;
    var registry = qx.module.Event.getRegistry();
    for (var i=0,l=eventTypes.length; i<l; i++) {
      this.assertKeyInMap(eventTypes[i], registry);
    }
  }
});

testrunner.define({
  classname : "Templates",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testToHtml : function() {
    var result = q.template.toHtml("{{affe}}", {affe: "george"});
    this.assertEquals("george", result);
  },

  testGet : function() {
    var template = q.create("<div id='tmp'>{{affe}}</div>");
    template.appendTo(document.body);
    var result = q.template.get("tmp", {affe: "george"});
    this.assertEquals(1, result.length);
    this.assertEquals("george", result[0]);
    template.remove();
  }
});

testrunner.define({
  classname : "Polyfill",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testFunctionBind : function() {
    var context;
    
    var fcn = function(a, b) {
      context = this;
      return a + b;
    };
    var bound = fcn.bind(this);
    var result = bound(2, 3);
    this.assertEquals(this, context);
    this.assertEquals(5, result);
    
    var boundWithArg = fcn.bind(this, 5);
    result = boundWithArg(2);
    this.assertEquals(this, context);
    this.assertEquals(7, result);
  }
});