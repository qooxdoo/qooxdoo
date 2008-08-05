/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("testrunner.profile.Profile",
{
  extend : qx.dev.unit.TestCase,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * TODOC
     *
     * @return {void}
     */
    testProfileObjectCreate : function()
    {
      if (!window.console) {
        return;
      }

      var loops = 1000;

      console.profile("object create empty");
      var ex = "test.Empty1_";
      var d = new Date();

      for (var i=0; i<loops; i++)
      {
        qx.Class.define(ex + i,
        {
          extend    : Object,
          construct : function() {}
        });
      }

      console.profileEnd();

      console.profile("object create complex");

      for (var i=0; i<loops; i++)
      {
        qx.Class.define("testrunner.Empty2_" + i,
        {
          extend : qx.core.Object,
          construct : function() {},
          type : "abstract",

          statics :
          {
            a : 1,
            b : "juhu",
            c : false,


            /**
             * TODOC
             *
             * @return {void}
             */
            d : function() {}
          },

          members :
          {
            a : 1,
            b : "juhu",
            c : false,


            /**
             * TODOC
             *
             * @return {void}
             */
            d : function() {}
          },

          properties :
          {
            prop1 : { _legacy : true },
            prop2 : { _legacy : true },
            prop3 : { _legacy : true },
            prop4 : { _legacy : true }
          }
        });
      }

      console.profileEnd();

      console.profile("object create complex without properties");

      for (var i=0; i<loops; i++)
      {
        qx.Class.define("testrunner.Empty3_" + i,
        {
          extend : qx.core.Object,
          construct : function() {},
          type : "abstract",

          statics :
          {
            a : 1,
            b : "juhu",
            c : false,


            /**
             * TODOC
             *
             * @return {void}
             */
            d : function() {}
          },

          members :
          {
            a : 1,
            b : "juhu",
            c : false,


            /**
             * TODOC
             *
             * @return {void}
             */
            d : function() {}
          }
        });
      }

      console.profileEnd();
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    testProfileString : function()
    {
      var loops = 1000;
      var fcnArr = [];
      fcnArr.push("function() { var a = 'assdfsd|fhfgh';");

      for (var i=0; i<loops; i++) {
        fcnArr[i + 1] = "a.split('|');";
      }

      fcnArr.push("}");
      var fcn = eval(fcnArr.join("\n"));

      console.profile("string split with match.");
      fcn();
      console.profileEnd();

      for (var i=0; i<loops; i++) {
        fcnArr[i + 1] = "a.indexOf('|');";
      }

      var fcn = eval(fcnArr.join("\n"));

      console.profile("string indexOf with match.");
      fcn();
      console.profileEnd();

      for (var i=0; i<loops; i++) {
        fcnArr[i + 1] = "if (a.indexOf('|') >= 0) {a.split('|')};";
      }

      var fcn = eval(fcnArr.join("\n"));

      console.profile("string conditional split with match.");
      fcn();
      console.profileEnd();

      // no match
      fcnArr[0] = "function() { var a = 'assdfsdfhfgh';";

      for (var i=0; i<loops; i++) {
        fcnArr[i + 1] = "a.split('|');";
      }

      var fcn = eval(fcnArr.join("\n"));

      console.profile("string split without match.");
      fcn();
      console.profileEnd();

      for (var i=0; i<loops; i++) {
        fcnArr[i + 1] = "a.indexOf('|');";
      }

      var fcn = eval(fcnArr.join("\n"));

      console.profile("string indexOf without match.");
      fcn();
      console.profileEnd();

      for (var i=0; i<loops; i++) {
        fcnArr[i + 1] = "if (a.indexOf('|') >= 0) {a.split('|')};";
      }

      var fcn = eval(fcnArr.join("\n"));

      console.profile("string conditional split without match.");
      fcn();
      console.profileEnd();
    }
  }
});
