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
 * A very complex decoration using two, partly combined and clipped images
 * to render a graphically impressive border with gradients.
 */
qx.Class.define("qx.ui.decoration.Grid",
{
  extend : qx.core.Object,
  implement : qx.ui.decoration.IDecorator,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // interface implementation
    init : function(decorationElement) {
      // empty
    },


    // interface implementation
    update : function(decorationElement, width, height, backgroundColor)
    {

    },


    // interface implementation
    reset : function(decorationElement)
    {
      decorationElement.setStyles({
        "width" : null,
        "height" : null,
        "boxSizing" : null
      });
    },


    // interface implementation
    getInsets : function()
    {
      // TODO
      var width = 0;
      return {
        top : width,
        right : width,
        bottom : width,
        left : width
      }
    }
  }
});
