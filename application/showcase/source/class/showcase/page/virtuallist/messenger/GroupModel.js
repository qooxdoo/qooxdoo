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
   * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("showcase.page.virtuallist.messenger.GroupModel",
{
  extend : qx.core.Object,


  construct : function(name)
  {
    this.base(arguments);

    if (name !== undefined) {
      this.setName(name);
    }
  },


  properties :
  {
    name :
    {
      init : "Friends",
      event : "changeName",
      check : "String"
    },

    open :
    {
      check : "Boolean",
      init : true,
      event : "changeOpen"
    },

    count :
    {
      check : "Integer",
      init : 0,
      event : "changeCount"
    }
  }
});