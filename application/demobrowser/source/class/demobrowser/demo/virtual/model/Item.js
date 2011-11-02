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
qx.Class.define("demobrowser.demo.virtual.model.Item",
{
  extend : qx.core.Object,

  construct : function(label, icon)
  {
    this.base(arguments);

    if (label != null) {
      this.setLabel(label);
    }

    if (icon != null) {
      this.setIcon(icon);
    }
  },

  properties :
  {
    label :
    {
      check : "String",
      event : "changeLabel",
      nullable : true
    },

    icon :
    {
      check : "String",
      event : "changeIcon",
      nullable : true
    }
  }
});
