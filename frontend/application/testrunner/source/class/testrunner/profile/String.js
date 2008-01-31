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

qx.Class.define("testrunner.profile.String",
{
  extend : testrunner.TestCase,



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
     * @type member
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

      this.profile("string split with match.");
      fcn();
      this.profileEnd();

      for (var i=0; i<loops; i++) {
        fcnArr[i + 1] = "a.indexOf('|');";
      }

      var fcn = eval(fcnArr.join("\n"));

      this.profile("string indexOf with match.");
      fcn();
      this.profileEnd();

      for (var i=0; i<loops; i++) {
        fcnArr[i + 1] = "if (a.indexOf('|') >= 0) {a.split('|')};";
      }

      var fcn = eval(fcnArr.join("\n"));

      this.profile("string conditional split with match.");
      fcn();
      this.profileEnd();

      // no match
      fcnArr[0] = "function() { var a = 'assdfsdfhfgh';";

      for (var i=0; i<loops; i++) {
        fcnArr[i + 1] = "a.split('|');";
      }

      var fcn = eval(fcnArr.join("\n"));

      this.profile("string split without match.");
      fcn();
      this.profileEnd();

      for (var i=0; i<loops; i++) {
        fcnArr[i + 1] = "a.indexOf('|');";
      }

      var fcn = eval(fcnArr.join("\n"));

      this.profile("string indexOf without match.");
      fcn();
      this.profileEnd();

      for (var i=0; i<loops; i++) {
        fcnArr[i + 1] = "if (a.indexOf('|') >= 0) {a.split('|')};";
      }

      var fcn = eval(fcnArr.join("\n"));

      this.profile("string conditional split without match.");
      fcn();
      this.profileEnd();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    testSplitOptimize : function()
    {
      var strings = qx.lang.Object.getKeys(qx.Class.__registry);
      var loopCount = 100;
      var splitter = ".";

      function mySplit1(str, splitter)
      {
        var res = [];
        var start = end = 0;

        while (true)
        {
          end = str.indexOf(splitter, start);

          if (end < 0)
          {
            res.push(str.substring(start, str.length));
            break;
          }

          res.push(str.substring(start, end));

          start = end + 1;
        }

        return res;
      }

      function mySplit2(str, splitter)
      {
        var res = [];
        var start = end = 0;

        for (var i=0; i<str.length; i++)
        {
          var c = str.charAt(i);

          if (c == splitter)
          {
            res.push(str.substring(start, end));
            end++;
            start = end;
          }
          else
          {
            end++;
          }
        }

        if (start != end) {
          res.push(str.substring(start, end));
        }

        return res;
      }

      function mySplit3(str, splitter)
      {
        var res = [];
        var part = [];

        for (var i=0; i<str.length; i++)
        {
          var c = str.charAt(i);

          if (c == splitter)
          {
            res.push(part.join(""));
            part = [];
          }
          else
          {
            part.push(c);
          }
        }

        if (part.length > 0) {
          res.push(part.join(""));
        }

        return res;
      }

      for (var i=0; i<strings.length; i++)
      {
        var s = strings[i];
        var reference = s.split(splitter);
        this.assertJsonEquals(reference, mySplit1(s, splitter));
        this.assertJsonEquals(reference, mySplit2(s, splitter));
        this.assertJsonEquals(reference, mySplit3(s, splitter));
      }

      this.profile("split native");

      (function()
      {
        for (var i=0; i<strings.length; i++)
        {
          var s = strings[i];

          for (var loop=0; loop<loopCount; loop++) {
            s.split(splitter);
          }
        }
      })();

      this.profileEnd();

      this.profile("split 1");

      (function()
      {
        for (var i=0; i<strings.length; i++)
        {
          var s = strings[i];

          for (var loop=0; loop<loopCount; loop++) {
            mySplit1(s, splitter);
          }
        }
      })();

      this.profileEnd();

      this.profile("split 2");

      (function()
      {
        for (var i=0; i<strings.length; i++)
        {
          var s = strings[i];

          for (var loop=0; loop<loopCount; loop++) {
            mySplit2(s, splitter);
          }
        }
      })();

      this.profileEnd();

      this.profile("split 3");

      (function()
      {
        for (var i=0; i<strings.length; i++)
        {
          var s = strings[i];

          for (var loop=0; loop<loopCount; loop++) {
            mySplit3(s, splitter);
          }
        }
      })();

      this.profileEnd();
    }
  }
});
