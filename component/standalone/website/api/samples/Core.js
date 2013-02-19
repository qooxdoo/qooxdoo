addSample("q", function() {
  q("#myId"); // containing the element with the id 'myId'
});

addSample("q", function() {
  q(".myClass"); // finds all elements with the class 'myClass'
});

addSample("q", function() {
  q("li"); // finds all 'li' elements
});

addSample("q", function() {
  q(":header"); // finds all header elements (h1 to h6)
});

addSample("q", function() {
  q("#list :header"); // finds all header elements in the element with the id 'list'
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

addSample("q.$attach",function(){
  q.$attach({"test" : 123}); // q("#id").test == 123
});

addSample("q.$attachStatic",function(){
  q.$attachStatic({"test" : 123}); // q.test == 123
});
