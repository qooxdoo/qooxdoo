/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)

************************************************************************ */

/* ************************************************************************

#module(qxunit)
#resource(css:css)
#resource(image:image)

************************************************************************ */

qx.Class.define("qxunit.runner.TreeTest",
{
  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);

    var tree = new qxunit.runner.Tree("Root");
    tree.add(new qxunit.runner.Tree("First"));
    tree.add(new qxunit.runner.Tree("Second"));
    var three = new qxunit.runner.Tree("Third");
    tree.add(three);

    tree.print();
    var s = three.pwd().concat([three.label]).join(".");
    this.debug("Three is exactly :"+s);


  },

  members : {

  }
});

