/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
qx.Class.define("demobrowser.demo.virtual.model.File",
{
  extend : qx.core.Object,

  construct : function(name)
  {
    this.base(arguments);

    this.setName(name);
  },
  
  properties :
  {
    name :
    {
      check : "String",
      event : "changeName",
      nullable : true
    }
  }
});
