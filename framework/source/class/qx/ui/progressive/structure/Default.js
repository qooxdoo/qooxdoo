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
      this._header = this.__nullHeader;
    }
    else
    {
      this.__nullHeader = null;
      this._header = header;
    }

    // If no footer was specified, use a null footer
    if (! footer)
    {
      this.__nullFooter = new qx.ui.progressive.headfoot.Null();
      this._footer = this.__nullFooter;
    }
    else
    {
      this.__nullFooter = null;
      this._footer = footer;
    }
  },


  members :
  {
    /**
     */
    applyStructure : function(progressive)
    {
      // Tell the header/footer components who their Progressive is
      this._header.join(progressive);
      this._footer.join(progressive);

      // Add the header, pane, and footer to the Progressive.
      progressive.add(this._header);
      progressive.add(this._pane);
      progressive.add(this._footer);
    },

    getHeader : function()
    {
      return this._header;
    },

    getFooter : function()
    {
      return this._footer;
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
  }

});
