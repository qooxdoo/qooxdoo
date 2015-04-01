addSample("Function.bind", {
  javascript: function () {
    // sample code, assumes the used variables are already defined
    // the listener method demonstrates how to pass dynamic values
    // to a method using 'bind'
    var changeValueListener = function (value, event) {
      // value is passed by the 'bind' method: its value is 'myArray[i]'
      // second argument is passed by the 'on' method: its value is a event object
      // 'this' is pointing to 'myComponent', since the first argument of 'bind' defines the context of the function call
    };
    var myArray = [0, 2, 4, 6];
    for (var i = 0, j = myArray.length; i < j; i++) {
      myComponent.on("changeValue", changeValueListener.bind(myComponent, myArray[i]));
    }
  }
});