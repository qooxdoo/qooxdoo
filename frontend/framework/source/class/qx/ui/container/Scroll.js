/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui.container.Scroll",
{
  extend : qx.ui.core.ScrollArea,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(content)
  {
    this.base(arguments);

    if (content) {
      this.add(content);
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Sets the content of the scroll container. Scroll containers
     * may only have one child, so it always replaces the current
     * child with the given one.
     *
     * @type member
     * @param widget {qx.ui.core.Widget} Widget to insert
     * @return {void}
     */
    add : function(widget) {
      this._getChildControl("pane").add(widget);
    },


    /**
     * Returns the content of the scroll area.
     *
     * @type member
     * @param widget {qx.ui.core.Widget} Widget to remove
     * @return {qx.ui.core.Widget}
     */
    remove : function(widget) {
      this._getChildControl("pane").remove(widget);
    },


    /**
     * Returns the content of the scroll container.
     *
     * Scroll containers may only have one child. This
     * method returns exactly this one child or <code>null</code>.
     *
     * @type member
     * @return {qx.ui.core.Widget} The child
     */
    getChild : function() {
      return this._getChildControl("pane").getChild();
    }
  }
});
