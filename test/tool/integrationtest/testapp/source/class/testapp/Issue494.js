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
