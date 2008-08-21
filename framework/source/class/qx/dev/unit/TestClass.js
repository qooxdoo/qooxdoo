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

/**
 * This class represents a test suite for a unit test class.
 *
 * To create your own unit tests, create a class that derives from this one, and
 * add member methods that start with "test*". You can use assertion methods
 * inherited from *TestClass* to ease the implementation process.
 *
 * A simple example:
 * <pre class='javascript'>
 * qx. Class.define("myapp.test.MyUnitTest"),
 * {
 *   extend  : qx.dev.unit.TestCase,
 *
 *   members :
 *   {
 *     testMe : function ()
 *     {
 *       // 'assertEquals' is from the parent
 *       this.assertEquals(4, 3+1, "failure message");
 *     }
 *   }
 * }
 * </pre>
 */

qx.Class.define("qx.dev.unit.TestClass",
{
  extend : qx.dev.unit.TestSuite,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param clazz {Class} Test class. Must be a sub class of {@link TestCase}.
   */
  construct : function(clazz)
  {
    this.base(arguments);

    if (!clazz)
    {
      this.addFail("exsitsCheck" + this.__testClassNames.length, "Unkown test class!");
      return;
    }

    if (!qx.Class.isSubClassOf(clazz, qx.dev.unit.TestCase))
    {
      this.addFail("Sub class check.", "The test class '" + clazz.classname + "'is not a sub class of 'qx.dev.unit.TestCase'");
      return;
    }

    var proto = clazz.prototype;

    for (var test in proto)
    {
      if (proto.hasOwnProperty(test))
      {
        if (typeof (proto[test]) == "function" && test.indexOf("test") == 0) {
          this.addTestMethod(clazz, test);
        }
      }
    }

    this.setName(clazz.classname);
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Name of the test suite */
    name : {
      check : "String"
    }
  }
});
