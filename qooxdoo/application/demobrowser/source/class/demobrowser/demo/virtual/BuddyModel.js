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


qx.Class.define("demobrowser.demo.virtual.BuddyModel",
{
  extend : qx.ui.core.Widget,

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

    name :
    {
      init : "(unnamed)",
      event : "changeName",
      check : "String"
    },
  
    avatar :
    {
      init : "",
      event : "changeAvatar",
      check : "String"
    },
  
    status :
    {
      init : "offline",
      event : "changeStatus",
      check : ["away", "busy", "online", "offline"]
    }
  },
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
 
  members :
  {
    
  }
});