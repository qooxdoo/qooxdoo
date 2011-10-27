/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.bom.Overflow",
{
  extend : qx.application.Native,

  members :
  {
    main : function()
    {
      this.base(arguments);

      var over = qx.bom.element.Overflow;

      this.info("#0");
      this.debug("1: " + over.getX(document.getElementById("test1")) + ", " + over.getY(document.getElementById("test1")));
      this.debug("2: " + over.getX(document.getElementById("test2")) + ", " + over.getY(document.getElementById("test2")));
      this.debug("3: " + over.getX(document.getElementById("test3")) + ", " + over.getY(document.getElementById("test3")));

      this.info("#1");
      this.debug("9a: " + over.getX(document.getElementById("test9a")) + ", " + over.getY(document.getElementById("test9a")));
      this.debug("9b: " + over.getX(document.getElementById("test9b")) + ", " + over.getY(document.getElementById("test9b")));
      this.debug("9c: " + over.getX(document.getElementById("test9c")) + ", " + over.getY(document.getElementById("test9c")));
      this.debug("9d: " + over.getX(document.getElementById("test9d")) + ", " + over.getY(document.getElementById("test9d")));

      this.info("#2");
      this.debug("9e: " + over.getX(document.getElementById("test9e")) + ", " + over.getY(document.getElementById("test9e")));
      this.debug("9f: " + over.getX(document.getElementById("test9f")) + ", " + over.getY(document.getElementById("test9f")));
      this.debug("9g: " + over.getX(document.getElementById("test9g")) + ", " + over.getY(document.getElementById("test9g")));
      this.debug("9h: " + over.getX(document.getElementById("test9h")) + ", " + over.getY(document.getElementById("test9h")));

      this.info("#3");
      this.debug("9i: " + over.getX(document.getElementById("test9i")) + ", " + over.getY(document.getElementById("test9i")));
      this.debug("9j: " + over.getX(document.getElementById("test9j")) + ", " + over.getY(document.getElementById("test9j")));
      this.debug("9k: " + over.getX(document.getElementById("test9k")) + ", " + over.getY(document.getElementById("test9k")));
      this.debug("9l: " + over.getX(document.getElementById("test9l")) + ", " + over.getY(document.getElementById("test9l")));

      this.info("#4");
      this.debug("9m: " + over.getX(document.getElementById("test9m")) + ", " + over.getY(document.getElementById("test9m")));
      this.debug("9n: " + over.getX(document.getElementById("test9n")) + ", " + over.getY(document.getElementById("test9n")));
      this.debug("9o: " + over.getX(document.getElementById("test9o")) + ", " + over.getY(document.getElementById("test9o")));
      this.debug("9p: " + over.getX(document.getElementById("test9p")) + ", " + over.getY(document.getElementById("test9p")));
    }
  }
});
