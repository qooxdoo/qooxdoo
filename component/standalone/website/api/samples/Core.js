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
