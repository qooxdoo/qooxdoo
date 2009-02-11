/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 */
qx.Class.define("qx.ui.virtual.layer.Abstract",
{
  extend : qx.ui.core.Widget,

  implement : [qx.ui.virtual.core.ILayer],
  
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
    // overridden
    anonymous :
    {
      refine: true,
      init: true
    }    
  },
  
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
 
  members :
  {
    // overridden
    syncWidget : function()
    {
    },
    
    
    // interface implementation
    fullUpdate : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes
    ) {
      
    },
    
    
    // interface implementation
    updateLayerWindow : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes
    ) {
      
    }        
  }
});
