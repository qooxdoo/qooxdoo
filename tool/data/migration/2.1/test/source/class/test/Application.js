/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/* ************************************************************************

#asset(test/*)

************************************************************************ */

/**
 * This is the main application class of your custom application "string_trim"
 */
qx.Class.define("test.Application",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     * 
     * @lint ignoreDeprecated(alert)
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */

      // Create a button
      var button1 = new qx.ui.form.Button("First Button", "test/test.png");

      // Document is the application root
      var doc = this.getRoot();

      // Add button to document at fixed coordinates
      doc.add(button1, {left: 100, top: 50});

      // Add an event listener
      button1.addListener("execute", function(e) {
        alert("Hello World!");
      });

      var trim = 3;
      var foo = qx.lang.String.trim("bar");
      var a = foo.qx.lang.String.trim("soop");   // honeypots for the tree matching
      var b = qx.lang.String.trim.foo(2);

      // use case from bug#7063
      var value = "foo bar baz";
      var lastBreakChar = 6;
      var c = qx.lang.String.trim(value.substr(lastBreakChar + 1));

      // more patch cases
      qx.bom.element.Overflow.getX(elem);
          //1, "qx.bom.element.Style.get(%(1)s, 'overflowX')" ),
      qx.bom.element.Overflow.setX(elem, "visible");
          //2, "qx.bom.element.Style.set(%(1)s, 'overflowX', %(2)s)" ),
      qx.bom.element.Overflow.resetX(elem);
          //1, "qx.bom.element.Style.reset(%(1)s, 'overflowX')" ),
      qx.bom.element.Overflow.compileX("hidden");
          //1, "qx.bom.element.Style.get({'overflowX' : %(1)s})" ),

      qx.bom.element.Overflow.getY(elem);
          //1, "qx.bom.element.Style.get(%(1)s, 'overflowY')" ),
      qx.bom.element.Overflow.setY(elem, "visible");
          //2, "qx.bom.element.Style.set(%(1)s, 'overflowY', %(2)s)" ),
      qx.bom.element.Overflow.resetY(elem);
          //1, "qx.bom.element.Style.reset(%(1)s, 'overflowY')" ),
      qx.bom.element.Overflow.compileY("hidden");
          //1, "qx.bom.element.Style.get({'overflowY' : %(1)s})" ),

      qx.lang.String.trim("bar");
          //1, "(%(1)s).trim()" ),

      qx.Bootstrap.getKeys({a:1,b:2,c:3});
          //1, "Object.keys(%(1)s)" ),
      qx.Bootstrap.getKeysAsString({a:1,b:2,c:3});
          //1, '''('"' + qx.Bootstrap.keys(%(1)s).join('\", "') + '"')''' ),

      qx.lang.Array.toArray([1,2,3]);
          //1, "qx.lang.Array.cast(%(1)s, Array)" ),
      qx.lang.Array.toArray([1,2,3], 2);
          //2, "qx.lang.Array.cast(%(1)s, Array, %(2)s)" ),
      qx.lang.Array.fromCollection([1,2,3]);
          //1, "Array.prototype.slice.call(%(1), 0)" ),

      qx.lang.Object.hasMinLength({a:1,b:2,c:3}, 3);
          //2, "(%(1)s.length >= %(2)s)" ),
      qx.lang.Object.getKeys({a:1,b:2,c:3})
          //1, "Object.keys(%(1)s)" ),
      qx.lang.Object.getKeysAsString({a:1,b:2,c:3})
          //1, '''('"' + qx.Bootstrap.keys(%(1)s).join('\", "') + '"')''' ),
      qx.lang.Object.select ('a', {a:1,b:2,c:3})
          //2, "%(2)s[%(1)s]" ),
      qx.lang.Object.carefullyMergeWith({a:1,b:2}, {c:3,d:4});
          //2, "qx.lang.Object.mergeWith(%(1)s, %(2)s, false)" ),
    }
  }
});
