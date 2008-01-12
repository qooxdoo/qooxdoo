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
     * Thomas Herchenroeder (thron7)

************************************************************************ */

/* ************************************************************************

#module(testrunner)
#resource(testrunner.css:css)
#resource(testrunner.image:image)

************************************************************************ */

qx.Class.define("testrunner.runner.TreeTest",
{
  extend : qx.core.Object,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    var tree = new testrunner.runner.Tree("Root");
    var first;
    tree.add(first = new testrunner.runner.Tree("First"));
    first.add(new testrunner.runner.Tree("First.1"));
    first.add(new testrunner.runner.Tree("First.2"));
    tree.add(new testrunner.runner.Tree("Second"));
    var three = new testrunner.runner.Tree("Third");

    // three.add(new testrunner.runner.Tree("Third.1"));
    // three.add(new testrunner.runner.Tree("Third.2"));
    tree.add(three);

    tree.print();
    var s = three.pwd().concat([ three.label ]).join(".");
    this.debug("Three is exactly :" + s);
  }
});
