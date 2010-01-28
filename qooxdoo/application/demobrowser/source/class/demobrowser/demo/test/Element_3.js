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

qx.Class.define("demobrowser.demo.test.Element_3",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var body = new qx.html.Root(document.getElementById("test"));

      var inp1 = new qx.html.Element("input");
      inp1.setAttribute("type", "text");
      inp1.focus();

      inp1.addListener("focus", function(e) {
        qx.log.Logger.debug("Element focused");
      });

      inp1.addListener("blur", function(e) {
        qx.log.Logger.debug("Element blurred");
      });

      qx.bom.Element.addListener(document.documentElement, "focusin", function(e) {
        qx.log.Logger.debug("FocusIn: ", e.getTarget());
      });

      body.add(inp1);

      qx.html.Element.flush();
    }
  }
});
