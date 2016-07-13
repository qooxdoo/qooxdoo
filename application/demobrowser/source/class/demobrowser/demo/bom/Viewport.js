/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.bom.Viewport",
{
  extend : qx.application.Native,

  members :
  {
    main : function()
    {
      this.base(arguments);

      qx.bom.Element.addListener(
        document.body,
        "tap",
        function()
        {
          this.debug("Document Dimension: " + qx.bom.Document.getWidth() + "x" + qx.bom.Document.getHeight());
          this.debug("Viewport Dimension: " + qx.bom.Viewport.getWidth() + "x" + qx.bom.Viewport.getHeight());
          this.debug("Viewport Scroll: " + qx.bom.Viewport.getScrollLeft() + "x" + qx.bom.Viewport.getScrollTop());
        },
        this
      );
    }

  }
});
