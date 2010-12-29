/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("qx.test.html.Iframe",
{
  extend : qx.dev.unit.TestCase,

  members :
  {

    __doc: null,
    __frame: null,
    __origin: null,

    setUp : function()
    {
      var helper = document.createElement("div");
      document.body.appendChild(helper);

      this.__doc = new qx.html.Root(helper);
      this.__doc.setAttribute("id", "doc");

      var frame = this.__frame = new qx.html.Iframe("/");

      this.__doc.add(frame);
      qx.html.Element.flush();
    },

    "test: update source on browse": function() {
      var frame = this.__frame;

      // As soon as the original frame has loaded,
      // fake user-action and browse
      frame.addListenerOnce("load", function() {
        qx.bom.Iframe.setSource(frame.getDomElement(), "/affe/");
      });

      // Give changed frame some time to load
      this.wait(500, function() {
        this.assertMatch(frame.getSource(), "\/affe\/$");
      }, this);
    },

    tearDown : function()
    {
      qx.html.Element.flush();
      var div = document.getElementById("doc");
      document.body.removeChild(div);

      this.__frame.dispose();
    }
  }
});
