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

/**
 *
 */
qx.Class.define("qx.ui.decoration.AntTrailOutline",
{
  extend : qx.core.Object,
  implement : qx.ui.decoration.IDecorator,


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // interface implementation
    init : function(decorationElement) {
    },


    // interface implementation
    update : function(decorationElement, width, height)
    {
      //var decorationHtml = "<div style='" + this._getStyle(width, height) + "'></div>";
      decorationElement.setStyles({
        left: -1,
        top: -1,
        width: width,
        height: height,
        border: "1px dotted black"
      });
    },


    // interface implementation
    reset : function(decorationElement) {
      decorationElement.setStyles({
        left: null,
        top: null,
        width: null,
        height: null,
        border: null
      });
    },

    getInsets : function() {}
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
  }
});