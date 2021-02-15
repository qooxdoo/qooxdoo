qx.Class.define("testapp.Issue494PartThree", {
  extend: qx.core.Object,
  
  members: {
    myFunction(variable) {
    }
  }
});

/**
 * @ignore(functionName) // Declare in file ./xx/xx/xx.js
 * @ignore(className) // external package
 */
qx.Class.define("testapp.Issue494", {
  extend: qx.core.Object,
  
  members: {
    myFunction(variable) {
      functionName(variable);
      new className(variable);
      className.fct(variable);
      
      new testapp.Issue494PartTwo();
      new testapp.Issue494PartThree();
    }
  }
});

qx.Class.define("testapp.Issue494PartTwo", {
  extend: qx.core.Object,
  
  members: {
    myFunction(variable) {
    }
  }
});
