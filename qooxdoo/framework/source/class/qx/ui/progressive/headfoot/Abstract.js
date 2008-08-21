/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_progressive)

************************************************************************ */

/**
 * The abstract class for a header or footer for use with Progressive's Table
 * renderer.
 */
qx.Class.define("qx.ui.progressive.headfoot.Abstract",
{
  type       : "abstract",
  extend     : qx.ui.container.Composite,

  construct : function()
  {
    this.base(arguments, new qx.ui.layout.HBox());
  },

  members    :
  {

    __progressive : null,

    /**
     * Join this header/footer to a Progressive.  This makes the Progressive
     * object available to the header/footer through the _progressive member.
     *
     * @param progressive {qx.ui.progressive.Progressive}
     *   Progressive object to which we're being joined.
     *
     * @return {Void}
     */
    join : function(progressive)
    {
      this.__progressive = progressive;
    }
  },

  settings :
  {
    "qx.tableResizeDebug" : false
  },

  destruct : function()
  {
    this._disposeFields(
      "__progressive");
  }
});
