/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * Structure definition for Progressive
 */
qx.Class.define("qx.ui.progressive.structure.Default",
{
  extend     : qx.ui.progressive.structure.Abstract,

  /**
   * The default structure for use by Progressive.  It includes a header, a
   * footer, and a pane.
   *
   * @param header {qx.ui.progressive.headfoot.Abstract|null}
   *   The heading to apply to the Progressive structure.  If null, then no
   *   header will be visible.
   *
   * @param footer {qx.ui.progressive.headfoot.Abstract|null}
   *   The footer to apply to the Progressive structure.  If null then no
   *   footer will be visible.
   *
   * @param pane {qx.ui.core.Widget|null}
   *   The container to use as the pane, applied to the Progressive
   *   structure.  If null, a qx.ui.core.Widget will be instantiated for
   *   use as the pane.
   */
  construct : function(header, footer, pane)
  {
    this.base(arguments, pane);

    // If no header was specified, use null header
    if (! header)
    {
      this.__nullHeader = new qx.ui.progressive.headfoot.Null();
      this.__header = this.__nullHeader;
    }
    else
    {
      this.__nullHeader = null;
      this.__header = header;
    }

    // If no footer was specified, use a null footer
    if (! footer)
    {
      this.__nullFooter = new qx.ui.progressive.headfoot.Null();
      this.__footer = this.__nullFooter;
    }
    else
    {
      this.__nullFooter = null;
      this.__footer = footer;
    }
  },


  members :
  {

    __header     : null,
    __footer     : null,
    __nullHeader : null,
    __nullFooter : null,

    // overridden
    applyStructure : function(progressive)
    {
      // Tell the header/footer components who their Progressive is
      this.__header.join(progressive);
      this.__footer.join(progressive);

      // Add the header, pane, and footer to the Progressive.
      progressive.add(this.__header);
      progressive.add(this.getPane(), { flex : 1 });
      progressive.add(this.__footer);
    },


    /**
     * Return the header
     *
     * @return {qx.ui.progressive.headfoot.Abstract}
     */
    getHeader : function()
    {
      return this.__header;
    },


    /**
     * Return the footer
     *
     * @return {qx.ui.progressive.headfoot.Abstract}
     */
    getFooter : function()
    {
      return this.__footer;
    }
  },

  destruct : function()
  {
    if (this.__nullHeader)
    {
      this.__nullHeader.dispose();
      this.__nullHeader = null;
    }

    if (this.__nullFooter)
    {
      this.__nullFooter.dispose();
      this.__nullFooter = null;
    }

    this.__header = this.__footer = null;
  }

});
