addSample("q", function() {
  q("#myId");         // containing the element with the id 'myId'
  q(".myClass");      // finds all elements with the class 'myClass'
  q("li");            // finds all 'li' elements
  q(":header");       // finds all header elements (h1 to h6)
  q("#list :header"); // finds all header elements in the element with the id 'list'
});

addSample("q", {
  html: ['<div id="main">',
         '  <h2>first header</h2>',
         '  <p>para 1 (within)</p>',
         '  <p>para 2 (within)</p>',
         '  <div>div 1</div>',
         '</div>',
         '<p>para 3 (outside)</p>'],
  javascript: function() {
    // example for context element

    q("p", q("#main")).setStyle("color", "red");
    // also possible:
    // q("p", document.getElementById("#main")).setStyle("color", "red");
  },
  executable: true
});

addSample("q.define", function() {
  q.define("MyObject", {
    construct : function() {},
    members : {
      method : function() {}
    }
  });
});

addSample("q.define", function() {
  q.define("MyObject", {
    statics : {
      method : function() {}
    }
  });
});

addSample("q.define", function() {
  q.define("MyObject", {
    statics : {
      method : function() {
        // call another static method of this class
        this.otherMethod();
      },
      otherMethod : function() {}
    }
  });
});

addSample("q.define", {javascript :function() {
  // base class
  var Dog = q.define({
    members : {
      bark : function() {
        console.log("wuff");
      }
    }
  });

  // extended class
  var Dachshund = q.define({
    extend : Dog,
    members : {
      bark : function() {
        this.base(arguments); // call 'bark' of Dog
        console.log("wuuuuuuff");
      }
    }
  });
  // create an instance
  var myDog = new Dachshund();
  myDog.bark();
}, executable: true});

addSample("q.define", {
  javascript:function() {
var Dog = q.define({
  statics : {
    complexData : null,

    bark : function() {
      console.log("wuff");
    }
  },
  defer : function(statics) {
    // inside the 'defer' block you have access to the statics
    // e.g. to use the plugin API and add method to q
    q.$attachStatic({
      'bark' : statics.bark
    });

    // or to initialize complex data types
    statics.complexData = [];
  }
});

// works
q.bark();
console.log(Dog.complexData.length);
}, executable: true });

addSample(".concat", {
  html: ['<ul>',
         '  <li class="info">item 1</li>',
         '  <li class="info">item 2</li>',
         '  <li class="desc">item 3</li>',
         '  <li>item 4</li>',
         '</ul>'],
  css: ['.combined {',
        '  color: red;',
        '}'],
  javascript: function() {
    // combine two collections and add class 'combined'
    q(".info").concat(q(".desc")).addClass("combined");
  },
  executable: true
});

addSample(".filter", {
  html: ['<ul>',
         '  <li>item 0</li>',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '  <li>item 3</li>',
         '</ul>'],
  css: ['.even {',
        '  color: red;',
        '}'],
  javascript: function() {
    // remember regarding odd/even: counting begins at 0
    q("li").filter(":even").addClass("even");
  },
  executable: true
});

addSample(".map", {
  html: ['<ul id="list-one">',
         '  <li>item 1</li>',
         '  <li class="desc">item 2</li>',
         '</ul>',
         '<ul id="list-two">',
         '  <li>item 1</li>',
         '  <li class="desc">item 2</li>',
         '</ul>',
         '<ul id="result">',
         '  <!-- append result goes here -->',
         '</ul>'],
  css: ['#list-one {',
        '  color: pink;',
        '}',
        '#list-two {',
        '  color: red;',
        '}',
        '#result {',
        '  color: firebrick;',
        '}'],
  javascript: function() {
    // q.map() => map method which operates on collections
    var parentNodes = q('.desc').map(function(elem) {
      return elem.parentNode;
    }).toArray();

    // Array.map() => map method which operates on arrays
    var ids = parentNodes.map(function(elem) {
      return elem.id;
    });

    q("#result").append("<li>"+ids.join(" *** ")+"</li>");
  },
  executable: true
});

addSample(".slice", {
  html: ['<ul>',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '  <li>item 3</li>',
         '  <li>item 4</li>',
         '</ul>'],
  css: ['.selected {',
        '  color: red;',
        '}'],
  javascript: function() {
    var collection = q("li").slice(1,3).addClass("selected");
    // (collection.length === 2) => item 2, item 3
  },
  executable: true
});

addSample(".splice", {
  html: ['<ul>',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '  <li>item 3</li>',
         '  <li>item 4</li>',
         '</ul>'],
  javascript: function() {
    var collection = q("li");
    // (collection.length === 4)
    var removed = collection.splice(1,2);
    // (removed.length === 3) => item 2, item 3, item 4
    // (collection.length === 1) => item 1
  }
});

addSample("q.$attach", {
  html: ['<div id="root-elem">',
         '  <div>foo <span>should be red</span>, foo <span>should be red</span></div>',
         '  <div>bar</div>',
         '</div>'],
  css: ['.important {',
        '  color: red;',
        '}'],
  javascript: function() {
    // simple sample to get an idea
    q.$attach({"test" : 123}); // q("#id").test == 123

    // more sophisticated sample
    var addClassToEveryChildNamed = function(classToAdd, childElementName) {
      // access to DOM collection (e.g. things captured by q("#id"))
      this._forEachElement(function(item) {
        q(item).getChildren().forEach(function(innerItem) {
          if (q.getNodeName(innerItem) === childElementName.toLowerCase()) {
            q(innerItem).addClass(classToAdd);
          }
        });
      });

      // return this, to allow further method chaining
      return this;
    };

    // make function available with another name (same would be also fine)
    q.$attach({"addClassToEveryChildByName": addClassToEveryChildNamed});

    // try out new method
    q("#root-elem div").addClassToEveryChildByName("important", "span");
  },
  executable: true
});

addSample("q.$attachStatic",function(){
  // simple sample to get an idea
  q.$attachStatic({"test" : 123}); // q.test == 123

  // functionality which does work on DOM collections    => use attach()
  // functionality which doesn't work on DOM collections => use attachStatic()
  var includeStylesheet = function(uri, doc) {
    // ...
  };

  q.$attachStatic({"includeStylesheet": includeStylesheet});
  q.includeStylesheet("http://example.org/", doc);
});


addSample(".debug", function() {
// This code only works in the 'qx.debug' mode. In production mode this method
// simply does nothing and returns the collection.

// Suppose you have the following chain of methods
q("#mySelector").getParents().getSiblings().setStyle('color', '#f00');

// Comparable to the 'logThis' method.
// Can be inserted at any point in the chain and blocks the further processing. If you like to use a
// non-blocking method take a look at the 'logThis' method.
// -> calls the native debugger of your favorite browser for easy introspection
q("#mySelector").getParents().debug().getSiblings().setStyle('color', '#f00');
q("#mySelector").getParents().getSiblings().debug().setStyle('color', '#f00');
});


addSample(".logThis", function() {
// This code only works in the 'qx.debug' mode. In production mode this method
// simply does nothing and returns the collection.

// Suppose you have the following chain of methods
q("#mySelector").getParents().getSiblings().setStyle('color', '#f00');

// Comparable to the 'debug' method.
// Instead of a hard stop using the debugger (like the 'debug' method) this method is non-blocking
// -> logs certains infos (length, DOM elements and the collection instance) to your console
q("#mySelector").getParents().logThis().getSiblings().setStyle('color', '#f00');
q("#mySelector").getParents().getSiblings().logThis().setStyle('color', '#f00');
});