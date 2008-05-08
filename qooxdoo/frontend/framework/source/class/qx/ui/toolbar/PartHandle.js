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
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * @appearance toolbar-part-handle
 * @appearance toolbar-part-handle-line {qx.ui.basic.Terminator}
 */
qx.Class.define("qx.ui.toolbar.PartHandle",
{
  extend : qx.ui.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "toolbar-part-handle"
    }
  },
  
  members : 
  {
    _getContentHint : function()
    {
      return {
        /* 
         * Set the height to override the default value. 
         * The width of this widget is controlled by the appearance theme.
         */
        height : 0
      };
    }  
  }  
});
