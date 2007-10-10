qx.Class.define("app", {

  construct: function(a,b,c) {

    // nice comment
    var i=0,j;
    // comment after

    var mJuhu = "juhu";

    var fuzzy = new Object;
    var arr = [ "hello", "world" ];

    this.m2 = 42;

   /**
    * Private function
    * @param {Object} j
    */

    var privateFunction = function(j) {
      var x = 12;
      x = i+j;
      alert(i);
      alert(mJuhu);
      self.foo();
      arr.push("foo");

      var boo = function() {
        var y = i+j;
        var i=12;
        var boooo = "123";
        x = i+j+mJuhu;
      }
    };


    var createDomainLoadHandler = function(domain, state, userHandler, silent) {
      return function(result, exc){
        onDomainLoadResult.call(this, // Forward this in case the event listener calling this code
                                      // was called via .call with an object param
                                domain, state, result, exc, userHandler, silent);
      };
    };

    var self = this;

    var superFoo = this.foo;
    var superBar = self.bar;

    self.foo = function() {
      superFoo.call()
      self.privateFunction();
    }

  },

  members : {}
});