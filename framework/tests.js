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
    var test = q.create("<div/>");
    test.addClass("test");
    this.assertEquals("test", test[0].getAttribute("class"));
    this.assertTrue(test.hasClass("test"));
    test.toggleClass("test");
    this.assertFalse(test.hasClass("test"));
    test.toggleClass("test");
    this.assertTrue(test.hasClass("test"));
    test.removeClass("test");
    this.assertFalse(test.hasClass("test"));
  },
  
  testClasses : function() {
    var test = q.create("<div/>");
    test.addClasses(["foo", "bar"]);
    this.assertTrue(test.hasClass("foo"));
    this.assertTrue(test.hasClass("bar"));
    test.toggleClass("bar");
    this.assertTrue(test.hasClass("foo"));
    this.assertFalse(test.hasClass("bar"));
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