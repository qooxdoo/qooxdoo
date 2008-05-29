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
      this.setContent(content);
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
     * Sets the content of the scroll area.
     *
     * @type member
     * @param value {qx.ui.core.Widget} Widget to insert
     * @return {void}
     */
    setContent : function(value) {
      this._setContent(value);
    },


    /**
     * Returns the content of the scroll area.
     *
     * @type member
     * @return {qx.ui.core.Widget}
     */
    getContent : function() {
      return this._getContent();
    }
  }
});
