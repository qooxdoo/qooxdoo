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
   * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.LayerMock",
{
  extend : qx.ui.core.Widget,
  include : [qx.core.MAssert],
  implement : [qx.ui.virtual.core.ILayer],
  
  construct : function() 
  {
    this.base(arguments);
    
    this.calls = [];
  },
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    fullUpdate : function(cells, rowSizes, columnSizes) 
    {    
      this.assertArgumentsCount(arguments, 3, 3);
      this.calls.push(["fullUpdate", qx.lang.Array.fromArguments(arguments)]);
    },
    
    
    updateLayerWindow : function(cells, lastCells, rowSizes, columnSizes) 
    {
      this.assertArgumentsCount(arguments, 4, 4);
      this.calls.push(["updateLayerWindow", qx.lang.Array.fromArguments(arguments)]);
    }
  }
});
