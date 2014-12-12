var initAttached = false;
testrunner.globalSetup = function() {
  if (!initAttached) {
    // attach a custom init function
    q.$attachInit(function() {
      this.testInit = true;
    });
    initAttached = true;
  }

  this.sandbox = q.create("<div id='sandbox'></div>");
  this.sandbox.appendTo(document.body);

  // CSS metrics should be integer by default in IE10 Release Preview, but
  // getBoundingClientRect will randomly return float values unless this
  // feature is explicitly deactivated:
  if (document.msCSSOMElementFloatMetrics) {
    document.msCSSOMElementFloatMetrics = null;
  }
};

testrunner.globalTeardown = function() {
  this.sandbox.remove();
};

testrunner.createMouseEvent = function(type) {
  var domEvent;
  if (qx.core.Environment.get("event.customevent")) {
    domEvent = new MouseEvent(type, {
      canBubble: true,
      cancelable: true,
      view: window,
    });
    domEvent.initMouseEvent(type, true, true, window,
                           1, 0, 0, 0, 0,
                           false, false, false, false,
                           0, null);
  } else if (document.createEvent) {
    domEvent = document.createEvent("UIEvents");
    domEvent.initEvent(type, true, true);
  } else if (document.createEventObject) {
    domEvent = document.createEventObject();
    domEvent.type = type;
  }
  return domEvent;
};

testrunner.define({
  classname: "Basic",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testInstanceOf : function() {
    var c = q.create("<div>");
    this.assertTrue(c instanceof q);
    c = q();
    this.assertTrue(c instanceof q);
  },

  testInit : function() {
    // add a second element
    this.sandbox.push(q.create("<div>")[0]);

    this.assertTrue(this.sandbox.testInit);
    this.assertEquals(2, this.sandbox.length);

    this.assertTrue(this.sandbox.filter(function() {return true;}).testInit);
    this.assertEquals(2, this.sandbox.filter(function() {return true;}).length);

    this.assertTrue(this.sandbox.concat().testInit);
    this.assertEquals(2, this.sandbox.concat().length);
    this.assertEquals(4, this.sandbox.concat(this.sandbox.concat()).length);

    this.assertTrue(this.sandbox.slice(0).testInit);
    this.assertEquals(2, this.sandbox.slice(0).length);
    this.assertEquals(1, this.sandbox.slice(1).length);
    this.assertEquals(0, this.sandbox.slice(0,0).length);
    this.assertEquals(1, this.sandbox.slice(0,1).length);

    var clone = this.sandbox.clone().splice(0, 2);
    this.assertTrue(clone.testInit);
    this.assertEquals(2, clone.length);

    this.assertTrue(this.sandbox.map(function(i) {return i;}).testInit);
    this.assertEquals(2, this.sandbox.map(function(i) {return i;}).length);
  },

  testDependencies : function()
  {
    if (q.$$qx.core.Environment.get("qx.debug")) {
      this.skip("Only reasonable in non-debug version.");
    }
    this.assertUndefined(q.$$qx.Class, "Class");
    this.assertUndefined(q.$$qx.Interface, "Interface");
    this.assertUndefined(q.$$qx.Mixin, "Mixin");
    this.assertUndefined(q.$$qx.core.Assert, "Assert");
    if (q.$$qx.event) {
      this.assertUndefined(q.$$qx.event.Registration, "event.Registration");
    }
  },

  testNoConflict : function() {
    this.assertEquals(q, qxWeb);
  }
});

testrunner.define({
  classname: "q",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testUnique : function() {
    var c = q("#sandbox").add(q("#sandbox"));
    this.assertEquals(2, c.length);
    this.assertTrue(c.is("#sandbox"));
    var u = c.unique();
    this.assertEquals(1, u.length);
    this.assertTrue(u.is("#sandbox"));
  },

  testQuerySelector : function() {
    var test = document.createElement("div");
    test.id = "foo";
    document.getElementById("sandbox").appendChild(test);
    var collection = q("#foo");
    this.assertInstance(collection, q);
    this.assertEquals(1, collection.length);
    this.assertEquals(document.getElementById("foo"), collection[0]);
  },

  testInit : function() {
    var select = document.createElement("select");
    document.getElementById("sandbox").appendChild(select);
    var opt = document.createElement("option");
    select.appendChild(opt);

    // Element
    var coll = q(select);
    this.assertEquals(1, coll.length, "affe0");
    this.assertEquals(select, coll[0]);

    // Array of elements
    coll = q([select]);
    this.assertEquals(1, coll.length, "affe1");
    this.assertEquals(select, coll[0]);

    // NodeList
    coll = q(document.getElementsByTagName("select"));
    this.assertEquals(1, coll.length, "affe2");
    this.assertEquals(select, coll[0]);

    // HtmlCollection
    if (typeof select.selectedOptions !== "undefined") {
      coll = q(select.selectedOptions);
      this.assertEquals(1, coll.length, "affe3");
      this.assertEquals(opt, coll[0]);
    }

    // Bogus
    coll = q({length: 5});
    this.assertEquals(0, coll.length);
  },

  testContext : function() {
    var container1 = document.createElement("div");
    var inner1 = document.createElement("h2");
    inner1.id = "inner1";
    container1.appendChild(inner1);
    document.getElementById("sandbox").appendChild(container1);

    var container2 = document.createElement("div");
    var inner2 = document.createElement("h2");
    inner2.id = "inner2";
    container2.appendChild(inner2);
    document.getElementById("sandbox").appendChild(container2);

    // no context
    this.assertEquals(2, q("#sandbox h2").length);
    // element as context
    var coll1 = q("h2", container1);
    this.assertEquals(1, coll1.length);
    this.assertEquals("inner1", coll1[0].id);

    // collection as context
    var coll2 = q("h2", q(container1));
    this.assertEquals(1, coll2.length);
    this.assertEquals("inner1", coll2[0].id);
  },

  testOverrideQxWebPrototypeMethods: function () {
    this.assertUndefined(qxWeb.prototype['__attach_test']);

    qxWeb.$attach({
      "__attach_test": function () {
        return "foo";
      }
    });
    this.assertNotUndefined(qxWeb.prototype['__attach_test']);
    this.assertEquals("foo", qxWeb(document.body).__attach_test());

    if (qx.core.Environment.get("qx.debug")) {
      this.assertException(function () {
        qxWeb.$attach({
          "__attach_test": function () {
            return "bar";
          }
        });
      }, Error);
    } else {
      qxWeb.$attach({
        "__attach_test": function () {
          return "bar";
        }
      });
    }

    this.assertEquals("foo", qxWeb(document.body).__attach_test());

    qxWeb.$attach({
      "__attach_test": function () {
        return "bar";
      }
    }, true);
    this.assertEquals("bar", qxWeb(document.body).__attach_test());
  }
});


testrunner.define({
  classname: "Manipulating",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testCreateDiv : function() {
    this.assertNotNull(q.create("<div/>"));
    this.assertEquals(1, q.create("<div/>")[0].nodeType);
  },

  testCreateWithContext : function() {
    var onIframeLoad = function() {
      this.resume(function() {
        var frameDoc = frame[0].contentDocument;
        var frameNode = q.create("<div id='foo'>", frameDoc).appendTo(frameDoc.body);
        this.assertEquals(q.getDocument(frameNode[0]), frameDoc);
        this.assertEquals(frameDoc.body, frameNode.getAncestors()[0]);
      }, this);
    };
    var frame = q.create('<iframe src="media.html"></iframe>')
    .once("load", onIframeLoad, this)
    .appendTo("#sandbox");

    this.wait(1000);
  },

  testWrapElement : function() {
    var test = q.create("<div id='testdiv'/>");
    test.appendTo(this.sandbox[0]);
    var el = document.getElementById("testdiv");
    this.assertEquals(el, q(el)[0]);
    this.assertEquals(el, q([el])[0]);
    test.remove();
  },

  testClone : function() {
    var orig = q.create("<div id='testdiv'>abc</div>");
    var clone = orig.clone();
    this.assertNotEquals(orig[0], clone[0]);
    this.assertEquals(orig.getAttribute("id"), clone.getAttribute("id"));
    this.assertEquals(orig.getHtml(), clone.getHtml());

    //must be ignored:
    var df = document.createDocumentFragment ? document.createDocumentFragment() : undefined;
    q([window, document, df]).clone();
  },


  testCloneWithEvents : function() {
    var orig = q.create("<div id='testdiv'>abc</div>");
    var called = 0;
    orig.on("click", function() {
      called++;
    });
    orig.on("custom", function() {
      called--;
    });
    var clone = orig.clone(true);
    clone.emit("click");
    this.assertEquals(1, called);

    orig.emit("click");
    this.assertEquals(2, called);

    orig.emit("custom");
    this.assertEquals(1, called);

    clone.emit("custom");
    this.assertEquals(0, called);
  },


  testCloneWithEventsDeep : function() {
    var orig = q.create("<div id='testdiv'>abc</div>");
    var origInner = q.create("<div id='inner'>def</div>");
    origInner.appendTo(orig);
    var called = 0;
    origInner.on("click", function() {
      called++;
    });

    var clone = orig.clone(true);
    var children = clone.getChildren();
    q(children[0]).emit("click");
    this.assertEquals(1, called);
  },


  testCloneWithNestedDomStructure : function() {
    var orig = q.create("<span id='container'><span id='subcontainer'><a href='#' title='test' class='foo'></a></span></span>");

    var clone = orig.getChildren().clone();
    var secondClone = orig.getChildren().clone(true);

    this.assertEquals(1, clone.length, "Cloning without events failed!");
    this.assertEquals(1, secondClone.length, "Cloning with events failed!");
  },


  testAppendToRemove : function() {
    var test = q.create("<div/>");
    test.appendTo(this.sandbox[0]);
    this.assertEquals(this.sandbox[0], test[0].parentNode);
    test.remove();
    // In legacy IEs, nodes removed from the DOM will have a document fragment
    // parent (node type 11)
    this.assert(!test[0].parentNode || test[0].parentNode.nodeType !== 1);

    // must be ignored:
    q([window, document]).remove();
  },

  "test appendTo with cloned collection" : function() {
    var test = q.create('<span class="child">foo</span><span class="child">foo</span');
    test.appendTo(this.sandbox[0]);
    var parent = q.create('<div class="parent"></div><div class="parent"></div>');
    parent.appendTo(this.sandbox[0]);
    q(".child").appendTo(q(".parent"));
    this.assertEquals(q(".parent .child~.child").length, 2);
  },

  "test appendTo with selector" : function()
  {
    var test = q.create('<span class="child">foo</span><span class="child">foo</span');
    test.appendTo("#sandbox");
    this.assertEquals(2, q("#sandbox .child").length);

    //must be ignored:
    q([window, document]).appendTo("#sandbox");
  },

  "test appendTo documentFragment" : function() {
    if (!document.createDocumentFragment) {
      this.skip("requires createDocumentFragment");
    }

    var df = document.createDocumentFragment();
    q.create("<h1 id='baz'>qux</h1>").appendTo(df);
    this.assertEquals("baz", df.firstChild.id);
  },

  "test empty" : function() {
    var test = q.create("<div><p>test</p></div>");
    test.empty();
    this.assertEquals("", test[0].innerHTML);

    //must be ignored:
    q([window, document]).empty();
  },

  "test empty documentFragment" : function() {
    if (!document.createDocumentFragment) {
      this.skip("requires createDocumentFragment");
    }

    var df = document.createDocumentFragment();
    df.appendChild(document.createElement("h1"));
    q(df).empty();
    this.assertEquals(0, df.childNodes.length);
  },

  "test empty and don't destroy children in IE" : function() {
    // see [BUG #7323]

    var el = q.create("<div>foo<p>bar</p></div>");
    var ieSpecialTreatment = function(html) {
      // IE uses uppercase tag names and inserts whitespace
      return html.toLowerCase().replace(/\s+/, "");
    };

    q('#sandbox').empty().append(el);
    this.assertEquals("foo<p>bar</p>", ieSpecialTreatment(el.getHtml()));
    q('#sandbox').empty().append(el);
    this.assertEquals("foo<p>bar</p>", ieSpecialTreatment(el.getHtml()));
    this.assertEquals("<div>foo<p>bar</p></div>", ieSpecialTreatment(q('#sandbox').getHtml()));
  },

  testAppendHtmlString : function() {
    var test = q.create("<ul><li>Foo</li><li>Bar</li></ul>");
    test.appendTo(this.sandbox[0]);

    q("#sandbox li").append('<h2>Hello</h2><span>Affe</span>');
    this.assertEquals(2, q("#sandbox li").has("h2").length);
    this.assertEquals(2, q("#sandbox li").has("span").length);

    //must be ignored:
    q([window, document]).append("<h2>Foo</h2>");
  },

  testAppendHtmlStringToDocumentFragment : function() {
    if (!document.createDocumentFragment) {
      this.skip("requires document.createDocumentFragment");
    }

    var df = document.createDocumentFragment();
    q(df).append("<h1 id='qux'>Affe</h1>");
    this.assertEquals("qux", df.firstChild.id);
  },

  testAppendCollection : function() {
    var test = q.create("<ul><li>Foo</li><li>Bar</li></ul>");
    test.appendTo(this.sandbox[0]);

    var children = q.create('<h2>Hello</h2><span>Affe</span>');
    q("#sandbox li").append(children);
    this.assertEquals(2, q("#sandbox li").has("h2").length);
    this.assertEquals(2, q("#sandbox li").has("span").length);
  },

  testAppendCollectionToDocumentFragment : function() {
    if (!document.createDocumentFragment) {
      this.skip("requires document.createDocumentFragment");
    }

    var df = document.createDocumentFragment();
    var test = q.create("<h1 id='qux'>Affe</h1>");
    test.appendTo(df);
    this.assertEquals("qux", df.firstChild.id);
  },

  testScroll : function()
  {
    var t = q.create('<div id="test" style="overflow:auto; width:50px; height:50px;"><div style="width:150px; height:150px;">AAAAA</div></div>');
    t.appendTo(this.sandbox[0]);
    q("#test").setScrollLeft(50).setScrollTop(50);
    this.assertEquals(50, q("#test").getScrollLeft());
    this.assertEquals(50, q("#test").getScrollTop());
  },

  testAnimateScrollLeft : function()
  {
    var t = q.create('<div id="test" style="overflow:auto; width:50px; height:50px;"><div style="width:150px; height:150px;">AAAAA</div></div>');
    t.appendTo(this.sandbox[0]);
    q("#test").on("animationEnd", function() {
      this.resume(function() {
        this.assertEquals(50, q("#test").getScrollLeft());
      }, this);
    }, this);

    setTimeout(function() {
      q("#test").setScrollLeft(50, 500);
    }, 100);

    this.wait(1500);
  },

  testAnimateScrollTop : function()
  {
    var t = q.create('<div id="test" style="overflow:auto; width:50px; height:50px;"><div style="width:150px; height:150px;">AAAAA</div></div>');
    t.appendTo(this.sandbox[0]);
    q("#test").on("animationEnd", function() {
      this.resume(function() {
        this.assertEquals(50, q("#test").getScrollTop());
      }, this);
    }, this);

    setTimeout(function() {
      q("#test").setScrollTop(50, 500);
    }, 100);

    this.wait(1500);
  },

  "test before with HTML string": function()
  {
    var test = q.create('<p>Affe</p><p>Affe</p>');
    test.appendTo(this.sandbox[0]);
    q("#sandbox p").before('<h2>Juhu</h2>');
    this.assertEquals(2, q("#sandbox h2 + p").length);

    //must be ignored:
    q([window, document]).before("<p>Foo</p>");
  },

  "test before with array of HTML strings": function()
  {
    var test = q.create('<p>Affe</p><p>Affe</p>');
    test.appendTo(this.sandbox[0]);
    q("#sandbox p").before(['<h2>Juhu</h2>', '<h3>Kinners</h3>']);
    this.assertEquals(2, q("#sandbox h2 + h3 + p").length);
  },

  "test before with collection": function()
  {
    var test = q.create('<p>Affe</p><p>Affe</p>');
    test.appendTo(this.sandbox[0]);
    var elements = q.create('<h2>Juhu</h2><h3>Kinners</h3>');
    q("#sandbox p").before(elements);
    this.assertEquals(2, q("#sandbox h2 + h3 + p").length);
  },

  "test before documentFragment" : function() {
    if (!document.createDocumentFragment) {
      this.skip("requires document.createDocumentFragment");
    }

    var test = q.create('<p>Affe</p><p>Affe</p>');
    var df = document.createDocumentFragment();
    test.appendTo(df);
    q(df).appendTo("#sandbox");
    var elements = q.create('<h2>Juhu</h2><h3>Kinners</h3>');
    test.before(elements);
    this.assertEquals(2, q("#sandbox h2 + h3 + p").length);
  },

  "test after with HTML string" : function()
  {
    var test = q.create('<p>Affe</p><p>Affe</p>');
    test.appendTo(this.sandbox[0]);
    q("#sandbox p").after('<h2>Juhu</h2>');
    this.assertEquals(2, q("#sandbox p + h2").length);

    //must be ignored:
    q([window, document]).after("<p>Foo</p>");
  },

  "test after with array of HTML strings": function()
  {
    var test = q.create('<p>Affe</p><p>Affe</p>');
    test.appendTo(this.sandbox[0]);
    q("#sandbox p").after(['<h2>Juhu</h2>', '<h3>Kinners</h3>']);
    this.assertEquals(2, q("#sandbox p + h2 + h3").length);
  },

  "test after with collection": function()
  {
    var test = q.create('<p>Affe</p><p>Affe</p>');
    test.appendTo(this.sandbox[0]);
    var elements = q.create('<h2>Juhu</h2><h3>Kinners</h3>');
    q("#sandbox p").after(elements);
    this.assertEquals(2, q("#sandbox p + h2 + h3").length);
  },

  "test insertAfter with element" : function()
  {
    q.create('<h1>Foo</h1>').
    appendTo("#sandbox");
    q.create('<h2>Bar</h2><h3>Baz</h3>').insertAfter(q("#sandbox h1")[0]);
    this.assertEquals(1, q("#sandbox h1 + h2 + h3").length);

    //must be ignored:
    q([window, document]).insertAfter(q("#sandbox h1")[0]);
  },

  "testInsertAfter with collection" : function()
  {
    q.create('<h1>Foo</h1><h1>Foo</h1>').
    appendTo("#sandbox");
    q.create('<h2>Bar</h2><h3>Baz</h3>').insertAfter("#sandbox h1");
    this.assertEquals(2, q("#sandbox h1 + h2 + h3").length);
  },

  "test insertBefore with element" : function()
  {
    q.create('<h1>Foo</h1>').
    appendTo("#sandbox");
    q.create('<h2>Bar</h2><h3>Baz</h3>').insertBefore(q("#sandbox h1")[0]);
    this.assertEquals(1, q("#sandbox h2 + h3 + h1").length);

    //must be ignored:
    q([window, document]).insertBefore(q("#sandbox h1")[0]);
  },

  "testInsertBefore with collection" : function()
  {
    q.create('<h1>Foo</h1><h1>Foo</h1>').
    appendTo("#sandbox");
    q.create('<h2>Bar</h2><h3>Baz</h3>').insertBefore("#sandbox h1");
    this.assertEquals(2, q("#sandbox h2 + h3 + h1").length);
  },

  "test wrap with HTML string" : function()
  {
    var test = q.create('<span class="baz">Inner</span><span class="baz">Inner</span>')
    .appendTo("#sandbox");
    test.wrap('<div class="foo"><p class="bar"/></div>');
    this.assertEquals(2, q("#sandbox .foo .bar .baz").length);

    //must be ignored:
    q([window, document]).wrap("<div></div>");
  },

  "test wrap with element" : function()
  {
    var test = q.create('<span class="baz">Inner</span><span class="baz">Inner</span>')
    .appendTo("#sandbox");
    var wrapper = q.create('<div class="foo"><p class="bar"/></div>').appendTo('#sandbox');
    test.wrap(wrapper[0]);
    this.assertEquals(2, q("#sandbox .foo .bar .baz").length);
  },

  "test wrap with selector" : function()
  {
    var test = q.create('<span class="baz">Inner</span><span class="baz">Inner</span>')
    .appendTo('#sandbox');
    q.create('<div class="foo"><p class="bar"/></div>').appendTo('#sandbox');
    test.wrap('.foo');
    this.assertEquals(2, q('#sandbox .foo .bar .baz').length);
  },

  "test wrap with list of elements" : function()
  {
    var test = q.create('<span class="baz">Inner</span><span class="baz">Inner</span>')
    .appendTo('#sandbox');
    var wrapper = q.create('<div class="foo"><p class="bar"/></div>').appendTo('#sandbox');
    test.wrap([wrapper[0]]);
    this.assertEquals(2, q('#sandbox .foo .bar .baz').length);
  },

  "test wrap with collection" : function()
  {
    var test = q.create('<span class="baz">Inner</span><span class="baz">Inner</span>')
    .appendTo('#sandbox');
    var wrapper = q.create('<div class="foo"><p class="bar"/></div>').appendTo('#sandbox');
    test.wrap(wrapper);
    this.assertEquals(2, q('#sandbox .foo .bar .baz').length);
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

  testIsRendered : function() {
    this.assertTrue(this.sandbox.isRendered());
    this.assertFalse(q.create("<div>").isRendered());
  },

  testAddElement : function() {
    var test = q.create("<div id='testdiv'/>");
    this.assertEquals(1, test.length);
    test.add(document.body);
    this.assertEquals(2, test.length);
  },

  testAddCollection : function() {
    var test = q.create("<div id='testdiv'/>");
    var toAdd = q.create("<h2>Foo</h2>");
    this.assertEquals(1, test.length);
    test.add(toAdd);
    this.assertEquals(2, test.length);
  },

  testAddDocumentFragment : function() {
    if (!document.createDocumentFragment) {
      this.skip("requires createDocumentFragment");
    }

    var test = q.create("<div id='testdiv'/>");
    var toAdd = document.createDocumentFragment();
    this.assertEquals(1, test.length);
    test.add(toAdd);
    this.assertEquals(2, test.length);
  },

  testAddIllegal : function() {
    var test = q.create("<div id='testdiv'/>")
    .add(window)
    .add(document)
    .add("affe")
    .add(42)
    .add(true)
    .add({});
    this.assertEquals(3, test.length);
  },

  testGetChildren : function() {
    var test = q.create("<div><p>test</p></div>");
    var res = test.getChildren();
    this.assertInstance(res, qxWeb);
    this.assertEquals(1, res.length);
    this.assertEquals(1, test.getChildren()[0].nodeType);
  },

  testGetChildrenSelector : function() {
    var test = q.create("<div><h1/><p/></div>");
    var res = test.getChildren("div");
    this.assertInstance(res, qxWeb);
    this.assertEquals(0, res.length);
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

  testForEachElement : function() {
    var test = q.create("<div/><h1/>").add(window);
    var exec = 0;
    test._forEachElement(function(item) {
      exec++;
      this.assertNotEquals(window, item);
      this.assertEquals(1, item.nodeType);
    }, this);
    this.assertEquals(2, exec);

    exec = 0;
    test._forEachElementWrapped(function(item) {
      exec++;
      this.assertNotEquals(window, item);
      this.assertNotEquals(window, item[0]);
      this.assertInstance(item, qxWeb);
      this.assertEquals(1, item[0].nodeType);
      this.assertEquals(1, item.length);
    }, this);
    this.assertEquals(2, exec);
  },

  testGetParents : function() {
    var test = q.create("<div id='testdiv'/>");
    test.appendTo(this.sandbox[0]);
    var res = test.getParents();
    this.assertInstance(res, qxWeb);
    this.assertEquals(this.sandbox[0], res[0]);
    test.remove();
  },

  testIsChildOf : function(){
    var test = q.create("<div id='testdiv'><div id='testchild'><div id='testchild2'></div></div><div>");
    test.appendTo(this.sandbox[0]);
    this.assertTrue(q("#testchild").isChildOf(test));
    this.assertTrue(q("#testchild2").isChildOf(test));
    this.assertTrue(q("#testchild2").isChildOf(q("#testchild")));
    this.assertTrue(test.isChildOf(q(this.sandbox)));
    this.assertTrue(test.find("div").isChildOf(q("#testchild")));
    test.remove();
  },

  testGetParentsSelector : function() {
    var test = q.create("<a id='parent'><div id='test'/></a>");
    test.appendTo(this.sandbox[0]);
    var parent = q("#parent");
    var res = q("#test").getParents("a");
    this.assertInstance(res, qxWeb);
    this.assertEquals(parent[0], res[0], "Element mismatch");
    this.assertEquals(0, q("#test").getParents("div").length);
    test.remove();
  },

  testGetAncestors : function() {
    var test = q.create('<div id="ancestor"><div id="parent"><div id="child"></div></div></div>');
    test.appendTo(this.sandbox[0]);
    var ancestors = q("#child").getAncestors();
    this.assertInstance(ancestors, qxWeb);
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
    this.assertInstance(ancestors, qxWeb);
    this.assertEquals(3, ancestors.length);
    this.assertEquals("parent", ancestors[0].id);
    this.assertEquals("sandbox", ancestors[2].id);
    test.remove();
  },

  testGetAncestorsUntil : function() {
    var test = q.create('<div id="ancestor"><div id="parent"><div id="child"></div></div></div>');
    test.appendTo(this.sandbox[0]);
    var ancestors = q("#child").getAncestorsUntil("body");
    this.assertInstance(ancestors, qxWeb);
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
    var res = q("#test").getClosest("a");
    this.assertInstance(res, qxWeb);
    this.assertEquals(1, res.length, "Ancestor not found");
    this.assertEquals(1, q("#test").getClosest("#test").length, "Self not found");
    this.assertEquals(0, q("#test").getClosest("#no").length, "Found unexpected");
    test.remove();
  },

  testFilter : function() {
    var test = q.create("<div id='test' class='item'/><div class='item'/>");
    test.appendTo(this.sandbox[0]);
    var collection = q(".item");
    this.assertEquals(q("#test")[0], collection.filter("#test")[0], "Element mismatch");
    var res = collection.filter("#test");
    this.assertInstance(res, qxWeb);
    this.assertEquals(1, res.length);
    test.remove();
  },

  testFilterSelector : function() {
    var col = q([]);
    var test = q.create("<div id='test' class='item'/>");
    var other = q.create("<div class='item'/>");
    col.add(test[0]);
    col.add(other[0]);
    this.assertEquals(test[0], col.filter("#test")[0], "Element mismatch");
    var res = col.filter("#test");
    this.assertInstance(res, qxWeb);
    this.assertEquals(1, res.length);
    this.assertEquals(2, col.filter("div").length);
  },

  testFilterFunction : function() {
    var test = q.create("<div id='test' class='item'/><div class='item'/>");
    test.appendTo(this.sandbox[0]);
    var collection = q(".item");
    this.assertEquals(q("#test")[0], collection.filter(function(item) {
      return item.id == "test";
    })[0], "Element mismatch");
    var res = collection.filter("#test");
    this.assertInstance(res, qxWeb);
    this.assertEquals(1, res.length);
    test.remove();
  },

  testFind : function() {
    var test = q.create("<div id='outer'><div><div id='test'/><div/></div></div>");
    test.appendTo(this.sandbox[0]);
    var res = q("#outer").find("div");
    this.assertInstance(res, qxWeb);
    this.assertEquals(3, res.length);
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
    this.assertInstance(contents, qxWeb);
    this.assertEquals(2, contents.length);
    this.assertEquals(1, contents[0].nodeType);
    this.assertEquals(1, contents[1].nodeType);
    test.remove();

    //must be ignored:
    q(window).getContents();
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
    var res = q(".test li").eq(1);
    this.assertInstance(res, qxWeb);
    this.assertEquals("b", res[0].id);
    this.assertEquals("b", q(".test li").eq(-2)[0].id);
    test.remove();
  },

  testGetFirst : function() {
    var html = '<p id="first" class="foo">Affe</p><h2 class="foo">Juhu</h2><div class="foo">Hugo</div>';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    var res = q(".foo").getFirst();
    this.assertInstance(res, qxWeb);
    this.assertEquals(1, res.length);
    this.assertEquals(document.getElementById("first"), q(".foo").getFirst()[0]);
    test.remove();
  },

  testGetLast : function() {
    var html = '<p class="foo">Affe</p><h2 class="foo">Juhu</h2><div id="last" class="foo">Hugo</div>';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    var res = q(".foo").getLast();
    this.assertInstance(res, qxWeb);
    this.assertEquals(1, res.length);
    this.assertEquals(document.getElementById("last"), q(".foo").getLast()[0]);
    test.remove();
  },

  testHas : function() {
    var html = '<ul class="test">'+
    '  <li>Foo</li>' +
    '  <li id="target1"><a class="affe" href="#">Bar</a></li>' +
    '  <li>Baz</li>' +
    '</ul>' +
    '<ul class="test">' +
    '  <li>Foo</li>' +
    '  <li id="target2"><a class="affe" href="#">Bar</a></li>' +
    '  <li>Baz</li>' +
    '</ul>';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    this.assertEquals(6, q(".test li").length);
    var res = q(".test li").has(".affe");
    this.assertInstance(res, qxWeb);
    this.assertEquals(2, res.length);
    this.assertEquals("target1", q(".test li").has(".affe")[0].id);
    this.assertEquals("target2", q(".test li").has(".affe")[1].id);
    test.remove();
    this.assertEquals(0, q(window).has("body").length);
  },

  testGetNext : function() {
    var html = '<p class="test" id="foo">foo</p>\nText\n<p id="bar">bar</p><p id="baz">baz</p>';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    var testNext = q(".test").getNext();
    this.assertInstance(testNext, qxWeb);
    this.assertEquals(1, testNext.length);
    this.assertEquals("bar", q("#foo").getNext()[0].id);

    // check for null next
    this.assertEquals(0, test.eq(3).getNext().length);
    test.remove();
  },

  testGetNextWithSelector : function() {
    var html = '<div>a</div><p>f</p><div>f</div><p class="foo">e</p> ';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    var testNext = q("#sandbox div").getNext(".foo");
    this.assertEquals(1, testNext.length);
    this.assertInstance(testNext, qxWeb);
    this.assertEquals("foo", q("#sandbox div").getNext(".foo")[0].className);
    test.remove();
  },

  testGetNextAll : function() {
    var html = '<div><span id="test">a</span><span>f</span><span id="foo">f</span></div><p>foo</p>';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    var testNext = q("#test").getNextAll();
    this.assertInstance(testNext, qxWeb);
    this.assertEquals(2, testNext.length);
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
    this.assertInstance(res, qxWeb);
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
    var testPrev = q("#baz").getPrev();
    this.assertInstance(testPrev, qxWeb);
    this.assertEquals(1, testPrev.length);
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
    this.assertInstance(res, qxWeb);
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
    var res = q("#test").getPrevAll();
    this.assertInstance(res, qxWeb);
    this.assertEquals(2, res.length);
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
    this.assertInstance(res, qxWeb);
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
    this.assertInstance(res, qxWeb);
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
    this.assertInstance(res, qxWeb);
    this.assertEquals(3, res.length);
    this.assertEquals(0, q.$$qx.bom.Selector.matches(".foo", res));
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
    this.assertInstance(res, qxWeb);
    this.assertEquals(3, res.length);
    this.assertEquals(0, q.$$qx.bom.Selector.matches(".foo", res));
    test.remove();
  },

  testGetOffsetParent : function() {
    var html = '<div><p class="foo">affe</p></div><div id="fixed" style="position:fixed"><p class="foo">affe</p></div>';
    var test = q.create(html);
    test.appendTo(this.sandbox[0]);
    var res = q(".foo").getOffsetParent();
    this.assertInstance(res, qxWeb);
    this.assertEquals(2, res.length);
    this.assertEquals(document.body, res[0]);
    this.assertEquals(document.getElementById("fixed"), res[1]);
    test.remove();
  },

  testIsElement : function()
  {
    this.assertTrue(q.isElement(document.body));
    this.assertTrue(q.isElement(q("#sandbox")[0]));
    this.assertTrue(q.isElement(q("#sandbox")));
    this.assertTrue(q.isElement("#sandbox"));
    this.assertFalse(q.isElement({}));
    q.create('<span id="affe">text</span>').appendTo(this.sandbox[0]);
    this.assertFalse(q.isElement(q("#sandbox #affe")[0].firstChild));
  },

  testIsNode : function()
  {
    this.assertTrue(q.isNode(document));
    this.assertTrue(q.isNode(q("#sandbox")[0]));
    this.assertTrue(q.isNode(q("#sandbox")));
    this.assertTrue(q.isNode("#sandbox"));
    this.assertFalse(q.isNode({}));
    q.create('<span id="affe">text</span>').appendTo(this.sandbox[0]);
    this.assertTrue(q.isNode(q("#sandbox #affe")[0].firstChild));
    this.assertTrue(q.isNode(document.createAttribute("id")));
  },

  testIsDocument : function()
  {
    this.assertTrue(q.isDocument(document));
    this.assertFalse(q.isDocument(q("#sandbox")[0]));
    this.assertFalse(q.isDocument({}));
  },

  testGetWindow : function()
  {
    this.assertEquals(window, q.getWindow(q("#sandbox")[0]));
    this.assertEquals(window, q.getWindow(q("#sandbox")));
    this.assertEquals(window, q.getWindow(q("#sandbox")[0]));
  },

  testIsWindow : function()
  {
    this.assertTrue(q.isWindow(window));
    this.assertTrue(q.isWindow(q(window)));
    this.assertFalse(q.isWindow(document));
    this.assertFalse(q.isWindow(document.body));
  },

  testGetDocument : function()
  {
    this.assertEquals(document, q.getDocument(q("#sandbox")[0]));
    this.assertEquals(document, q.getDocument(q("#sandbox")));
    this.assertEquals(document, q.getDocument("#sandbox"));
    this.assertEquals(document, q.getDocument(window));
    this.assertEquals(document, q.getDocument(document));
  },

  testGetNodeName : function()
  {
    this.assertEquals("html", q.getNodeName(document.documentElement));
    this.assertEquals("div", q.getNodeName("#sandbox"));
    this.assertEquals("div", q.getNodeName(q("#sandbox")));
    this.assertEquals("div", q.getNodeName(q("#sandbox")[0]));
  },

  testGetNodeText : function()
  {
    this.assertEquals("monkeycheese", q.getNodeText(q.create("<div>monkey<p>cheese</p></div>")[0]));
    this.assertEquals("monkeycheese", q.getNodeText(q.create("<div>monkey<p>cheese</p></div>")));
    q("#sandbox").setHtml("monkeycheese");
    this.assertEquals("monkeycheese", q.getNodeText("#sandbox"));
  },

  testIsBlockNode : function()
  {
    this.assertTrue(q.isBlockNode(document.createElement("p")));
    this.assertTrue(q.isBlockNode("#sandbox"));
    this.assertTrue(q.isBlockNode(q("#sandbox")));
    this.assertFalse(q.isBlockNode(document.createElement("span")));
  },

  testIsNodeName : function()
  {
    this.assertTrue(q.isNodeName(document.createElement("p"), "p"));
    this.assertTrue(q.isNodeName(q("#sandbox"), "div"));
    this.assertTrue(q.isNodeName("#sandbox", "div"));
    this.assertTrue(q.isNodeName(document.createTextNode("bla"), "#text"));
  },

  testIsTextNode : function()
  {
    this.assertTrue(q.isTextNode(document.createTextNode("bla")));
    this.assertFalse(q.isTextNode(document.createElement("p")));
  },

  testEqualNodes : function()
  {
    // same node
    var node1 = q("#sandbox");
    var node2 = "#sandbox";
    this.assertTrue(q.equalNodes(node1, node2));

    // same node types/names
    node1 = q.create("<div>");
    node2 = q.create("<div>");
    this.assertTrue(q.equalNodes(node1, node2));

    // different node types
    node1 = q.create("<p>Foo</p>")[0];
    node2 = q.create("<p>Foo</p>")[0].firstChild;
    this.assertFalse(q.equalNodes(node1, node2));

    // different node names
    node1 = q.create("<div class='foo'>");
    node2 = q.create("<h2 class='foo'>");
    this.assertFalse(q.equalNodes(node1, node2));

    // same attributes/values
    node1 = q.create("<div style='display:block' class='foo'>");
    node2 = q.create("<div style='display:block' class='foo'>");
    this.assertTrue(q.equalNodes(node1, node2));

    // same attributes/different values
    node1 = q.create("<div class='foo' style='display:block'>");
    node2 = q.create("<div class='foo' style='display:none'>");
    this.assertFalse(q.equalNodes(node1, node2));

    // same attributes/values in different order
    node1 = q.create("<div class='foo' style='display:block'>");
    node2 = q.create("<div style='display:block' class='foo'>");
    this.assertTrue(q.equalNodes(node1, node2));

    // different attributes length
    node1 = q.create("<img src='foo.png' class='bar'>");
    node2 = q.create("<img src='foo.png'>");
    this.assertFalse(q.equalNodes(node1, node2));

    // same children
    node1 = q.create("<div class='foo'><p class='bar'>Foo</p></div>");
    node2 = q.create("<div class='foo'><p class='bar'>Foo</p></div>");
    this.assertTrue(q.equalNodes(node1, node2));

    // different children
    node1 = q.create("<div class='foo'><p class='bar'>Foo</p></div>");
    node2 = q.create("<div class='foo'><p class='baz'>Foo</p></div>");
    this.assertFalse(q.equalNodes(node1, node2));

    // same children in different order
    node1 = q.create("<div><h2>Foo</h2><p>Bar</p></div>");
    node2 = q.create("<div><p>Bar</p><h2>Foo</h2></div>");
    this.assertFalse(q.equalNodes(node1, node2));

    // different children lengths
    node1 = q.create("<div><p>Foo</p></div>");
    node2 = q.create("<div><p>Foo</p><p>Foo</p></div>");
    this.assertFalse(q.equalNodes(node1, node2));

  },


  testContains : function() {
    this.sandbox.append("<h2 class='foo'>Foo</h2>");

    this.assertEquals(1, qxWeb(document.documentElement).contains(document.body).length);
    this.assertEquals(1, this.sandbox.contains(q("#sandbox .foo")[0]).length);
    this.assertEquals(0, this.sandbox.contains(window).length);

    this.assertEquals(1, this.sandbox.contains(q("#sandbox .foo")).length);
    this.assertEquals(0, this.sandbox.contains(q("#sandbox .nope")).length);

    this.sandbox.push(window);
    this.sandbox.push(q.create("<div>")[0]);
    this.assertEquals(2, this.sandbox.contains(q("#sandbox .foo")).length);
    this.assertEquals(0, this.sandbox.contains(q("#sandbox .nope")).length);
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

    this.assertNull(q(window).getStyle("padding-top"));
    this.assertNull(q(document).getStyle("padding-top"));

    // must be ignored:
    q([window, document]).setStyle("padding-right", "10px");
    this.assertNull(q(window).getStyle("padding-right"));
    this.assertNull(q(document).getStyle("padding-right"));
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

  testSpecialProperties : function() {
    var props = {
      "css.appearance" : ["appearance", "searchfield"],
      "css.textoverflow" : ["textOverflow", "ellipsis"],
      "css.userselect" : ["userSelect", q.env.get("css.userselect.none")],
      "css.float" : ["float", "right"],
      "css.usermodify" : ["userModify", "read-only"],
      "css.boxsizing" : ["boxSizing", "border-box"]
    }

    for (var envKey in props) {
      var style = props[envKey][0];
      var envVal = q.env.get(envKey);
      if (!envVal) {
        continue;
      }
      var value = props[envKey][1];
      var test = q.create("<div>affe</div>").appendTo(this.sandbox[0])
      .setStyle(style, value);

      this.assertEquals(value, test.getStyle(style));
    }
  },

  testClass : function() {
    var test = q.create("<div/><div/>");
    test.addClass("test");
    this.assertEquals("test", test.getAttribute("class"));
    this.assertEquals("test", test.eq(1).getAttribute("class"));
    this.assertEquals("test", test.getClass());
    this.assertTrue(test.eq(0).hasClass("test"));
    this.assertTrue(test.eq(1).hasClass("test"));
    test.toggleClass("test");
    this.assertFalse(test.eq(0).hasClass("test"));
    this.assertFalse(test.eq(1).hasClass("test"));
    this.assertEquals("", test.getClass());
    test.toggleClass("test");
    this.assertTrue(test.eq(0).hasClass("test"));
    this.assertTrue(test.eq(1).hasClass("test"));
    this.assertEquals("test", test.getClass());
    test.removeClass("test");
    this.assertFalse(test.eq(0).hasClass("test"));
    this.assertFalse(test.eq(1).hasClass("test"));
    this.assertEquals("", test.getClass());
    test.addClass("test");
    test.replaceClass("test", "foo");
    this.assertFalse(test.eq(0).hasClass("test"));
    this.assertFalse(test.eq(1).hasClass("test"));
    this.assertTrue(test.eq(0).hasClass("foo"));
    this.assertTrue(test.eq(1).hasClass("foo"));
    this.assertEquals("foo", test.getClass());

    // must be ignored:
    q([window, document]).addClass("test");
    this.assertEquals("", q(window).getClass("test"));
    this.assertEquals("", q(document).getClass("test"));
    this.assertFalse(q(window).hasClass("test"));
    this.assertFalse(q(document).hasClass("test"));
    q([window, document]).removeClass("test");
    q([window, document]).replaceClass("foo", "bar");
    q([window, document]).toggleClass("bar");
  },

  testClasses : function() {
    var test = q.create("<div/><div/>");
    test.addClasses(["foo", "bar"]);
    this.assertTrue(test.eq(0).hasClass("foo"));
    this.assertTrue(test.eq(0).hasClass("foo"));
    this.assertTrue(test.eq(1).hasClass("bar"));
    this.assertTrue(test.eq(1).hasClass("bar"));
    this.assertEquals("foo bar", test.getClass());
    test.toggleClass("bar");
    this.assertTrue(test.eq(0).hasClass("foo"));
    this.assertFalse(test.eq(0).hasClass("bar"));
    this.assertTrue(test.eq(1).hasClass("foo"));
    this.assertFalse(test.eq(1).hasClass("bar"));
    this.assertEquals("foo", test.getClass());
    test.addClass("bar");
    test.removeClasses(["foo", "bar"]);
    this.assertFalse(test.eq(0).hasClass("foo"));
    this.assertFalse(test.eq(0).hasClass("bar"));
    this.assertFalse(test.eq(1).hasClass("foo"));
    this.assertFalse(test.eq(1).hasClass("bar"));
    this.assertEquals("", test.getClass());
    test.addClass("bar");
    test.toggleClasses(["foo", "bar", "baz"]);
    this.assertTrue(test.eq(0).hasClass("foo"));
    this.assertFalse(test.eq(0).hasClass("bar"));
    this.assertTrue(test.eq(0).hasClass("baz"));
    this.assertTrue(test.eq(1).hasClass("foo"));
    this.assertFalse(test.eq(1).hasClass("bar"));
    this.assertTrue(test.eq(1).hasClass("baz"));
    this.assertMatch(test.getClass(), "foo baz");

    // must be ignored:
    q([window, document]).addClasses(["foo", "bar"]);
    q([window, document]).removeClasses(["foo", "bar"]);
    q([window, document]).toggleClasses(["foo", "bar", "baz"]);
  },

  testGetHeightElement : function() {
    var test = q.create("<div style='height: 100px'></div><div></div>");
    test.appendTo(this.sandbox[0]);
    this.assertNumber(test.getHeight());
    this.assertEquals(100, test.getHeight());
    test.remove();
  },

  testGetHeightNonDisplayedElement : function() {
    var test = q.create("<div style='display: none; height: 100px'></div><div></div>");
    test.appendTo(this.sandbox[0]);
    this.assertNumber(test.getHeight(true));
    this.assertEquals(100, test.getHeight(true));
    test.remove();
  },

  testGetHeightDocument : function() {
    this.assertNumber(q(document).getHeight());
  },

  testGetHeightWindow : function() {
    this.assertNumber(q(window).getHeight());
  },

  testGetWidthElement : function() {
    var test = q.create("<div style='width: 100px'></div><div></div>");
    test.appendTo(this.sandbox[0]);
    this.assertNumber(test.getWidth());
    this.assertEquals(100, test.getWidth());
    test.remove();
  },

  testGetWidthNonDisplayedElement : function() {
    var test = q.create("<div style='display: none; width: 100px'></div><div></div>");
    test.appendTo(this.sandbox[0]);
    this.assertNumber(test.getWidth(true));
    this.assertEquals(100, test.getWidth(true));
    test.remove();
  },

  testGetWidthDocument : function() {
    this.assertNumber(q(document).getWidth());
  },

  testGetWidthWindow : function() {
    this.assertNumber(q(window).getWidth());
  },

  testGetOffset : function() {
    var test = q.create("<div style='position: absolute; top: 100px'></div><div></div>");
    test.appendTo(this.sandbox[0]);
    this.assertNumber(test.getOffset().top);
    this.assertNumber(test.getOffset().right);
    this.assertNumber(test.getOffset().bottom);
    this.assertNumber(test.getOffset().left);
    this.assertEquals(100, test.getOffset().top);
    this.assertNull(q(window).getOffset());
    this.assertNull(q(document).getOffset());
  },

  testGetContentHeight : function() {
    var test = q.create("<div id='test'></div>").setStyles({
      position: "absolute",
      height: "200px",
      padding: "50px" });
    test.appendTo(this.sandbox[0]);

    this.assertEquals(200, test.getContentHeight());
  },

  testGetContentHeightNonDisplayedElement : function() {
    var test = q.create("<div id='test'></div>").setStyles({
      position: "absolute",
      height: "200px",
      padding: "50px",
      display: "none" });
    test.appendTo(this.sandbox[0]);

    this.assertEquals(200, test.getContentHeight(true));
  },

  testGetContentWidth : function() {
    var test = q.create("<div id='test'></div>").setStyles({
      position: "absolute",
      width: "200px",
      padding: "50px" });
    test.appendTo(this.sandbox[0]);

    this.assertEquals(200, test.getContentWidth());
  },

  testGetContentWidthNonDisplayedElement : function() {
    var test = q.create("<div id='test'></div>").setStyles({
      position: "absolute",
      width: "200px",
      padding: "50px",
      display: "none" });
    test.appendTo(this.sandbox[0]);

    this.assertEquals(200, test.getContentWidth(true));
  },

  testGetPosition : function()
  {
    var outer = q.create('<div id="outer"></div>').setStyles({
      padding: 0,
      backgroundColor: "red",
      position: "absolute",
      top: "0px",
      left: "0px"
    }).appendTo(this.sandbox[0]);

    var test = q.create('<div id="affe"></div>').setStyles({
      margin: "10px"
    }).appendTo(outer[0]);

    var pos = test.getPosition();
    this.assertEquals(10, pos.left);
    this.assertEquals(10, pos.top);
  },

  testIncludeStylesheet : function()
  {
    var styleSheet = "./style2.css";
    q.includeStylesheet(styleSheet);
    q.create('<div id="affe"></div>').appendTo(this.sandbox[0]);

    var self = this;
    window.setTimeout(function() {
      self.resume(function() {
        var val;
        if (typeof window.getComputedStyle == "function") {
          var compStyle = window.getComputedStyle(q("#sandbox #affe")[0], null);
          val = compStyle.borderTopWidth;
        }
        else {
          val = q("#sandbox #affe").getStyle("border-top-width");
        }
        this.assertEquals("1px", val);
      }, self);
    }, 250);

    this.wait(500);
  },

  testHideShow : function()
  {
    var test = q.create('<div style="display: inline">Yoohoo</div>')
    .appendTo(this.sandbox[0]);
    test.hide();
    this.assertEquals("none", test.getStyle("display"));
    test.show();
    this.assertEquals("inline", test.getStyle("display"));

    // no previous value:
    var test2 = q.create('<span style="display: none">Yoohoo</span>')
    .appendTo(this.sandbox[0]);
    test2.show();
    this.assertEquals("inline", test2.getStyle("display"));

    // must be ignored:
    q([window, document]).hide().show();
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

    // must be ignored:
    q(window).setHtml("no way");
    q(document).setHtml("no way");
    this.assertNull(q(window).getHtml());
    this.assertNull(q(document).getHtml());

    this.sandbox.setHtml("<div id='one'/><div id='two'></div>");
    this.assertEquals(0, q("#sandbox > #one > #two").length);
    this.assertEquals(1, q("#sandbox > #two").length);
  },

  testAttribute : function() {
    var test = q.create("<div/>");
    test.setAttribute("id", "affe");
    this.assertEquals("affe", test[0].getAttribute("id"));
    this.assertEquals("affe", test.getAttribute("id"));
    test.removeAttribute("id");
    this.assertNull(test[0].getAttribute("id"));
    this.assertNull(test.getAttribute("id"));

    // must be ignored:
    q([window, document]).setAttribute("id", "affe");
    this.assertNull(q(window).getAttribute("id"));
    this.assertNull(q(document).getAttribute("id"));
    q([window, document]).removeAttribute("id");
  },

  testAttributes : function() {
    var test = q.create("<div/>");
    test.setAttributes({"id": "affe", "x": "y"});
    this.assertEquals("affe", test[0].getAttribute("id"));
    this.assertEquals("affe", test.getAttributes(["id", "x"]).id);
    this.assertEquals("y", test.getAttributes(["id", "x"]).x);
    test.removeAttributes(["id", "x"]);
    this.assertNull(test.getAttributes(["id", "x"]).id);
    this.assertNull(test.getAttributes(["id", "x"]).x);
  },

  testProperty : function() {
    var test = q.create("<div/>");
    test.setProperty("affe", "AFFE");
    this.assertEquals("AFFE", test[0].affe);
    this.assertEquals("AFFE", test.getProperty("affe"));
    test.removeProperty("affe");
    this.assertUndefined(test.getProperty("affe"));
  },

  testProperties : function() {
    var test = q.create("<div/>");
    test.setProperties({"affe": "AFFE", "x": "y"});
    this.assertEquals("AFFE", test[0].affe);
    this.assertEquals("AFFE", test.getProperties(["affe", "x"]).affe);
    this.assertEquals("y", test.getProperties(["affe", "x"]).x);
    test.removeProperties(["affe", "x"]);
    this.assertUndefined(test.getProperty("affe"));
    this.assertUndefined(test.getProperty("x"));
  },

  testGetSetValue : function()
  {
    q.create('<input type="text" value="affe"/>' +
      '<input type="checkbox" value="affe"/>' +
      '<select id="single"><option value="foo">Foo</option><option selected="selected" value="affe">Affe</option></select>')
    .appendTo(this.sandbox[0]);

    q.create('<select id="multiple" multiple="multiple">' +
        '<option selected="selected" value="foo">Foo</option>' +
        '<option value="bar">Bar</option>' +
        '<option selected="selected" value="baz">Baz</option>' +
        '<option value="boing">Boing</option>' +
      '</select>')
    .appendTo(this.sandbox[0]);

    this.assertEquals("affe", q("#sandbox input[type=text]").getValue());
    this.assertEquals("affe", q("#sandbox input[type=checkbox]").getValue());
    this.assertEquals("affe", q("#sandbox select").getValue());
    this.assertArrayEquals(["foo", "baz"], q("#multiple").getValue());

    q("#sandbox input").setValue("fnord");
    // setting the same value again sets the 'checked' attribute
    q("#sandbox input[type=checkbox]").setValue("affe");
    q("#sandbox select").setValue("foo");
    q("#multiple").setValue(["bar", "boing"]);

    this.assertEquals("fnord", q("#sandbox input[type=text]").getValue());
    this.assertTrue(q("#sandbox input[type=checkbox]").getAttribute("checked"));
    this.assertEquals("foo", q("#sandbox select").getValue());
    this.assertArrayEquals(["bar", "boing"], q("#multiple").getValue());

    // must not throw exceptions:
    q(window).setValue("no way");
    q(document).setValue("no way");
    this.assertNull(q(document).getValue());
    this.assertNull(q(window).getValue());
  }
});



testrunner.define({
  classname : "Animation",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testFadeOut : function() {
    var test = q.create("<div id='testdiv'/>");
    test.appendTo(this.sandbox[0]);
    test.fadeOut();
    test.on("animationEnd", function() {
      this.resume(function() {
        this.assertEquals("none", test[0].style["display"]);
        test.remove();
      }, this);
    }, this);
    this.wait();
  },

  testFadeIn : function() {
    var testValue = (qxWeb.env.get("browser.name") === "ie" &&
                     qxWeb.env.get("browser.version") <= 9) ? 0.99 : 1;

    var test = q.create("<div id='testdiv'/>");
    test.appendTo(this.sandbox[0]);
    test.fadeIn();
    test.on("animationEnd", function() {
      this.resume(function() {
        this.assertEquals(testValue, test.getStyle("opacity"), "not visible after the animation");
        test.remove();
      }, this);
    }, this);
    this.wait();
  },

  testFadeInWithInvisibleElement : function() {
    var testValue = (qxWeb.env.get("browser.name") === "ie" &&
                     qxWeb.env.get("browser.version") <= 9) ? 0.99 : 1;

    var styleSheet = "./style2.css";
    q.includeStylesheet(styleSheet);

    var test = q.create('<div id="invisible"></div>');
    test.appendTo(this.sandbox[0]);
    test.fadeIn();

    test.on('animationEnd', function() {
      this.resume(function() {
        this.assertEquals(testValue, test.getStyle('opacity'), 'not visible after the animation');
        test.remove();
      }, this);
    }, this);

    this.wait();
  },

  tearDownTestFadeInWithInvisibleElement : function() {
    var sheets = [].filter.call(document.styleSheets, function(sheet) {
      return sheet.href && sheet.href.indexOf("style2.css") != -1;
    });
    sheets.length > 0 && q(sheets[0].ownerNode).remove();
  },

  testNewCollectionPlaying : function () {
    var test = q.create("<div id='testdiv'/>");
    test.appendTo(this.sandbox[0]);
    test.fadeIn();
    this.assertTrue(q("#testdiv").isPlaying());
  },

  testNonElement : function() {
    // non-element node objects should be ignored (no error)
    q(window, document).fadeOut();
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

  testOnOffEmitWithoutContext : function() {
    var test = q.create("<div/>");
    var self = this;
    var called = 0;
    var listener = function(data) {
      self.assertEquals(sendData, data);
      called++;
    };
    test.on("changeName", listener);
    var sendData = {a: 12};
    test.emit("changeName", sendData);
    this.assertEquals(1, called);

    test.off("changeName", listener);
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

    var test2 = q(test[0]);
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


  testOnceWith3 : function() {
    var test = q.create("<div/>");
    var self = this;
    var called = 0;
    var listener = function() {
      called++;
    };
    test.once("changeName", listener);
    test.once("changeName", listener);
    test.once("changeName", listener);

    test.emit("changeName");
    this.assertEquals(3, called);
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

  testHasListener : function()
  {
    var test = q.create('<div></div>').appendTo("#sandbox");
    this.assertFalse(test.hasListener("mousedown"));
    var cb = function() {};
    test.on("mousedown", cb);
    this.assertTrue(test.hasListener("mousedown"));
    test.off("mousedown", cb);
    this.assertFalse(test.hasListener("mousedown"));
  },

  testHasListenerWithHandler : function() {
    var test = q.create('<div></div>').appendTo("#sandbox");
    var cb = function() {};
    test.on("mousedown", cb);
    this.assertTrue(test.hasListener("mousedown", cb));
    this.assertFalse(test.hasListener("mousedown", function() {}));
    test.off("mousedown", cb);
    this.assertFalse(test.hasListener("mousedown", cb));

    var ctx = {};
    test.on("mousedown", cb, ctx);
    this.assertTrue(test.hasListener("mousedown", cb));
    this.assertFalse(test.hasListener("mousedown", function() {}));
    test.off("mousedown", cb, ctx);
    this.assertFalse(test.hasListener("mousedown", cb));
  },

  testHasListenerWithContext : function() {
    var test = q.create('<div></div>').appendTo("#sandbox");
    var cb = function() {};
    var ctx = {};

    test.on("mousedown", cb, ctx);
    this.assertTrue(test.hasListener("mousedown", cb, ctx));
    this.assertFalse(test.hasListener("mousedown", cb, {}));
    test.off("mousedown", cb, ctx);
    this.assertFalse(test.hasListener("mousedown", cb, ctx));
  },

  testContext : function()
  {
    if (!qx.core.Environment.get("event.dispatchevent")) {
      this.skip("Requires dispatchEvent");
    }
    window.temp = null;
    q.create('<input type="text" id="one"></input><input type="text" id="two"></input>')
    .on("mousedown", function(ev) {
      window.temp = this.getAttribute("id");
    }).appendTo("#sandbox");

    window.setTimeout(function() {
      var event = new qx.event.type.dom.Custom("mousedown");
      q("#sandbox #one")[0].dispatchEvent(event);
    }, 100);

    this.wait(200, function() {
      this.assertEquals("one", window.temp);
    }, this);
  },

  testReady : function()
  {
    var ctx = {
      ready : 0
    };
    var callback = function() {
      this.ready++;
    };

    window.setTimeout(function() {
      q.ready(callback.bind(ctx));
    }, 100);

    this.wait(200, function() {
      this.assertEquals(1, ctx.ready);
    }, this);
  },

  testAllOffWithType : function() {
    var test = q.create('<h1>Foo</h1><div></div>').appendTo("#sandbox");
    test.eq(0).on("mouseup", function() {});
    test.eq(1).on("mousedown", function() {});
    test.allOff("mousedown");
    this.assertTrue(test.eq(0).hasListener("mouseup"));
    this.assertFalse(test.eq(1).hasListener("mousedown"));
  },

  testAllOff : function() {
    var test = q.create('<h1>Foo</h1><div></div>').appendTo("#sandbox");
    test.eq(0).on("mouseup", function() {});
    test.eq(1).on("mousedown", function() {});
    test.allOff();
    this.assertFalse(test.eq(0).hasListener("mouseup"));
    this.assertFalse(test.eq(1).hasListener("mousedown"));
  }
});


testrunner.define({
  classname : "event.Normalization",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  __registerNormalization : function(type, normalizer) {
    q.define("EventNormalize" + Date.now(), {
      statics :
      {
        normalize : normalizer
      },
      defer : function(statics)
      {
        q.$registerEventNormalization(type, statics.normalize);
      }
    });
  },

  testNormalization : function()
  {
    if (!qx.core.Environment.get("event.dispatchevent")) {
      this.skip("Requires dispatchEvent");
    }
    var normalizer0 = function(event) {
      event.affe = "juhu";
      return event;
    };
    this.__registerNormalization("mousedown", normalizer0);

    var normalizer1 = function(event) {
      event.affe += " hugo";
      return event;
    };
    this.__registerNormalization("mousedown", normalizer1);

    var normalizer2 = function(event) {
      event.affe += " affe";
      return event;
    };

    this.__registerNormalization("mousedown", normalizer2);

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
    test.on("mousedown", callback, obj);

    q.$unregisterEventNormalization("mousedown", normalizer1);

    window.setTimeout(function() {
      var event = new qx.event.type.dom.Custom("mousedown");
      test[0].dispatchEvent(event);
    }, 100);

    this.wait(function() {
      q.$unregisterEventNormalization("mousedown", normalizer0);
      this.assert(obj.normalized, "Event was not manipulated!");
      q.$unregisterEventNormalization("mousedown", normalizer2);
    }, 200, this);
  },

  testNormalizationWildcard : function() {
    if (!qx.core.Environment.get("event.dispatchevent")) {
      this.skip("Requires dispatchEvent");
    }
    var normalizer = function(event) {
      event.affe = "juhu";
      return event;
    };
    this.__registerNormalization("*", normalizer);

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
    test.on("mousedown", callback, obj1);
    test.on("mouseup", callback, obj2);

    window.setTimeout(function() {
      var down = new qx.event.type.dom.Custom("mousedown");
      test[0].dispatchEvent(down);
      var up = new qx.event.type.dom.Custom("mouseup");
      test[0].dispatchEvent(up);
    }, 100);

    this.wait(function() {
      this.assert(obj1.normalized, "Event was not manipulated!");
      this.assert(obj2.normalized, "Event was not manipulated!");
      q.$unregisterEventNormalization("*", normalizer);
    }, 200, this);
  },

  __normalizeMouse : null,

  testNormalizationForMultipleTypes : function() {
    if (!qx.core.Environment.get("event.dispatchevent")) {
      this.skip("Requires dispatchEvent");
    }

    this.__normalizeMouse = function(event) {
      event.affe = "juhu";
      return event;
    };
    this.__registerNormalization(["mousedown", "mouseup"], this.__normalizeMouse);

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
    test.on("mousedown", callback, obj1);
    test.on("mouseup", callback, obj2);

    window.setTimeout(function() {
      var event = new qx.event.type.dom.Custom("mousedown");
      test[0].dispatchEvent(event);
    }, 100);

    window.setTimeout(function() {
      var event = new qx.event.type.dom.Custom("mouseup");
      test[0].dispatchEvent(event);
    }, 250);

    this.wait(function() {
      this.assert(obj1.normalized, "Mousedown event was not manipulated!");
      this.assert(obj2.normalized, "Mouseup event was not manipulated!");
    }, 500, this);
  },

  tearDownTestNormalizationForMultipleTypes : function() {
    var registry = q.$getEventNormalizationRegistry();
    var before = registry["mousedown"].length + registry["mouseup"].length;
    q.$unregisterEventNormalization(["mousedown", "mouseup"], this.__normalizeMouse);
    var after = registry["mousedown"].length + registry["mouseup"].length;
    this.assertEquals((before - 2), after);
  }
});


testrunner.define({
  classname : "event.Native",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testGetTarget : function()
  {
    if (!qx.core.Environment.get("event.dispatchevent")) {
      this.skip("Requires dispatchEvent");
    }
    var obj = {
      target : null
    };
    var callback = function(ev) {
      this.target = ev.getTarget();
      this.currentTarget = ev.getCurrentTarget();
    };

    var test = q.create('<input id="foo" type="text" />');
    test.appendTo(this.sandbox[0]);
    test.on("mousedown", callback, obj);

    window.setTimeout(function() {
      var event = new qx.event.type.dom.Custom("mousedown");
      test[0].dispatchEvent(event);
    }, 100);

    this.wait(function() {
      this.assertEquals(test[0], obj.target);
      this.assertEquals(test[0], obj.currentTarget);
    }, 200, this);
  },

  testEventMethods : function()
  {
    if (!qx.core.Environment.get("event.dispatchevent")) {
      this.skip("Requires dispatchEvent");
    }
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
    test.on("mousedown", callback, obj);

    window.setTimeout(function() {
      var event = new qx.event.type.dom.Custom("mousedown");
      test[0].dispatchEvent(event);
    }, 100);

    this.wait(function() {
      for (var i=0, l=methods.length; i<l; i++) {
        this.assertTrue(obj[methods[i]]);
      }
    }, 200, this);
  },

  testCurrentTarget : function()
  {
    if (!qx.core.Environment.get("event.dispatchevent")) {
      this.skip("Requires dispatchEvent");
    }

    var target;

    var callback = function(ev) {
      target = ev.getCurrentTarget();
    };

    var test = q.create('<input type="text" />');
    test.appendTo(this.sandbox[0]);
    test.on("mousedown", callback, this);

    window.setTimeout(function() {
      var event = new qx.event.type.dom.Custom("mousedown");
      test[0].dispatchEvent(event);
    }, 100);

    this.wait(function() {
      this.assertEquals(test[0], target);
    }, 500, this);
  },


  testCurrentTargetMultiElementsDispatch : function() {
    if (!qx.core.Environment.get("event.dispatchevent")) {
      this.skip("Requires dispatchEvent");
    }

    var target;

    var callback = function(ev) {
      target = ev.getCurrentTarget();
    };

    var test = q.create('<div/><div/><div/>')
      .appendTo(this.sandbox[0])
      .on("mousedown", callback, this);

    window.setTimeout(function() {
      var event = new qx.event.type.dom.Custom("mousedown");
      test[1].dispatchEvent(event);
    }, 100);

    this.wait(function() {
      this.assertEquals(test[1], target);
    }, 500, this);
  },


  testCurrentTargetMultiElementsEmit : function() {
    if (!qx.core.Environment.get("event.dispatchevent")) {
      this.skip("Requires dispatchEvent");
    }

    var target;

    var callback = function(ev) {
      target = ev.getCurrentTarget();
    };

    var test = q.create('<div id="0"/><div id="1"/><div id="2"/>')
      .appendTo(this.sandbox[0])
      .on("mousedown", callback, this);

    window.setTimeout(function() {
      window.affe = true;
      test.eq(1).emit("mousedown", {});
      window.affe = false;
    }, 100);

    this.wait(function() {
      this.assertEquals(test[1].getAttribute("id"), target.getAttribute("id"));
    }, 500, this);
  }
});

testrunner.define({
  classname : "event.Mouse",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testEventNormalization : function()
  {
    var eventTypes = ["click", "dblclick", "mousedown", "mouseup", "mouseover", "mousemove",
      "mouseout"];
    var registry = q.$getEventNormalizationRegistry();
    for (var i=0,l=eventTypes.length; i<l; i++) {
      this.assertKeyInMap(eventTypes[i], registry);
    }
  },

  testEventMethods : function()
  {
    var eventMethods = ["getButton", "getViewportLeft", "getViewportTop",
      "getDocumentLeft", "getDocumentTop", "getScreenLeft", "getScreenTop"];

    var test = q.create("<div id='foo'></div>");
    test.appendTo(this.sandbox[0]);

    var obj = {};

    q("#sandbox #foo").on("mousedown", function(ev) {
      for (var i=0; i<eventMethods.length; i++) {
        if (typeof ev[eventMethods[i]] !== "function"
          || ev[eventMethods[i]]() !== "none") {
          this.normalized = false;
          return;
        }
      }
      this.normalized = true;
    }, obj);

    q("#sandbox #foo").emit("mousedown", {
      button : "none",
      clientX : "none",
      clientY : "none",
      pageX : "none",
      pageY : "none",
      screenX : "none",
      screenY : "none"
    });

    this.assertTrue(obj.normalized);
  }
});

testrunner.define({
  classname : "event.Keyboard",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testEventNormalization : function()
  {
    var eventTypes = ["keydown", "keypress", "keyup"];
    this.assertArray(eventTypes);
    this.assert(eventTypes.length > 0);
    var registry = q.$getEventNormalizationRegistry();
    for (var i=0,l=eventTypes.length; i<l; i++) {
      this.assertKeyInMap(eventTypes[i], registry);
    }
  },

  testEventMethods : function()
  {
    var test = q.create("<div id='foo'></div>");
    test.appendTo(this.sandbox[0]);

    var obj = {};

    q("#sandbox #foo").on("keydown", function(ev) {
      this.keyIdentifier = ev.getKeyIdentifier();
    }, obj);

    q("#sandbox #foo").emit("keydown", {
      keyCode: 27
    });

    this.assertEquals("Escape", obj.keyIdentifier);
  }
});

testrunner.define({
  classname : "event.Touch",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testEventNormalization : function()
  {
    var eventTypes = ["tap", "swipe"];
    this.assertArray(eventTypes);
    this.assert(eventTypes.length > 0);
    var registry = q.$getEventNormalizationRegistry();
    for (var i=0,l=eventTypes.length; i<l; i++) {
      this.assertKeyInMap(eventTypes[i], registry);
    }
  }
});

testrunner.define({
  classname : "event.RegistrationHooks",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testRegisterHook : function()
  {
    var test = q.create('<div></div>').appendTo(this.sandbox[0]);
    var registerHook = function(element, type, callback, context) {
      element.hookApplied = true;
    };
    var unregisterHook = function(element, type, callback, context) {
      element.hookApplied = false;
    };
    var hooks = q.$getEventHookRegistry();
    var onHookCount = hooks["on"]["foo"] ? hooks["on"]["foo"].length : 0;

    q.$registerEventHook(["foo"], registerHook, unregisterHook);
    this.assertArray(hooks["on"]["foo"]);
    this.assertEquals(onHookCount+1, hooks["on"]["foo"].length);

    var cb = function() {};
    test.on("foo", cb);
    this.assertTrue(test[0].hookApplied);

    test.off("foo", cb);
    this.assertFalse(test[0].hookApplied);

    q.$unregisterEventHook(["foo"], registerHook, unregisterHook);
    this.assertEquals(onHookCount, hooks["on"]["foo"].length);
  }
});


testrunner.define({
  classname : "event.TouchHandler",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testRegister : function()
  {
    this.require(["qx.debug"]);
    var cb = function() {};
    var test = q.create('<div></div>').appendTo(this.sandbox[0])
    .on("touchstart", cb).on("touchmove", cb);
    this.assertEquals("qx.event.handler.TouchCore", test[0].__touchHandler.classname);
    test.off("touchstart", cb);
    this.assertNotNull(test[0].__touchHandler);
    test.off("touchmove", cb)
    this.assertNull(test[0].__touchHandler);
  }
});


testrunner.define({
  classname : "event.PointerHandler",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testRegister : function()
  {
    this.require(["qx.debug"]);
    if (q.$$qx.core.Environment.get("event.mspointer")) {
      this.skip("Pointer events supported natively.");
    }
    var cb = function() {};
    var test = q.create('<div></div>').appendTo(this.sandbox[0])
    .on("pointerdown", cb)
    .on("pointerup", cb);
    this.assertEquals("qx.event.handler.PointerCore", test[0].$$pointerHandler.classname);
    test.off("pointerdown", cb);
    this.assertNotUndefined(test[0].$$pointerHandler);
    test.off("pointerup", cb);
    this.assertUndefined(test[0].$$pointerHandler);
  },

  __onMouseDown : function(e) {
    this.resume(function() {
      q(document).off("mousedown", this.__onMouseDown, this);
      this.assertEquals("mousedown", e.getType());
    }, this);
  },

  testNativeBubbling : function() {
    this.sandbox.on("pointerdown", function() {});
    q(document).on("mousedown", this.__onMouseDown, this);

    setTimeout(function() {
      var domEvent = testrunner.createMouseEvent("mousedown");
      this.sandbox[0].dispatchEvent ?
        this.sandbox[0].dispatchEvent(domEvent) :
        this.sandbox[0].fireEvent("onmousedown", domEvent);
    }.bind(this), 100);
    this.wait(250);
  },

  testDisposeHandler: function() {
    var cb = function() {};
    this.sandbox
      .on("pointerdown", cb)
      .on("pointerup", cb)
      .off("pointerdown", cb);
    this.assertNotUndefined(this.sandbox[0].$$pointerHandler);
    this.sandbox.off("pointerup", cb);
    this.assertUndefined(this.sandbox[0].$$pointerHandler);
  },

  testRemoveMultiple: function() {
    var cb = function() {};
    this.sandbox
      .on("pointerdown", cb)
      .on("pointerup", cb)
      .off("pointerup", cb)
      .off("pointerup", cb);
    this.assertNotUndefined(this.sandbox[0].$$pointerHandler);
    this.sandbox.off("pointerdown", cb);
    this.assertUndefined(this.sandbox[0].$$pointerHandler);
  }
});


testrunner.define({
  classname : "event.GestureHandler",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testRegister : function()
  {
    var cb = function() {};
    var test = q.create('<div></div>').appendTo(this.sandbox[0])
    .on("tap", cb)
    .on("swipe", cb);
    this.assertEquals("qx.event.handler.GestureCore", test[0].$$gestureHandler.classname);
    test.off("tap", cb);
    this.assertNotNull(test[0].$$gestureHandler);
    test.off("swipe", cb);
    this.assertUndefined(test[0].$$gestureHandler);
  },

  testDisposeHandler: function() {
    var cb = function() {};
    this.sandbox
      .on("tap", cb)
      .on("swipe", cb)
      .off("tap", cb);
    this.assertNotUndefined(this.sandbox[0].$$gestureHandler);
    this.sandbox.off("swipe", cb);
    this.assertUndefined(this.sandbox[0].$$gestureHandler);
  },

  testRemoveMultiple: function() {
    var cb = function() {};
    this.sandbox
      .on("tap", cb)
      .on("swipe", cb)
      .off("swipe", cb)
      .off("swipe", cb);
    this.assertNotUndefined(this.sandbox[0].$$gestureHandler);
    this.sandbox.off("tap", cb);
    this.assertUndefined(this.sandbox[0].$$gestureHandler);
  }
});


testrunner.define({
  classname : "Templates",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testRender : function() {
    var result = q.template.render("{{affe}}", {affe: "george"});
    this.assertEquals("george", result);
  },

  testRenderToNodeTmplTextOnly : function() {
    var result = q.template.renderToNode("{{affe}}", {affe: "george"});
    this.assertEquals(1, result.length);
    this.assertEquals("george", result[0].innerHTML);
  },

  testRenderToNodeTmplWithNodes : function() {
    var result = q.template.renderToNode("<div><span>{{affe}}</span></div>", {affe: "george"});
    this.assertEquals(1, result.length);
    this.assertEquals("george", result[0].firstChild.firstChild.data);
  },

  testGet : function() {
    var template = q.create("<div id='tmp'>{{affe}}</div>");
    template.appendTo(document.body);
    var result = q.template.get("tmp", {affe: "george"});
    this.assertEquals(1, result.length);
    this.assertEquals("george", result[0].innerHTML);
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

testrunner.define({
  classname : "Placement",


  setUp: function()
  {
    testrunner.globalSetup.call(this);

    q("#sandbox").setStyles({
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "#AEAEAE"
    });

    q.create('<div id="foo"></div>').setStyles({
      position: "absolute",
      top: "200px",
      left: "0px",
      width: "200px",
      height: "100px",
      backgroundColor : "red"
    }).appendTo(this.sandbox[0]);

    q.create('<div id="bar"></div>').setStyles({
      position: "relative",
      width: "100px",
      height: "25px",
      backgroundColor : "green"
    }).appendTo(this.sandbox[0]);

  },

  tearDown : function() {
    testrunner.globalTeardown.call(this);
    q("#sandbox #bar").setStyle("position", "relative");
  },

  testPlaceToSimple : function()
  {
    q("#sandbox #bar").placeTo("#sandbox #foo", "right-top");
    var expectedLocation = {
      left: 200,
      top: 200
    };
    this.assertEquals(expectedLocation.left, q("#bar").getOffset().left);
    this.assertEquals(expectedLocation.top, q("#bar").getOffset().top);

    q("#sandbox #foo").setStyles({
      position: "relative",
      left: "10px",
      paddingLeft: "10px"
    });

    q("#sandbox #bar").placeTo("#sandbox #foo", "right-top");

    expectedLocation = {
      left: 220,
      top: 200
    };
    this.assertEquals(expectedLocation.left, q("#bar").getOffset().left);
    this.assertEquals(expectedLocation.top, q("#bar").getOffset().top);
  },


  testPlaceToDirect : function()
  {
    q("#sandbox #bar").placeTo("#sandbox #foo", "right-bottom", {top: 10, right: 10, bottom: 10, left: 10}, "direct", "direct");

    var expectedLocation = {
      left: 210,
      top: 265
    };
    this.assertEquals(expectedLocation.left, q("#bar").getOffset().left);
    this.assertEquals(expectedLocation.top, q("#bar").getOffset().top);
  },

  testPlaceToKeepAlign : function()
  {
    q("#sandbox #bar").placeTo("#sandbox #foo", "left-top", {top: 10, right: 10, bottom: 10, left: 10}, "keep-align", "keep-align");
    var expectedLocation = {
      left: 210,
      top: 210
    };
    this.assertEquals(expectedLocation.left, q("#bar").getOffset().left);
    this.assertEquals(expectedLocation.top, q("#bar").getOffset().top);
  },

  testPlaceToUsingHiddenElement : function() {
    q("#sandbox #bar").hide();
    var displayValue = q("#sandbox #bar").getStyle("display");
    var visibilityValue = q("#sandbox #bar").getStyle("visibility");

    q("#sandbox #bar").placeTo("#sandbox #foo", "right-top");
    var expectedLocation = {
      left: 200,
      top: 200
    };
    this.assertEquals(expectedLocation.left, parseInt(q("#bar").getStyle("left"), 10));
    this.assertEquals(expectedLocation.top, parseInt(q("#bar").getStyle("top"), 10));
    this.assertEquals(displayValue, q("#sandbox #bar").getStyle("display"));
    this.assertEquals(visibilityValue, q("#sandbox #bar").getStyle("visibility"));
  },

  testPlaceToUsingHiddenElementByCssClass : function() {
    q("#sandbox #bar").addClass("hidden");

    q("#sandbox #bar").placeTo("#sandbox #foo", "right-top");
    var expectedLocation = {
      left: 200,
      top: 200
    };
    this.assertEquals(expectedLocation.left, parseInt(q("#bar").getStyle("left"), 10));
    this.assertEquals(expectedLocation.top, parseInt(q("#bar").getStyle("top"), 10));
    this.assertEquals("", q("#bar")[0].style.display);
  },

  testPlaceToPreservingStyleValues : function() {
    q("#sandbox #bar").setStyle("visibility", "collapse");
    q("#sandbox #bar").hide();
    var displayValue = q("#sandbox #bar").getStyle("display");
    var visibilityValue = q("#sandbox #bar").getStyle("visibility");

    q("#sandbox #bar").placeTo("#sandbox #foo", "right-top");
    var expectedLocation = {
      left: 200,
      top: 200
    };
    this.assertEquals(expectedLocation.left, parseInt(q("#bar").getStyle("left"), 10));
    this.assertEquals(expectedLocation.top, parseInt(q("#bar").getStyle("top"), 10));
    this.assertEquals(displayValue, q("#sandbox #bar").getStyle("display"));
    this.assertEquals(visibilityValue, q("#sandbox #bar").getStyle("visibility"));
  }
});

testrunner.define({
  classname : "Blocker",

  setUp : testrunner.globalSetup,
  tearDown : function() {
    testrunner.globalTeardown.call(this);
    q(document).unblock();
  },

  testBlocker : function() {
    this.require(["qx.debug"]);
    var styles = {
      position: "absolute",
      top: "250px",
      left: "200px",
      width: "200px",
      height: "150px"
    };
    var test = q.create('<div id="foo"></div>').setStyles(styles)
    .appendTo(this.sandbox[0]);

    test.block("#00FF00", 1);

    var blockerDiv = test[0].__blocker.div;
    this.assertElement(blockerDiv[0]);
    this.assertTrue(q.$$qx.dom.Hierarchy.isRendered(blockerDiv[0]));
    var blockerLocation = blockerDiv.getOffset();
    this.assertEquals(styles.top, blockerLocation.top + "px");
    this.assertEquals(styles.left, blockerLocation.left + "px");
    this.assertEquals(styles.width, blockerDiv.getWidth() + "px");
    this.assertEquals(styles.height, blockerDiv.getHeight() + "px");

    this.assertEquals(1, blockerDiv.getStyle("opacity"));
    this.assertMatch(blockerDiv.getStyle("backgroundColor"), /(rgb.*?0,.*?255.*?0|#00ff00)/i);

    test.unblock();

    this.assertFalse(q.$$qx.dom.Hierarchy.isRendered(blockerDiv[0]));

    var newStyles = {
      top: "400px",
      left: "500px",
      width: "250px",
      height: "175px"
    };
    test.setStyles(newStyles);

    test.block();

    this.assertTrue(q.$$qx.dom.Hierarchy.isRendered(blockerDiv[0]));
    var blockerLocation = blockerDiv.getOffset();
    this.assertEquals(newStyles.top, blockerLocation.top + "px");
    this.assertEquals(newStyles.left, blockerLocation.left + "px");
    this.assertEquals(newStyles.width, blockerDiv.getWidth() + "px");
    this.assertEquals(newStyles.height, blockerDiv.getHeight() + "px");

    test.unblock();
  },

  testBlockDocument : function()
  {
    this.require(["qx.debug"]);

    q(document).block();

    var blockerDiv = document.__blocker.div;
    this.assertTrue(q.$$qx.dom.Hierarchy.isRendered(blockerDiv[0]));

    var os = q.env.get("os.name");
    if (os == "android" || os == "ios") {
      // in WebKit on Android and iOS, the blocker will sometimes be 1 pixel
      // higher and/or wider than the viewport
      this.assertTrue(Math.abs(blockerDiv.getWidth() - q(window).getWidth()) < 2);
      this.assertTrue(Math.abs(blockerDiv.getHeight() - q(window).getHeight()) < 2);
    } else {
      this.assertEquals(q(window).getWidth(), blockerDiv.getWidth());
      this.assertEquals(q(window).getHeight(), blockerDiv.getHeight());
    }

    this.assertEquals(q(document.body).getChildren(":first")[0], blockerDiv[0]);
    this.assertEquals('fixed', blockerDiv.getStyle("position"));
    this.assertEquals('100%', blockerDiv[0].style.width);
    this.assertEquals('100%', blockerDiv[0].style.height);

    q(document).unblock();

    this.assertFalse(q.$$qx.dom.Hierarchy.isRendered(blockerDiv[0]));
  },

  testGetBlockerElements : function() {
    var styles = {
      position: "absolute",
      top: "250px",
      left: "200px",
      width: "200px",
      height: "150px"
    };

    q.create('<div id="foo"></div>').setStyles(styles).appendTo(this.sandbox[0]);
    q.create('<div id="bar"></div>').setStyles(styles).appendTo(this.sandbox[0]);

    var test = this.sandbox.getChildren();

    test.block();

    var blockerCollection = test.getBlocker();
    this.assertInstance(blockerCollection, q);
    this.assertEquals(2, blockerCollection.length);
    this.assertTrue(qxWeb.isElement(blockerCollection[0]));
    this.assertTrue(qxWeb.isElement(blockerCollection[1]));

    test.unblock();
  },

  testGetBlockerWithoutBlockingBefore : function() {
    var styles = {
      position: "absolute",
      top: "250px",
      left: "200px",
      width: "200px",
      height: "150px"
    };
    var test = q.create('<div id="foo"></div>').setStyles(styles)
    .appendTo(this.sandbox[0]);

    var blockerCollection = test.getBlocker();
    this.assertInstance(blockerCollection, q);
    this.assertEquals(0, blockerCollection.length);
  },


  testBlockerWithCSSClassStyling : function() {
    this.require(["qx.debug"]);
    var styleSheet = "./style2.css";
    q.includeStylesheet(styleSheet);

    q(document).block();
    var blockerDiv = document.__blocker.div;

    window.setTimeout((function()
    {
      this.resume(function()
      {
        var opacity = (qxWeb.env.get("browser.name") === "ie" && qxWeb.env.get("browser.version") <= 8) ? 0 : 0.7;

        this.assertMatch(blockerDiv.getStyle("backgroundColor"), /(rgb.*?255,.*?0.*?0|#ff0000)/i);
        this.assertEquals('8000', blockerDiv.getStyle('zIndex'));
        this.assertEquals(opacity, (Math.round(blockerDiv.getStyle('opacity') * 10) / 10));

        q(document).unblock();
        q('link[href="./style2.css"]').remove();
      });
    }).bind(this), 500);

    this.wait(1000);
  },

  testBlockerWithJSStyling : function() {
    q(document).block('#00FF00', 0.6, 7000);
    var blockerDiv = document.__blocker.div;

    this.assertMatch(blockerDiv.getStyle("backgroundColor"), /(rgb.*?0,.*?255.*?0|#00ff00)/i);
    this.assertEquals('7000', blockerDiv.getStyle('zIndex'));
    this.assertEquals('0.6', (Math.round(blockerDiv.getStyle('opacity') * 10) / 10));

    q(document).unblock();
  }
});


testrunner.define({
  classname : "ArrayUtil",

  testCast : function() {
    var a;
    (function() {
      a = q.array.cast(arguments, Array);
    })(1, 2, 3, 4);
    this.assertEquals(4, a.length);
    this.assertEquals([].constructor, a.constructor);

  },

  testEquals : function() {
    var a = [1, 2, 3, 4];
    var b = [1, 2, 3, 4];
    this.assertTrue(q.array.equals(a, b));
    a.push(5);
    this.assertFalse(q.array.equals(a, b));
  },


  testExclude : function() {
    var a = [1, 2, 3, 4];
    var b = [2, 4];
    q.array.exclude(a, b);
    this.assertEquals(1, a[0]);
    this.assertEquals(3, a[1]);
  },


  testFromArguments : function() {
    var a;
    (function() {
      a = q.array.fromArguments(arguments);
    })(1, 2, 3, 4);
    this.assertEquals(4, a.length);
    this.assertEquals([].constructor, a.constructor);
  },


  testInsertAfter : function() {
    var a = [1, 2, 4];
    q.array.insertAfter(a, 3, 2);
    this.assertEquals(4, a.length);
    this.assertEquals(3, a[2]);
  },


  testInsertBefore : function() {
    var a = [1, 2, 4];
    q.array.insertBefore(a, 3, 4);
    this.assertEquals(4, a.length);
    this.assertEquals(3, a[2]);
  },


  testMax : function() {
    var a = [1, 4, 2, 3];
    this.assertEquals(4, q.array.max(a));
  },


  testMin : function() {
    var a = [1, 4, 2, 3];
    this.assertEquals(1, q.array.min(a));
  },


  testRemove : function() {
    var a = [1, 2, 'x', 3, 4];
    q.array.remove(a, 'x');
    this.assertEquals(4, a.length);
    this.assertEquals(3, a[2]);
  },


  testRemoveAll : function() {
    var a = [1, 2, 3, 4];
    q.array.removeAll(a);
    this.assertEquals(0, a.length);
  },


  testUnique : function() {
    var a = [1, 1, 2, 3, 4, 4, 4];
    var b = q.array.unique(a);
    this.assertEquals(4, b.length);
    this.assertEquals(1, b[0]);
    this.assertEquals(2, b[1]);
    this.assertEquals(3, b[2]);
    this.assertEquals(4, b[3]);
  }
});



testrunner.define({
  classname : "StringUtil",

  testCamelCase : function() {
    this.assertEquals("ABC", q.string.camelCase("-a-b-c"));
    this.assertEquals("WebkitLinearGradient", q.string.camelCase("-webkit-linear-gradient"));
  },


  testHyphenate : function() {
    this.assertEquals("-a-b-c", q.string.hyphenate("ABC"));
    this.assertEquals("-webkit-linear-gradient", q.string.hyphenate("WebkitLinearGradient"));
  },


  testFirstUp : function() {
    this.assertEquals("MAn", q.string.firstUp("mAn"));
    this.assertEquals("Man", q.string.firstUp("Man"));
  },


  testFirstLow : function() {
    this.assertEquals("man", q.string.firstLow("Man"));
    this.assertEquals("mAN", q.string.firstLow("MAN"));
  },


  testStartsWith : function() {
    this.assertTrue(q.string.startsWith("Test", "Te"));
    this.assertTrue(q.string.startsWith("Test", "Test"));
    this.assertFalse(q.string.startsWith("Test", "est"));
    this.assertFalse(q.string.startsWith("Test", "x"));
  },


  testEndsWith : function() {
    this.assertTrue(q.string.endsWith("Test", "st"));
    this.assertTrue(q.string.endsWith("Test", "Test"));
    this.assertFalse(q.string.endsWith("Test", "Te"));
    this.assertFalse(q.string.endsWith("Test", "x"));
  },


  testEscapeRegexpChars : function() {
    // also escape the \ in the expected
    this.assertEquals("\\.\\.\\.", q.string.escapeRegexpChars("..."));
  },


  testTrim : function() {
    this.assertEquals("abc", "    abc    ".trim());
  }
});


testrunner.define({
  classname : "Environment",

  testGet : function() {
    this.assertEquals(q.$$qx.core.Environment.get("qx.debug"), q.env.get("qx.debug"));
  },

  testAdd : function() {
    q.env.add("q.test", true);
    this.assertTrue(q.env.get("q.test"));
  }
});





testrunner.define({
  classname : "Type",

  testGet : function() {
    this.assertEquals("Array", q.type.get([]));
    this.assertEquals("Array", q.type.get([1,2,3]));
    this.assertEquals("Boolean", q.type.get(true));
    this.assertEquals("Boolean", q.type.get(false));
    this.assertEquals("Date", q.type.get(new Date()));
    this.assertEquals("Error", q.type.get(new Error()));
    this.assertEquals("Function", q.type.get(function() {}));
    this.assertEquals("Number", q.type.get(123));
    this.assertEquals("Number", q.type.get(0x123));
    this.assertEquals("Number", q.type.get(0123));
    this.assertEquals("Number", q.type.get(1e23));
    this.assertEquals("Object", q.type.get({}));
    this.assertEquals("Object", q.type.get({a: "b"}));
    this.assertEquals("RegExp", q.type.get(new RegExp("^123")));
    this.assertEquals("RegExp", q.type.get(/^123/g));
    this.assertEquals("String", q.type.get(""));
    this.assertEquals("String", q.type.get("123"));
    this.assertEquals("String", q.type.get("abc"));
  }
});


testrunner.define({
  classname : "Define",

  testDefine : function() {
    q.define("XXXXX", {statics : { a: 123 }});
    this.assertEquals(123, XXXXX.a);
    window["XXXXX"] = undefined;
    q.$$qx.Bootstrap.$$registry["XXXXX"] = null;

    var C = q.define({members : { a : function() {return 123;}}});
    var c = new C();
    this.assertEquals(123, c.a());
  }
});


testrunner.define({
  classname : "Cookie",

  testGetSetDel : function()
  {
    this.require(["http"]);
    var key1 = "q.test.cookie.Gorilla";
    var key2 = "q.test.cookie.Chimp";

    this.assertNull(q.cookie.get(key1));
    this.assertNull(q.cookie.get(key2));

    var value1 = "Donkey";
    var value2 = "Diddy";

    q.cookie.set(key1, value1);
    q.cookie.set(key2, value2);

    this.assertEquals(value1, q.cookie.get(key1));
    this.assertEquals(value2, q.cookie.get(key2));

    q.cookie.del(key1);
    q.cookie.del(key2);

    this.assertNull(q.cookie.get(key1));
    this.assertNull(q.cookie.get(key2));
  }
});


testrunner.define({
  classname : "IO",

  testBasicXhr : function() {
    q.io.xhr("tests.js").on("loadend", function(xhr) {
      this.resume(function() {
        this.assertEquals(4, xhr.readyState);
        xhr.dispose();
      }, this);
    }, this).send();
    this.wait();
  },

  testXhrWithHeader : function() {
    q.io.xhr("tests.js", {header: {"Content-Type": "application/json"}}).on("loadend", function(xhr) {
      this.resume(function() {
        this.assertEquals(4, xhr.readyState);
        xhr.dispose();
      }, this);
    }, this).send();
    this.wait();
  },

  testBasicScript : function() {
    q.io.script("scriptload.js").on("loadend", function(script) {
      this.resume(function() {
        this.assertEquals(4, script.readyState);
        this.assertEquals("loaded", window.qTest); // will be set by the test file
        window.qTest = undefined;
        script.dispose();
      }, this);
    }, this).send();
    this.wait();
  },


  testBasicJsonp : function() {
    q.io.jsonp("jsonpload.js", {callbackName: "callback"}).on("loadend", function(req) {
      this.resume(function() {
        this.assertEquals(4, req.readyState);
        this.assertEquals("test", req.responseJson.data); // comes from the test file
        req.dispose();
      }, this);
    }, this).send();
    this.wait();
  },


  testAutomatedJsonPCallback : function() {
    var jsonp = q.io.jsonp("jsonpload.js");

    var checkForReserverdURLChars = /[\!#\$&'\(\)\*\+,\/\:;\=\?@\[\]]/;
    var url = jsonp.getGeneratedUrl();
    var callbackPart = url.substr(url.indexOf("=") + 1);

    this.assertFalse(checkForReserverdURLChars.test(callbackPart), "Generated URL is not valid");
  }
});


testrunner.define({
  classname : "Transform",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  // smoke tests
  testTranslate : function() {
    this.sandbox.translate("10px");
  },

  testScale : function() {
    this.sandbox.scale(2);
  },

  testSkew : function() {
    this.sandbox.skew("20deg");
  },

  testRotate : function() {
    this.sandbox.rotate("90deg");
  },

  testTransfrom : function() {
    this.sandbox.transform({scale: [1,2], rotate: "90deg"});
  },


  testTransformOrigin : function() {
    this.sandbox.setTransformOrigin("30% 10%");
    if (q.env.get("css.transform") != null) {
      this.assertNotEquals(-1, this.sandbox.getTransformOrigin().indexOf("30% 10%"));
    }
  },

  testTransformStyle : function() {
    this.sandbox.setTransformStyle("flat");
    if (q.env.get("css.transform") != null) {
      this.assertEquals("flat", this.sandbox.getTransformStyle());
    }
  },

  testTransformPerspective : function() {
    this.sandbox.setTransformPerspective(1234);
    if (q.env.get("css.transform") != null) {
      this.assertEquals("1234px", this.sandbox.getTransformPerspective());
    }
  },

  testTransformPerspectiveOrigin : function() {
    this.sandbox.setTransformPerspectiveOrigin("30% 50%");
    if (q.env.get("css.transform") != null) {
      this.assertEquals("30% 50%", this.sandbox.getTransformPerspectiveOrigin());
    }
  },

  testTransformBackfaceVisibility : function() {
    this.sandbox.setTransformBackfaceVisibility(true);
    if (q.env.get("css.transform") != null) {
      this.assertEquals(true, this.sandbox.getTransformBackfaceVisibility());
    }
  }
});


testrunner.define({
  classname : "Storage",
  __testKey : "qx_website_test_key",

  testLocalSetGetRemove : function() {
    q.localStorage.setItem(this.__testKey, {a: 1, b: true});
    this.assertEquals(1, q.localStorage.getItem(this.__testKey).a);
    this.assertEquals(true, q.localStorage.getItem(this.__testKey).b);
    q.localStorage.removeItem(this.__testKey);
    this.assertNull(q.localStorage.getItem(this.__testKey));
  },

  testLocalGetLength : function() {
    q.localStorage.removeItem(this.__testKey);
    var oldLength = q.localStorage.getLength();
    q.localStorage.setItem(this.__testKey, "abc");
    this.assertEquals(oldLength + 1, q.localStorage.getLength());
    q.localStorage.removeItem(this.__testKey);
    this.assertEquals(oldLength, q.localStorage.getLength());
  },

  testSessionSetGetRemove : function() {
    q.sessionStorage.setItem(this.__testKey, {a: 1, b: true});
    this.assertEquals(1, q.sessionStorage.getItem(this.__testKey).a);
    this.assertEquals(true, q.sessionStorage.getItem(this.__testKey).b);
    q.sessionStorage.removeItem(this.__testKey);
    this.assertNull(q.sessionStorage.getItem(this.__testKey));
  },

  testSessionGetLength : function() {
    q.sessionStorage.removeItem(this.__testKey);
    var oldLength = q.sessionStorage.getLength();
    q.sessionStorage.setItem(this.__testKey, "abc");
    this.assertEquals(oldLength + 1, q.sessionStorage.getLength());
    q.sessionStorage.removeItem(this.__testKey);
    this.assertEquals(oldLength, q.sessionStorage.getLength());
  }
});


testrunner.define({
  classname : "Messaging",

  testOn : function() {
    var called = 0;
    var id = q.messaging.on("X", "test", function() {
      called = called + 1;
    });
    q.messaging.emit("X", "test");
    this.assertEquals(1, called);
    q.messaging.emit("X", "test");
    this.assertEquals(2, called);
    q.messaging.remove(id);

    q.messaging.emit("X", "test");
    this.assertEquals(2, called);
  },


  testOnAny : function() {
    // counter for every handler
    var called = 0;
    var called2 = 0;
    var calledAny = 0;
    // attach 3 handler
    var id = q.messaging.on("X", "test", function() {
      called = called + 1;
    });
    var id2 = q.messaging.on("Y", "test", function() {
      called2 = called2 + 1;
    });
    var idAny = q.messaging.onAny("test", function() {
      calledAny = calledAny + 1;
    });

    // emit test
    q.messaging.emit("X", "test");
    this.assertEquals(1, called);
    this.assertEquals(0, called2);
    this.assertEquals(1, calledAny);

    // emit test2
    q.messaging.emit("Y", "test");
    this.assertEquals(1, called);
    this.assertEquals(1, called2);
    this.assertEquals(2, calledAny);

    // remove all handler
    q.messaging.remove(id);
    q.messaging.remove(id2);
    q.messaging.remove(idAny);

    // emit all events and check if the removal worked
    q.messaging.emit("X", "test");
    q.messaging.emit("X", "test2");
    this.assertEquals(1, called);
    this.assertEquals(1, called2);
    this.assertEquals(2, calledAny);
  }
});


testrunner.define({

  classname : "MatchMedia",

  setUp : function() {
    testrunner.globalSetup.call(this);

    if (qxWeb.env.get("qx.debug")) {
      this.skip("Only reasonable in non-debug version.");
    }

    this.__iframe = q.create('<iframe src="media.html" frameborder="0" width="500" height="400" name="Testframe"></iframe>');
    this.__iframe.appendTo(this.sandbox[0]);
  },

  tearDown : function() {
    testrunner.globalTeardown.call(this);
    qxWeb(window).off('message', null, null);
  },

  hasNoLegacyIe : function() {
    return (qxWeb.env.get("engine.name") != "mshtml" ||
      qxWeb.env.get("browser.documentmode") > 8);
  },

  testLandscape : function() {
    var iframe = this.__iframe[0];

    iframe.width = "500px";
    iframe.height = "400px";

    qxWeb(window).once('message',function(e){
      this.resume(function() {
        this.assertEquals(e.data, "true");
      }, this);
    },this);

    this.__iframe.on("load", function() {
      iframe.contentWindow.postMessage("all and (orientation:landscape)",'*');
    });

    this.wait(1000);
  },

  testMinWidth : function(){
    this.require(["noLegacyIe"]);

    var iframe = this.__iframe[0];

    iframe.width = "500px";
    iframe.height = "400px";

    qxWeb(window).once('message',function(e){
      this.resume(function() {
        this.assertEquals(e.data, "true");
      }, this);
    },this);

    this.__iframe.on("load", function() {
      iframe.contentWindow.postMessage("all and (min-width:500px)",'*');
    });

    this.wait(10000);
  },

  testMaxWidth : function(){
    var iframe = this.__iframe[0];

    iframe.width = "500px";
    iframe.height = "400px";

    qxWeb(window).once('message',function(e){
      this.resume(function() {
        this.assertEquals(e.data, "true");
      }, this);
    },this);

    this.__iframe.on("load", function() {
      iframe.contentWindow.postMessage("all and (max-width:500px)",'*');
    });

    this.wait(1000);
  },


  testAnd : function(){
    var iframe = this.__iframe[0];

    iframe.width = "300px";
    iframe.height = "400px";

    qxWeb(window).once('message',function(e){
      this.resume(function() {
        this.assertEquals(e.data, "false");
      }, this);
    },this);

    this.__iframe.on("load", function() {
      iframe.contentWindow.postMessage("screen and (min-width: 400px) and (max-width: 700px)",'*');
    });

    this.wait(1000);
  },

  testMinHeight : function(){
    var iframe = this.__iframe[0];

    iframe.width = "500px";
    iframe.height = "400px";

    qxWeb(window).once('message',function(e){
      this.resume(function() {
        this.assertEquals(e.data, "false");
      }, this);
    },this);

    this.__iframe.on("load", function() {
      iframe.contentWindow.postMessage("all and (min-height:500px)",'*');
    });

    this.wait(1000);
  },

  testColor : function(){
    var iframe = this.__iframe[0];

    iframe.width = "500px";
    iframe.height = "400px";

    qxWeb(window).once('message',function(e){
      this.resume(function() {
        this.assertEquals(e.data, "true");
      }, this);
    },this);

    this.__iframe.on("load", function() {
      iframe.contentWindow.postMessage("all and (min-color: 1)",'*');
    });

    this.wait(1000);
  },

  testCombined : function(){

    var iframe = this.__iframe[0];

    iframe.width = "800px";
    iframe.height = "400px";

    qxWeb(window).once('message',function(e){
      this.resume(function() {
        this.assertEquals(e.data, "true");
      }, this);
    },this);

    this.__iframe.on("load", function() {
      iframe.contentWindow.postMessage("(min-width: 700px) and (orientation: landscape)",'*');
    });

    this.wait(1000);
  },

  testDeviceWidth : function(){
    var iframe = this.__iframe[0];

    qxWeb(window).once('message',function(e){
      this.resume(function() {
        var dw = window.screen.width;
        var match = dw <= 799 ? "true" : "false";
        this.assertEquals(e.data, match);
      }, this);
    },this);

    this.__iframe.on("load", function() {
      iframe.contentWindow.postMessage("screen and (max-device-width: 799px)",'*');
    });

    this.wait(1000);
  },

  testWidth : function(){
    this.require(["noLegacyIe"]);
    var iframe = this.__iframe[0];
    iframe.width = "800px";

    qxWeb(window).once('message',function(e){
      this.resume(function() {
        this.assertEquals(e.data, "true");
      }, this);
    },this);

    this.__iframe.on("load", function() {
      iframe.contentWindow.postMessage("screen and (width: 800px)",'*');
    });

    this.wait(1000);
  },

  testPixelratio : function(){
    this.require(["noLegacyIe"]);
    var iframe = this.__iframe[0];
    iframe.width = "800px";

    qxWeb(window).once('message',function(e){
      this.resume(function() {
        this.assertEquals(e.data, "true");
      }, this);
    },this);

    this.__iframe.on("load", function() {
      iframe.contentWindow.postMessage("screen and (width: 800px)",'*');
    });

    this.wait(1000);
  },

  testNot : function(){
    var iframe = this.__iframe[0];
    iframe.width = "500px";

    qxWeb(window).once('message',function(e){
      this.resume(function() {
        this.assertEquals(e.data, "true");
      }, this);
    },this);

    this.__iframe.on("load", function() {
      iframe.contentWindow.postMessage("not screen and (min-width: 800px)",'*');
    });

    this.wait(1000);
  },

  testMediaQueryMatches: function () {
    var iframe = this.__iframe[0];
    this.sandbox.mediaQueryToClass("only screen", "testMediaQueryMatches", iframe.window);

    this.assertTrue(this.sandbox.hasClass("testMediaQueryMatches"));
  },

  testMediaQueryNotMatches: function () {
    var iframe = this.__iframe[0];
    this.sandbox.mediaQueryToClass("only print", "testMediaQueryNotMatches", iframe.window);

    this.assertFalse(this.sandbox.hasClass("testMediaQueryNotMatches"));
  },

  testMediaQueryMatchesAfterResizing: function () {
    var sandbox = this.sandbox;
    var iframe = this.__iframe[0];

    sandbox.mediaQueryToClass(
      "only screen and (min-width: 40.063em)",
      "testMediaQueryMatchesAfterResizing",
      iframe.window
    );

    iframe.width = 800;

    window.setTimeout(function(){
      this.resume(function (){
        this.assertTrue(sandbox.hasClass("testMediaQueryMatchesAfterResizing"));
      }, this);
    }.bind(this), 100);

    this.wait(1000);
  }
});


testrunner.define({
   classname : "Dataset",

   setUp : function(){
     testrunner.globalSetup.call(this);
     this.__element = q.create("<div id='testEl'></div>");
     this.__element.appendTo(this.sandbox[0]);
   },

   tearDown : testrunner.globalTeardown,

   testSetDataAttribute : function(){

     this.__element.setData("type","domelement");
     this.__element.setData("option","test");

     var datatype = this.__element.getAttribute("data-type");
     var dataoption = this.__element.getAttribute("data-option");

     this.assertEquals(datatype, "domelement");
     this.assertEquals(dataoption, "test");

     //must be ignored:
     q(document).setData("foo", "bar");
     this.assertNull(q(document).getAttribute("data-foo"));
     q(window).setData("foo", "bar");
     this.assertNull(q(window).getAttribute("data-foo"));
   },

   testSetDataAttributeHyphenated : function(){

     this.__element.setData("hyphenated-data-attribute","hyphenated");

     var hyphenatedExpected = this.__element.getAttribute("data-hyphenated-data-attribute");
     var hyphenatedFound = this.__element.getData("hyphenatedDataAttribute");

     this.assertEquals(hyphenatedExpected,hyphenatedFound);

   },

   testGetDataAttribute : function(){

     this.__element.setData("type","domelement");
     this.__element.setData("option","test");

     var expected = this.__element.getAttribute("data-type");
     var found = this.__element.getData("type");

     this.assertEquals(expected,found);

     var expected2 = this.__element.getAttribute("data-option");
     var found2 = q("#testEl").getData("option");

     this.assertEquals(expected2,found2);

   },

   testGetAllData : function(){

     this.__element.setData("type","domelement");
     this.__element.setData("option","test");
     this.__element.setData("hyphenated-data-attribute","hyphenated");

     var expected = q("#testEl").getAllData();

     var datatype = "domelement";
     var dataoption = "test";
     var dataHyphenated = "hyphenated";


     this.assertEquals(expected.type,datatype);
     this.assertEquals(expected.option,dataoption);
     this.assertEquals(expected.hyphenatedDataAttribute,dataHyphenated);
   },

   testRemoveData : function(){
     this.__element.setData("hyphenated-data-attribute","hyphenated");
     q("#testEl").removeData("hyphenatedDataAttribute");
     var found = q("#testEl").getData("hyphenatedDataAttribute");
     this.assertNull(this.__element.getAttribute("data-hyphenated-data-attribute"));

     //must be ignored:
     q(window).removeData("fooBar");
     q(document).removeData("fooBar");
   },

   testHasData : function() {
    this.assertFalse(this.__element.hasData());
    this.__element.setData("type", "test");
    this.assertTrue(this.__element.hasData());
    this.__element.removeData("type");
    this.assertFalse(this.__element.hasData());
   }

});


testrunner.define({
  classname : "Placeholder",

  setUp : function() {
    if (q.env.get("css.placeholder")) {
      this.skip("Native placeholder supported.");
    }
    testrunner.globalSetup();
  },

  tearDown : function() {
    if (!q.env.get("css.placeholder")) {
      testrunner.globalTeardown();
    }
  },


  __test : function(input) {
    input.appendTo(document.body);
    input.updatePlaceholder();

    var placeholderEl = input.getProperty(q.$$qx.module.Placeholder.PLACEHOLDER_NAME);
    this.assertEquals("Hmm", placeholderEl.getHtml());
    this.assertTrue(placeholderEl.getProperty("offsetWidth") > 0);

    input.setValue("123");
    input.updatePlaceholder();

    this.assertTrue(placeholderEl.getProperty("offsetWidth") == 0);

    input.remove().updatePlaceholder();
  },

  testTextField : function() {
    this.__test(q.create("<input type='text' placeholder='Hmm' />"));
  },

  testPasswordField : function() {
    this.__test(q.create("<input type='password' placeholder='Hmm' />"));
  },

  testTextArea : function() {
    this.__test(q.create("<textarea placeholder='Hmm'></textarea>"));
  },

  testUpdateStatic : function() {
    var all = q.create(
      "<div><input type='text' placeholder='Hmm' />" +
      "<textarea placeholder='Hmm'></textarea>" +
      "<input type='password' placeholder='Hmm' /></div>"
    );
    all.appendTo(document.body);

    q.placeholder.update();
    var self = this;
    all.getChildren("input,textarea").forEach(function(input) {
      input = q(input);

      var placeholderEl = input.getProperty(q.$$qx.module.Placeholder.PLACEHOLDER_NAME);
      self.assertEquals("Hmm", placeholderEl.getHtml());
      input.remove().updatePlaceholder();
    });

    all.remove();
  },

  testAbsolute : function() {
    q.create('<div id="container">').setStyles({
      position: "absolute",
      top: "50px"
    }).appendTo("#sandbox");

    var input = q.create('<input type="text" placeholder="placeholder">').appendTo("#container");
    q.placeholder.update();
    this.assertEquals(input.getPosition().top, q("#sandbox label").getPosition().top);
  }
});

testrunner.define({
  classname : "FakeServer",

  tearDown : function() {
    q.dev.fakeServer.restore();
  },

  testConfiguredResponse : function() {
    var url = "/doesnotexist" + Date.now();
    var expectedResponse = "OK";

    q.dev.fakeServer.configure([
      {
        method: "GET",
        url: url,
        response: expectedResponse
      }
    ]);

    var req = q.io.xhr(url).on("readystatechange", function(xhr) {
      if (xhr.status == 200 && xhr.readyState == 4 && xhr.responseText == expectedResponse) {
        this.resume();
      }
    }, this).send();

    this.wait();
  },

  testRemoveResponse : function() {
    var url = "/doesnotexist" + Date.now();
    var expectedResponse = "OK";

    q.dev.fakeServer.configure([
      {
        method: "GET",
        url: url,
        response: expectedResponse
      }
    ]);

    q.dev.fakeServer.removeResponse("GET", url);

    var req = q.io.xhr(url).on("readystatechange", function(xhr) {
      if (xhr.status == 404 && xhr.readyState == 4) {
        this.resume();
      }
    }, this).send();

    this.wait();
  },

  testRespondWith : function() {
    var url = "/doesnotexist" + Date.now();
    var expectedResponse = "OK";
    q.dev.fakeServer.respondWith("GET", url, expectedResponse);

    var req = q.io.xhr(url).on("readystatechange", function(xhr) {
      if (xhr.status == 200 && xhr.readyState == 4 && xhr.responseText == expectedResponse) {
        this.resume();
      }
    }, this).send();

    this.wait();
  }

});


testrunner.define({
  classname: "TextSelection",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  __testSelection : function(coll, selected) {
    var isIe8 = q.env.get("engine.name") == "mshtml" && q.env.get("browser.documentmode") < 9;
    coll.setTextSelection(5, 9);
    this.assertEquals(4, coll.getTextSelectionLength(), "selected length");
    this.assertEquals(5, coll.getTextSelectionStart(), "selected start");
    this.assertEquals(9, coll.getTextSelectionEnd(), "selected end");
    this.assertEquals(selected, coll.getTextSelection(), "selected text");

    coll.clearTextSelection();
    this.assertEquals(0, coll.getTextSelectionLength(), "cleared length");
    if (!isIe8 || coll[0].tagName.toLowerCase() !== "textarea") {
      this.assertEquals(0, coll.getTextSelectionStart(), "cleared start");
    }
    if (!isIe8 || coll[0].tagName.toLowerCase() !== "span" && coll[0].tagName.toLowerCase() !== "textarea") {
      this.assertEquals(0, coll.getTextSelectionEnd(), "cleared end");
    }
    this.assertEquals("", coll.getTextSelection(), "cleared text");
  },

  testInput : function() {
    var coll = q.create('<input type="text" value="Just some text" />')
    .appendTo("#sandbox");
    this.__testSelection(coll, "some");
  },

  testTextarea : function() {
    var coll = q.create('<textarea>Just some text</textarea>')
    .appendTo("#sandbox");
    this.__testSelection(coll, "some");
  },

  testSpan : function() {
    var coll = q.create('<span>Just some text</span>')
    .appendTo("#sandbox");
    this.__testSelection(coll, "some");
  },

  testNoText : function() {
    var coll = q.create("<h1></h1>");
    coll.push(window);
    coll.push(document.documentElement);
    // Should not throw:
    coll.setTextSelection(5, 9);
    coll.getTextSelectionLength();
    coll.getTextSelectionStart();
    coll.getTextSelectionEnd();
    coll.getTextSelection();
  }
});


testrunner.define({
  classname: "FunctionUtil",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testFunctionDebounce : function() {
    var called = 0;
    var checkCalled;

    var spy = function() {
      called++;
    };

    var deferred = q.func.debounce(spy, 300);
    deferred();

    window.setTimeout((function() {
      checkCalled = (called === 0);
    }).bind(this), 200);

    window.setTimeout((function() {
      this.resume(function() {
        this.assertTrue(checkCalled);
        this.assertEquals(1, called);
      });
    }).bind(this), 800);

    this.wait(1000);
  },

  testFunctionDebounceWithEvents : function() {
    var callCounter = 0;
    var context;
    var data;
    var myCallback = function(e) {
      callCounter++;
      context = this;
      data = e;
    };

    this.sandbox.on("myEvent", q.func.debounce(myCallback, 200), this.sandbox);

    var counter = 0;
    var intervalId = window.setInterval((function() {
      this.emit("myEvent", "interval_" + counter);
      counter++;

      if (counter === 20) {
        window.clearInterval(intervalId);
      }
    }).bind(this.sandbox), 50);

    var checkContext = this.sandbox;
    this.wait(1500, function() {
      this.assertEquals(1, callCounter);
      this.assertEquals(checkContext, context);
      this.assertEquals("interval_19", data);
    }, this);
  },

  testFunctionDebounceWithImmediateEvents : function() {
    var callCounter = 0;
    var context;
    var data;
    var myCallback = function(e) {
      callCounter++;
      context = this;
      data = e;
    };

    this.sandbox.on("myEvent", q.func.debounce(myCallback, 200, true), this.sandbox);

    var counter = 0;
    var intervalId = window.setInterval((function() {
      this.emit("myEvent", "interval_" + counter);
      counter++;

      if (counter === 20) {
        window.clearInterval(intervalId);

        window.setTimeout((function() {
          this.emit("myEvent", "interval_" + counter);
        }).bind(this), 500);
      }
    }).bind(this.sandbox), 50);

    var checkContext = this.sandbox;
    this.wait(2000, function() {
      this.assertEquals(2, callCounter);
      this.assertEquals(checkContext, context);
      this.assertEquals("interval_20", data);
    }, this);
  },


  testFunctionThrottle : function()
  {
    var intervalCounter = 0;
    var callInfo = [];
    var spy = function() {
      callInfo.push(Date.now());
    };
    var throttled = q.func.throttle(spy, 250);

    var intervalId = window.setInterval((function() {
      throttled(intervalCounter);
      if (intervalCounter == 20) {
        window.clearInterval(intervalId);
      }
      intervalCounter++;
    }).bind(this), 80);

    window.setTimeout((function() {
      this.resume(function() {
        this.assertEquals(7, callInfo.length);
      });
    }).bind(this), 1800);

    this.wait(2000);
  },

  testFunctionThrottleNoTrailing : function()
  {
    var intervalCounter = 0;
    var callInfo = [];
    var spy = function() {
      callInfo.push(Date.now());
    };
    var throttled = q.func.throttle(spy, 500, { trailing: false });

    var intervalId = window.setInterval((function() {
      throttled();
      if (intervalCounter == 20) {
        window.clearInterval(intervalId);
      }
      intervalCounter++;
    }).bind(this), 80);

    window.setTimeout((function() {
      this.resume(function() {
        this.assertEquals(3, callInfo.length);
      });
    }).bind(this), 1300);

    this.wait(2000);
  },

  testFunctionThrottleNoLeadingNoTrailing : function()
  {
    var intervalCounter = 0;
    var callInfo = [];
    var spy = function() {
      callInfo.push(Date.now());
    };
    var throttled = q.func.throttle(spy, 500, { leading: false, trailing: false });

    var intervalId = window.setInterval((function() {
      throttled();
      if (intervalCounter == 20) {
        window.clearInterval(intervalId);
      }
      intervalCounter++;
    }).bind(this), 80);

    window.setTimeout((function() {
      this.resume(function() {
        this.assertEquals(2, callInfo.length);
      });
    }).bind(this), 1300);

    this.wait(2000);
  },

  testFunctionThrottleWithEvents : function()
  {
    var context;
    var callInfo = [];
    var spy = function(e) {
      context = this;
      callInfo.push(Date.now());
    };
    this.sandbox.on("myEvent", q.func.throttle(spy, 400), this.sandbox);

    var counter = 0;
    var intervalId = window.setInterval((function() {
      this.emit("myEvent");

      if (counter === 4) {
        window.clearInterval(intervalId);
      }
      counter++;
    }).bind(this.sandbox), 150);

    var checkContext = this.sandbox;
    this.wait(1500, function() {
      this.assertEquals(checkContext, context);
      this.assertEquals(3, callInfo.length);
    }, this);
  },

  testFunctionThrottleWithLeadingEvents : function() {
    var context;
    var callInfo = [];
    var spy = function(e) {
      context = this;
      callInfo.push(Date.now());
    };
    this.sandbox.on("myEvent", q.func.throttle(spy, 250, { trailing: false }), this.sandbox);

    var counter = 0;
    var intervalId = window.setInterval((function() {
      this.emit("myEvent");

      if (counter === 14) {
        window.clearInterval(intervalId);

        window.setTimeout((function() {
          this.emit("myEvent");
        }).bind(this), 500);
      }
      counter++;
    }).bind(this.sandbox), 100);

    var checkContext = this.sandbox;
    this.wait(2500, function() {
      this.assertEquals(6, callInfo.length);
      this.assertEquals(checkContext, context);
    }, this);
  }
});


testrunner.define({
  classname: "ObjectUtil",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testObjectMerge : function() {

    var target = {
      name: 'vanillebaer',
      test: {
        foo: 'bar'
      }
    };

    var source = {
      surname: 'flachzange',
      test: {
        bar: 'baz'
      }
    };

    var source2 = {
      middlename: 'bambi',
      secondTest: [ 0, 1, 2 ]
    };

    var result = q.object.merge(target, source, source2);

    this.assertObject(result, 'Result value has to be an object!');
    this.assertKeyInMap('name', result);
    this.assertKeyInMap('surname', result);
    this.assertKeyInMap('test', result);
    this.assertEquals(result.test, source.test);

    this.assertKeyInMap('middlename', result);
    this.assertKeyInMap('secondTest', result);
    this.assertArrayEquals(result.secondTest, [0, 1, 2]);
  }
});



/* **************
 * WIDGETS
 * ************ */


testrunner.define({
  classname: "ui.Widget",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testConstructor : function() {
    var w = new qxWeb.$$qx.ui.website.Widget(qxWeb("#sandbox"));
    w.init();
    this.assertEquals("qx.ui.website.Widget", w.getAttribute("data-qx-class"));
  },

  testIsCollection : function() {
    var w = new qxWeb.$$qx.ui.website.Widget(qxWeb("#sandbox"));
    this.assertTrue(w instanceof qxWeb);
  },

  testSetGetConfigProperty : function() {
    var w = new qxWeb.$$qx.ui.website.Widget(qxWeb("#sandbox"));
    w.setConfig("a", 123);
    this.assertEquals(123, w.getConfig("a"));
  },

  testSetGetConfigAttribute : function() {
    var value = ["bar", "baz"];
    var coll = qxWeb.create("<div>").setAttribute("data-qx-config-foo-bar", JSON.stringify(value));
    var w = new qxWeb.$$qx.ui.website.Widget(coll);
    this.assertArrayEquals(value, w.getConfig("fooBar"));
  },

  testDispose : function() {
    var w = new qxWeb.$$qx.ui.website.Widget(qxWeb("#sandbox"));
    w.init();
    this.assertEquals("qx.ui.website.Widget", qxWeb("#sandbox").classname);
    this.assertInstance(w.dispose(), qxWeb);
    this.assertEquals("qxWeb", qxWeb("#sandbox").classname);
  },

  testDisposeWithConfig : function() {
    var w = new qxWeb.$$qx.ui.website.Widget(qxWeb("#sandbox"));
    w.setConfig("test", "123");
    w.setTemplate("test", "456");
    w.dispose();
    w = new qxWeb.$$qx.ui.website.Widget(qxWeb("#sandbox"));
    this.assertUndefined(w.getConfig("test"));
    this.assertUndefined(w.getTemplate("test"));
    this.assertUndefined(w.getTemplate("uiuibgkabfg"));
  },

  testOnOffWidget : function() {
    var w = new qxWeb.$$qx.ui.website.Widget(qxWeb("#sandbox"));
    var called = 0;
    var clb = function() {
      called++;
    };
    w.$onFirstCollection("foo", clb, w);

    w.emit("foo");
    this.assertEquals(1, called);

    w.$onFirstCollection("foo", clb, w);

    w.emit("foo");
    this.assertEquals(2, called);

    w.$offFirstCollection("foo", clb, w);
    w.emit("foo");
    this.assertEquals(2, called);
  },

  testOnOffWidgetDifferentCallback : function() {
    var w = new qxWeb.$$qx.ui.website.Widget(qxWeb("#sandbox"));
    var called = 0;
    var clb = function() {
      called++;
    };
    w.$onFirstCollection("foo", clb, w);

    w.emit("foo");
    this.assertEquals(1, called);

    w.$onFirstCollection("foo", function() {
      clb();
    }, w);

    w.emit("foo");
    this.assertEquals(3, called);

    w.$offFirstCollection("foo", clb, w);
    w.emit("foo");
    this.assertEquals(4, called);
  },

  testOnOffWidgetDifferentContext : function() {
    var w = new qxWeb.$$qx.ui.website.Widget(qxWeb("#sandbox"));
    var called = 0;
    var clb = function() {
      called++;
    };
    w.$onFirstCollection("foo", clb, {});

    w.emit("foo");
    this.assertEquals(1, called);

    w.$onFirstCollection("foo", clb, {});

    w.emit("foo");
    this.assertEquals(2, called);

    w.$offFirstCollection("foo", clb, {});
    w.emit("foo");
    this.assertEquals(2, called);
  },

  testOnOffWidgetMultipleItems : function() {
    q.create("<div></div><div></div>").appendTo(this.sandbox);
    this.sandbox.getChildren().setData("qxClass", "qx.ui.website.Widget");
    var w = this.sandbox.getChildren();
    var called = 0;
    var clb = function() {
      called++;
    };
    w.$onFirstCollection("foo", clb, w);

    w.emit("foo");
    this.assertEquals(2, called);

    w.$onFirstCollection("foo", clb, w);

    w.emit("foo");
    this.assertEquals(4, called);

    w.getFirst().emit("foo");
    this.assertEquals(5, called);

    w.$offFirstCollection("foo", clb, w);
    w.getFirst().emit("foo");
    this.assertEquals(5, called);
  },

  testOnOffWidgetMultipleCollections : function() {
    new qxWeb.$$qx.ui.website.Widget(qxWeb("#sandbox"));
    var called = 0;
    var clb = function() {
      called++;
    };
    q("#sandbox").$onFirstCollection("foo", clb, q("#sandbox"));

    q("#sandbox").emit("foo");
    this.assertEquals(1, called);

    q("#sandbox").$onFirstCollection("foo", clb, q("#sandbox"));

    q("#sandbox").emit("foo");
    this.assertEquals(2, called);

    q("#sandbox").$offFirstCollection("foo", clb, q("#sandbox"));
    this.assertEquals(2, called);
  },

  testInitWidgets : function() {
    var el1 = q.create("<div id='el1' data-qx-class='qx.ui.website.Widget'></div>").appendTo(q("#sandbox"));
    var el2 = q.create("<div id='el2' data-qx-class='qx.ui.website.Widget'></div>").appendTo(q("#sandbox"));
    q.initWidgets("#el1");
    this.assertTrue(el1.hasClass("qx-widget"));
    this.assertFalse(el2.hasClass("qx-widget"));
  }
});


testrunner.define({
  classname: "ui.Button",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testPlainConstructor : function() {
    var b = q("#sandbox").button();
    this.assertTrue(b.hasClass("qx-button"));
    this.assertEquals(1, b.find("span").length);
    this.assertEquals(1, b.find("img").length);
    this.assertEquals("none", b.find("img").getStyle("display"));
  },

  testFullConstructor : function() {
    var label = "Label";
    var img = "http://qooxdoo.org/_media/website.png";
    var b = q("#sandbox").button(label, img);
    this.assertEquals(label, b.find("span").getHtml());
    this.assertEquals(img, b.find("img").getAttribute("src"));
    this.assertEquals("inline", b.find("img").getStyle("display"));
  },

  testGetSetLabel : function() {
    var b = q("#sandbox").button();
    this.assertNull(b.getLabel());
    b.setLabel("Foo");
    this.assertEquals("Foo", b.getLabel())
  },

  testGetSetIcon : function() {
    var img = "http://qooxdoo.org/_media/website.png";
    var b = q("#sandbox").button();
    this.assertNull(b.getIcon());
    b.setIcon(img);
    this.assertEquals(img, b.getIcon());
  },

  testSetMenu : function() {
    var menu = q.create("<div>").setStyle("display", "none").appendTo("#sandbox");
    var b = q.create("<button>").appendTo("#sandbox").button().setMenu(menu);
    var ev = {stopPropagation : function() {}};
    b.emit("tap", ev);
    this.assertEquals("block", menu.getStyle("display"));
    this.assertEquals("absolute", menu.getStyle("position"));
    b.emit("tap", ev);
    this.assertEquals("none", menu.getStyle("display"));
  }
});

testrunner.define({
  classname: "ui.Rating",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testPlainConstructor : function() {
    var r = q("#sandbox").rating();
    this.assertEquals(0, r.getValue());
    this.assertEquals(5, r.getConfig("length"));
    this.assertEquals("★", r.getConfig("symbol"));
  },

  testFullConstructor : function() {
    var r = q("#sandbox").rating(7, "X", 11);
    this.assertEquals(7, r.getValue());
    this.assertEquals(11, r.getConfig("length"));
    this.assertEquals("X", r.getConfig("symbol"));
  },

  testSetGetValue : function() {
    var r = q("#sandbox").rating();
    r.setValue(3);
    this.assertEquals(3, r.getValue());
  },

  testChangeEvent : function() {
    var r = q("#sandbox").rating();
    var triggered = false;
    r.on("changeValue", function(value) {
      triggered = true;
      this.assertEquals(3, value);
    }, this);
    r.setValue(3);
    this.assertTrue(triggered);
  },

  testSetSymbol : function() {
    var r = q("#sandbox").rating();
    this.assertEquals("★", r.getChildren().getHtml());
    r.setConfig("symbol", "X").render();
    this.assertEquals("X", r.getChildren().getHtml());
  },

  testSetLength : function() {
    var r = q("#sandbox").rating();
    this.assertEquals(5, r.getChildren().length);
    r.setValue(2);
    r.setConfig("length", 7).render();
    this.assertEquals(7, r.getChildren().length);
    this.assertEquals(2, r.getValue());
  },

  testTwoCollections : function() {
    var r = q("#sandbox").rating();
    var rr = q("#sandbox").rating();
    r.setValue(2);
    this.assertEquals(2, r.getValue());
    this.assertEquals(2, rr.getValue());
  },

  testTwoRatings : function() {
    q.create("<div/><div/>").rating().appendTo("#sandbox");
    q("#sandbox").getChildren().setValue(2);
    this.assertEquals(2, q("#sandbox").getChildren().getValue());
    this.assertEquals(2, q("#sandbox").getChildren().eq(0).getValue());
    this.assertEquals(2, q("#sandbox").getChildren().eq(1).getValue());
  },

  testListenerRemove : function() {
    var r = q("#sandbox").rating();
    var calledChange = 0;
    var calledCustom = 0;

    r.on("changeValue", function() {
      calledChange++;
    });
    r.on("custom", function() {
      calledCustom++;
    });

    r.dispose();
    q("#sandbox").rating().setValue(3).emit("custom");

    this.assertEquals(0, calledChange);
    this.assertEquals(1, calledCustom);
  }
});

testrunner.define({
  classname: "ui.Calendar",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testSetGetValue : function() {
    var now = new Date();
    var cal = q("#sandbox").calendar(now);
    this.assertEquals(now.toDateString(), cal.getValue().toDateString());
  },

  testChangeEvent : function() {
    var cal = q("#sandbox").calendar(now);
    var now = new Date();
    cal.on("changeValue", function() {
      this.resume(function() {
        this.assertEquals(now.toDateString(), cal.getValue().toDateString());
      }, this);
    }.bind(this));

    setTimeout(function() {
      cal.setValue(now);
    }, 100);

    this.wait(250);
  },

  testConfig : function() {
    var now = new Date();
    var cal = q("#sandbox").calendar(now);
    var monthNames = cal.getConfig("monthNames").map(function(month) {
      return month.substr(0, 3).toUpperCase()
    });
    var dayNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    cal.setConfig("monthNames", monthNames).setConfig("dayNames", dayNames).render();

    var displayedMonth = cal.find("thead tr:nth-child(1)").getChildren("td").eq(1).getHtml();
    this.assertEquals(0, displayedMonth.indexOf(monthNames[now.getMonth()]));

    var displayedDays = cal.find("thead tr:nth-child(2) td").toArray().map(function(cell) {
      return qxWeb(cell).getHtml();
    });
    this.assertArrayEquals(dayNames, displayedDays);
  },

  testTemplates : function() {
    var now = new Date();
    var cal = q("#sandbox").calendar(now);

    var newClass = "my-cool-calendar";
    cal.setTemplate("table", cal.getTemplate("table")
      .replace("{{cssPrefix}}-container", "{{cssPrefix}}-container " + newClass));

    var newPrev = "prev";
    cal.setTemplate("controls", cal.getTemplate("controls")
      .replace("&lt;", newPrev));

    cal.render();

    this.assertEquals(1, q("." + newClass).length);

    var displayedPrev = cal.find("thead tr:nth-child(1) td:nth-child(1) button").getHtml();
    this.assertEquals(displayedPrev, newPrev);
  },

  testTwoCollections : function() {
    var now = new Date();
    var c0 = q("#sandbox").calendar();
    var c1 = q("#sandbox").calendar();
    c0.setValue(now);

    this.assertEquals(now.toDateString(), c0.getValue().toDateString());
    this.assertEquals(now.toDateString(), c1.getValue().toDateString());
  },

  testMinDate : function() {
    var cal = q("#sandbox").calendar(new Date(2014, 1, 3));
    cal.setConfig("minDate", new Date(2013, 5, 6));
    // valid date
    cal.setValue(new Date(2013, 5, 6));
    this.assertException(function() {
      cal.setValue(new Date(2013, 5, 5));
    });
  },

  testMaxDate : function() {
    var cal = q("#sandbox").calendar(new Date(2014, 1, 3));
    cal.setConfig("maxDate", new Date(2015, 5, 6));
    // valid date
    cal.setValue(new Date(2015, 5, 6));
    this.assertException(function() {
      cal.setValue(new Date(2015, 5, 7));
    });
  },

  testSelectableWeekDays : function() {
    var cal = q("#sandbox").calendar(new Date(2014, 1, 3));
    cal.setConfig("selectableWeekDays", [1, 2, 3, 4, 5]);
    // valid day
    cal.setValue(new Date(2014, 1, 3));
    this.assertException(function() {
      cal.setValue(new Date(2014, 1, 2));
    });
  },

  testPersistEnabled : function() {
    var slider = q("#sandbox").slider()
    this.assertTrue(slider.getEnabled());
    this.assertFalse(slider.getAttribute("disabled"));
    this.assertFalse(slider.find("button").getAttribute("disabled"));
    slider.setEnabled(false);
    this.assertFalse(slider.getEnabled());
    this.assertTrue(slider.getAttribute("disabled"));
    this.assertTrue(slider.find("button").getAttribute("disabled"));
    slider.render();
    this.assertFalse(slider.getEnabled());
    this.assertTrue(slider.getAttribute("disabled"));
    this.assertTrue(slider.find("button").getAttribute("disabled"));
  }
});

testrunner.define({
  classname: "ui.Slider",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testPlainConstructor : function() {
    var slider = q("#sandbox").slider();
    this.assertTrue(slider.hasClass("qx-slider"));
    this.assertEquals(1, slider.getChildren().length);
    this.assertTrue(slider.getChildren().eq(0).hasClass("qx-slider-knob"));
  },

  testFullConstructor : function() {
    var slider = q("#sandbox").slider(10, [1,2,3,4]);
    this.assertEquals(10, slider.getValue());
    this.assertEquals(0, slider.getConfig("minimum"));
    this.assertEquals(100, slider.getConfig("maximum"));
    this.assertArrayEquals([1,2,3,4], slider.getConfig("step"));
  },

  testSetGetValue : function() {
    var slider = q("#sandbox").slider();
    this.assertEquals(0, slider.getValue());
    slider.setValue(30);
    this.assertEquals(30, slider.getValue());
  },

  testGivenKnob : function() {
    var knob = q.create("<div class='qx-slider-knob test-class'>").appendTo("#sandbox");
    var extra = q.create("<h2>Hello</h2>").appendTo("#sandbox");
    var slider = q("#sandbox").slider();
    this.assertTrue(slider.hasClass("qx-slider"));
    this.assertEquals(2, slider.getChildren().length);
    this.assertEquals(1, slider.getChildren(".test-class").length);
    this.assertEquals(knob[0], slider.getChildren(".test-class")[0]);
    this.assertEquals(1, slider.getChildren("h2").length);
  },

  testStepAsNumber : function() {
    var slider = q("#sandbox").slider().setConfig("step", 10).render();
    this.assertEquals(0, slider.getValue());
    slider.setValue(14);
    this.assertEquals(10, slider.getValue());
    slider.setValue(16);
    this.assertEquals(20, slider.getValue());
  },

  testStepAsArray : function() {
    var slider = q("#sandbox").slider().setConfig("step", [1,2,4,8,16]).render();
    this.assertEquals(1, slider.getValue());
    slider.setValue(4);
    this.assertEquals(4, slider.getValue());
  },

  testStepReset : function() {
    var slider = q("#sandbox").slider().setConfig("step", [1,2,4,8,16]).render();
    slider.setValue(4);
    slider.setConfig("step", null).render();
    this.assertEquals(4, slider.getValue());
  },

  testTwoSliders : function() {
    q.create("<div>").appendTo("#sandbox");
    q.create("<div>").appendTo("#sandbox");
    q("#sandbox").getChildren().slider();
    q("#sandbox").getChildren().eq(1).setValue(30);
    this.assertEquals(0, q("#sandbox").getChildren().eq(0).getValue());
    this.assertEquals(30, q("#sandbox").getChildren().eq(1).getValue());
  },

  testMinMaxValue : function() {
    var slider = q("#sandbox").slider();
    slider.setConfig("minimum", -10);
    slider.setConfig("maximum", 10).render();
    this.assertEquals(0, slider.getValue());
    slider.setValue(-20).render();
    this.assertEquals(-10, slider.getValue());
    slider.setValue(20).render();
    this.assertEquals(10, slider.getValue());
  },

  testMultipleInstances : function() {
    var slider = q("#sandbox").slider();
    this.assertEquals("qx.ui.website.Slider", q("#sandbox").classname);
    q("#sandbox").setValue(10);
    this.assertEquals(10, q("#sandbox").getValue());
  },

  testOffset : function() {
    if (q.env.get("engine.name") === "mshtml" && parseInt(q.env.get("browser.documentmode")) < 9) {
      this.skip("Indigo styles don't work properly in IE8.");
    }
    var slider = q("#sandbox").slider().setConfig("offset", 20).render();
    var knob = slider.getChildren(".qx-slider-knob");
    this.assertEquals(20, knob.getPosition().left);
    slider.setValue(100);
    this.assertEquals(-20, knob.getPosition().right);
  },

  testDragBoundaries : function() {
    var slider = q("#sandbox").slider()
    .setStyles({
      position: "fixed",
      left: 0,
      top: 0,
      width: "500px"
    });

    this.assertEquals(Math.ceil(parseFloat(slider.getStyle("paddingLeft"))), slider._getDragBoundaries().min);
    this.assertEquals(slider.getWidth() - Math.ceil(parseFloat(slider.getStyle("paddingRight"))), slider._getDragBoundaries().max);

    var offset = 10;
    slider.setConfig("offset", offset).render();

    var expectedMin = Math.ceil(parseFloat(slider.getStyle("paddingLeft"))) + offset;
    var expectedMax = slider.getWidth() - Math.ceil(parseFloat(slider.getStyle("paddingRight"))) - offset;
    this.assertEquals(expectedMin, slider._getDragBoundaries().min);
    this.assertEquals(expectedMax, slider._getDragBoundaries().max);
  },

  testNearestValue : function() {
    var slider = q("#sandbox").slider()
    .setStyles({
      position: "fixed",
      left: 0,
      top: 0,
      width: "500px"
    });

    this.assertEquals(0, slider._getNearestValue(0));
    this.assertEquals(50, slider._getNearestValue(slider.getWidth() / 2));
    this.assertEquals(100, slider._getNearestValue(slider.getWidth()));

    slider.setConfig("step", [1, 2, 3, 4, 5, 6, 7]).render();
    this.assertEquals(1, slider._getNearestValue(0));
    this.assertEquals(4, slider._getNearestValue(slider.getWidth() / 2));
    this.assertEquals(7, slider._getNearestValue(slider.getWidth()));
  }
});

testrunner.define({
  classname: "ui.Tabs",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testPlainConstructor : function() {
    var tabs = q("#sandbox").tabs();
    this.assertTrue(tabs.hasClass("qx-tabs"));
    this.assertEquals(1, tabs.getChildren().length);
    this.assertTrue(tabs.getChildren().eq(0).is("ul"));
    if (q.env.get("engine.name") != "mshtml" || q.env.get("browser.documentmode") > 9) {
      this.assertTrue(tabs.hasClass("qx-flex-ready"));
      this.assertTrue(tabs.getChildren().eq(0).hasClass("qx-hbox"));
    }
  },

  testConstructorWithDom : function() {
    q("#sandbox").append(q.create("<ul><li data-qx-tabs-page='#cont1'><button>Foo</button></li><li data-qx-tabs-page='#cont0'><button>Foo</button></li></ul><div id='cont0'>Content0</div><div id='cont1'>Content1</div>"));
    var tabs = q("#sandbox").tabs();
    this.assertTrue(tabs.find("ul li.qx-tabs-button").length == 2);
    this.assertTrue(tabs.find("ul li").getFirst().hasClass("qx-tabs-button-active"));
    this.assertEquals("block", tabs.find("#cont1").getStyle("display"));
    this.assertEquals("none", tabs.find("#cont0").getStyle("display"));
  },

  testAddButton : function() {
    var tabs = q("#sandbox").tabs();
    tabs.addButton("Foo");
    this.assertEquals(1, tabs.find("ul li button").length);
    q("#sandbox").append(q.create("<div id='cont'>content</div>"));
    tabs.addButton("Bar", "#cont");
    this.assertEquals(2, tabs.find("ul li button").length);
    this.assertEquals("none", q("#cont").getStyle("display"));
  },

  testTwoTabs : function() {
    var tabs = q.create('<div/><div/>').appendTo("#sandbox").tabs();
    tabs.addButton("Foo");
    this.assertEquals(2, tabs.find(".qx-tabs-button").length);
  },

  testSelectPage : function() {
    var tabs = q("#sandbox").tabs();
    tabs.addButton("Foo").addButton("Bar");
    this.assertTrue(tabs.find("ul li").getFirst().hasClass("qx-tabs-button-active"));
    this.assertFalse(tabs.find("ul li").eq(1).hasClass("qx-tabs-button-active"));
    tabs.select(1);
    this.assertFalse(tabs.find("ul li").eq(0).hasClass("qx-tabs-button-active"));
    this.assertTrue(tabs.find("ul li").eq(1).hasClass("qx-tabs-button-active"));
  },

  testChangePage : function() {
    var tabs = q("#sandbox").tabs();
    var called = 0;
    tabs.addButton("Foo").addButton("Bar");
    tabs.on("changeSelected", function(idx) {
      called++;
      this.assertEquals(1, idx);
    }, this);
    tabs.select(1);
    this.assertEquals(1, called);
  },

  testDispose : function() {
    var tabs = q("#sandbox").tabs().addButton("Foo").dispose();
    this.assertNull(tabs.getHtml());
    this.assertFalse(tabs.hasClass("qx-tabs"));
  },

  testJustify : function() {
    var tabs = q.create('<div><ul><li class="qx-tabs-button" data-qx-tabs-page="#page1">Page 1</li></ul><div class="qx-tabs-container"><div id="page1" class="qx-tabs-page">Page 1 Content</div></div></div>')
    .appendTo("#sandbox").tabs();
    if (q.env.get("engine.name") == "mshtml" && q.env.get("browser.documentmode") < 10) {
      this.assertFalse(tabs.hasClass("qx-tabs-justify"));
      tabs.setConfig("align", "justify").render();
      this.assertTrue(tabs.hasClass("qx-tabs-justify"));
    } else {
      this.assertTrue(tabs.find(".qx-flex1").length == 0);
      tabs.setConfig("align", "justify").render();
      this.assertTrue(tabs.find(".qx-flex1").length == 1);
    }
  },

  testRight : function() {
    var tabs = q("#sandbox").tabs("right");
    if (q.env.get("engine.name") == "mshtml" && q.env.get("browser.documentmode") < 10) {
      this.assertTrue(tabs.hasClass("qx-tabs-right"))
      tabs.setConfig("align", "left").render();
      this.assertFalse(tabs.hasClass("qx-tabs-right"));
    } else {
      this.assertTrue(tabs.getChildren().eq(0).hasClass("qx-flex-justify-end"));
      tabs.setConfig("align", "left").render();
      this.assertFalse(tabs.getChildren().eq(0).hasClass("qx-flex-justify-end"));
    }
  },

  testPersistEnabled : function() {
    var tabs = q.create('<div><ul><li class="qx-tabs-button" data-qx-tabs-page="#page1"><button>Page 1</button></li></ul><div class="qx-tabs-container"><div id="page1" class="qx-tabs-page">Page 1 Content</div></div></div>')
    .appendTo("#sandbox").tabs();
    this.assertTrue(tabs.getEnabled());
    this.assertFalse(tabs.getAttribute("disabled"));
    this.assertFalse(tabs.find("button").getAttribute("disabled"));
    tabs.setEnabled(false);
    this.assertFalse(tabs.getEnabled());
    this.assertTrue(tabs.getAttribute("disabled"));
    this.assertTrue(tabs.find("button").getAttribute("disabled"));
    tabs.render();
    this.assertFalse(tabs.getEnabled());
    this.assertTrue(tabs.getAttribute("disabled"));
    this.assertTrue(tabs.find("button").getAttribute("disabled"));
  }
});


testrunner.define({
  classname: "ui.DatePicker",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testReadOnlyInputElement : function() {
    var sandbox = q("#sandbox");
    sandbox.append("<input type='text' id='datepicker' data-qx-class='qx.ui.website.DatePicker' data-qx-config-readonly='false' value=''></input");

    var datepicker = q("input#datepicker").datepicker();

    // config is set via data attribute 'data-qx-config-input-read-only'
    this.assertFalse(datepicker.getAttribute('readonly'));

    datepicker.dispose();
  },

  testReadOnlyInputElementWithConfig : function() {
    var sandbox = q("#sandbox");
    sandbox.append("<input type='text' class='datepicker' data-qx-class='qx.ui.website.DatePicker' value=''></input");
    sandbox.append("<input type='text' class='datepicker' data-qx-class='qx.ui.website.DatePicker' value=''></input");

    var datepicker = q("input.datepicker").datepicker();

    this.assertTrue(datepicker.eq(0).getConfig('readonly'));
    this.assertTrue(datepicker.eq(1).getConfig('readonly'));

    this.assertTrue(datepicker.eq(0).getAttribute('readonly'));
    this.assertTrue(datepicker.eq(1).getAttribute('readonly'));

    datepicker.eq(0).setConfig('readonly', false);
    datepicker.render();

    this.assertFalse(datepicker.eq(0).getAttribute('readonly'));
    this.assertTrue(datepicker.eq(1).getAttribute('readonly'));

    datepicker.dispose();
  },

  testIconOpener : function() {
    var sandbox = q("#sandbox");
    sandbox.append("<input type='text' class='datepicker' data-qx-class='qx.ui.website.DatePicker' value=''></input");

    var datepicker = q("input.datepicker").datepicker();
    datepicker.setConfig('icon', '../../../../application/websitewidgetbrowser/demo/datepicker/office-calendar.png');
    datepicker.render();

    var icon = datepicker.getNext();
    this.assertEquals(1, icon.length);
    this.assertEquals('img', q.getNodeName(icon));
    this.assertEquals('qx-datepicker-icon', icon.getClass());

    datepicker.dispose();
  },

  testIconOpenerToggle : function() {
    var sandbox = q("#sandbox");
    sandbox.append("<input type='text' class='datepicker' data-qx-class='qx.ui.website.DatePicker' value='' />");

    var datepicker = q("input.datepicker").datepicker();
    datepicker.setConfig('icon', '../../../../application/websitewidgetbrowser/demo/datepicker/office-calendar.png');
    datepicker.render();

    datepicker.setConfig('icon', null);
    datepicker.render();

    var icon = datepicker.getNext();
    this.assertEquals(0, icon.length);

    datepicker.dispose();
  },

  testPersistEnabled : function() {
    var sandbox = q("#sandbox");
    sandbox.append("<input type='text' class='datepicker' data-qx-class='qx.ui.website.DatePicker' value='' />");
    var datepicker = q("input.datepicker").datepicker();
    this.assertTrue(datepicker.getEnabled());
    this.assertFalse(datepicker.getAttribute("disabled"));
    datepicker.setEnabled(false);
    this.assertFalse(datepicker.getEnabled());
    this.assertTrue(datepicker.getAttribute("disabled"));
    datepicker.render();
    this.assertFalse(datepicker.getEnabled());
    this.assertTrue(datepicker.getAttribute("disabled"));

    datepicker.dispose();
   }
});
