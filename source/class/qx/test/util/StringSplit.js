/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Adrian Olaru (adrianolaru)

   ======================================================================

   This class contains code based on the following work:

   * Cross-Browser Split
     http://stevenlevithan.com/demo/split.cfm

     Copyright:
       (c) 2006-2007, Steven Levithan <http://stevenlevithan.com>

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Steven Levithan

************************************************************************ */


qx.Class.define("qx.test.util.StringSplit",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    /**
     * @lint ignoreDeprecated(eval)
     */
    testSplit : function()
    {
      var testCode = [
        ["qx.util.StringSplit.split('')",                       [""]],
        ["qx.util.StringSplit.split('', /./)",                  [""]],
        ["qx.util.StringSplit.split('', /.?/)",                 []],
        ["qx.util.StringSplit.split('', /.??/)",                []],
        ["qx.util.StringSplit.split('ab', /a*/)",               ["", "b"]],
        ["qx.util.StringSplit.split('ab', /a*?/)",              ["a", "b"]],
        ["qx.util.StringSplit.split('ab', /(?:ab)/)",           ["", ""]],
        ["qx.util.StringSplit.split('ab', /(?:ab)*/)",          ["", ""]],
        ["qx.util.StringSplit.split('ab', /(?:ab)*?/)",         ["a", "b"]],
        ["qx.util.StringSplit.split('test', '')",               ["t", "e", "s", "t"]],
        ["qx.util.StringSplit.split('test')",                   ["test"]],
        ["qx.util.StringSplit.split('111', 1)",                 ["", "", "", ""]],
        ["qx.util.StringSplit.split('test', /(?:)/, 2)",        ["t", "e"]],
        ["qx.util.StringSplit.split('test', /(?:)/, -1)",       ["t", "e", "s", "t"]],
        ["qx.util.StringSplit.split('test', /(?:)/, undefined)",["t", "e", "s", "t"]],
        ["qx.util.StringSplit.split('test', /(?:)/, null)",     []],
        ["qx.util.StringSplit.split('test', /(?:)/, NaN)",      []],
        ["qx.util.StringSplit.split('test', /(?:)/, true)",     ["t"]],
        ["qx.util.StringSplit.split('test', /(?:)/, '2')",      ["t", "e"]],
        ["qx.util.StringSplit.split('test', /(?:)/, 'two')",    []],
        ["qx.util.StringSplit.split('a', /-/)",                 ["a"]],
        ["qx.util.StringSplit.split('a', /-?/)",                ["a"]],
        ["qx.util.StringSplit.split('a', /-??/)",               ["a"]],
        ["qx.util.StringSplit.split('a', /a/)",                 ["", ""]],
        ["qx.util.StringSplit.split('a', /a?/)",                ["", ""]],
        ["qx.util.StringSplit.split('a', /a??/)",               ["a"]],
        ["qx.util.StringSplit.split('ab', /-/)",                ["ab"]],
        ["qx.util.StringSplit.split('ab', /-?/)",               ["a", "b"]],
        ["qx.util.StringSplit.split('ab', /-??/)",              ["a", "b"]],
        ["qx.util.StringSplit.split('a-b', /-/)",               ["a", "b"]],
        ["qx.util.StringSplit.split('a-b', /-?/)",              ["a", "b"]],
        ["qx.util.StringSplit.split('a-b', /-??/)",             ["a", "-", "b"]],
        ["qx.util.StringSplit.split('a--b', /-/)",              ["a", "", "b"]],
        ["qx.util.StringSplit.split('a--b', /-?/)",             ["a", "", "b"]],
        ["qx.util.StringSplit.split('a--b', /-??/)",            ["a", "-", "-", "b"]],
        ["qx.util.StringSplit.split('', /()()/)",               []],
        ["qx.util.StringSplit.split('.', /()()/)",              ["."]],
        ["qx.util.StringSplit.split('.', /(.?)(.?)/)",          ["", ".", "", ""]],
        ["qx.util.StringSplit.split('.', /(.??)(.??)/)",        ["."]],
        ["qx.util.StringSplit.split('.', /(.)?(.)?/)",          ["", ".", undefined, ""]],
        ["qx.util.StringSplit.split('tesst', /(s)*/)",          ["t", undefined, "e", "s", "t"]],
        ["qx.util.StringSplit.split('tesst', /(s)*?/)",         ["t", undefined, "e", undefined, "s", undefined, "s", undefined, "t"]],
        ["qx.util.StringSplit.split('tesst', /(s*)/)",          ["t", "", "e", "ss", "t"]],
        ["qx.util.StringSplit.split('tesst', /(s*?)/)",         ["t", "", "e", "", "s", "", "s", "", "t"]],
        ["qx.util.StringSplit.split('tesst', /(?:s)*/)",        ["t", "e", "t"]],
        ["qx.util.StringSplit.split('tesst', /(?=s+)/)",        ["te", "s", "st"]],
        ["qx.util.StringSplit.split('test', 't')",              ["", "es", ""]],
        ["qx.util.StringSplit.split('test', 'es')",             ["t", "t"]],
        ["qx.util.StringSplit.split('test', /t/)",              ["", "es", ""]],
        ["qx.util.StringSplit.split('test', /es/)",             ["t", "t"]],
        ["qx.util.StringSplit.split('test', /(t)/)",            ["", "t", "es", "t", ""]],
        ["qx.util.StringSplit.split('test', /(es)/)",           ["t", "es", "t"]],
        ["qx.util.StringSplit.split('test', /(t)(e)(s)(t)/)",   ["", "t", "e", "s", "t", ""]],
        ["qx.util.StringSplit.split('.', /(((.((.??)))))/)",    ["", ".", ".", ".", "", "", ""]],
        ["qx.util.StringSplit.split('.', /(((((.??)))))/)",     ["."]]
      ];

      for (var i = 0; i < testCode.length; i++)
      {
        var result = eval(testCode[i][0]);
        this.assertArrayEquals(testCode[i][1], result);
      }

      var ecmaSampleRe = /<(\/)?([^<>]+)>/;
      this.assertArrayEquals(["A", undefined, "B", "bold", "/", "B", "and", undefined, "CODE", "coded", "/", "CODE", ""],
                             qx.util.StringSplit.split('A<B>bold</B>and<CODE>coded</CODE>', ecmaSampleRe));

    }
  }
});

