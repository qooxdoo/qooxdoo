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
 * Structure definition for Progressive
 */
qx.Class.define("qx.ui.progressive.structure.Default",
{
  extend     : qx.ui.progressive.structure.Abstract,

  /**
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

    __nullHeader : null,
    __header : null,

    /**
     */
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

    getHeader : function()
    {
      return this.__header;
    },

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

    this._disposeFields(
      "__header",
      "__footer");
  }

});
