/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

qx.Class.define("qxc.application.formdemo.Application",
{
  extend : qx.application.Standalone,

  members :
  {
    __items : null,

    main : function()
    {
      this.base(arguments);

      this.__items = new qxc.application.formdemo.FormItems();
      this.getRoot().add(this.__items);
    }
  },

  destruct : function()
  {
    this.__items.destroy();
  }
});