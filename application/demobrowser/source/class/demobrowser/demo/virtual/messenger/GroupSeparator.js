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
   * Jonathan Weiß (jonathan_rass)

************************************************************************ */


qx.Class.define("demobrowser.demo.virtual.messenger.GroupSeparator",
{
  extend : qx.core.Object,

  
  construct : function(name)
  {
    this.base(arguments);
    
    if (name !== undefined) {
      this.setName(name);
    }
  },
  
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    name :
    {
      init : "Friends",
      event : "changeName",
      check : "String"
    },
    
    index :
    {
      event : "changeIndex",
      check : "Integer"
    }
  }
});