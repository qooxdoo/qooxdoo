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
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("widgetbrowser.pages.AbstractPage",
{
  type: "abstract",

  extend: qx.ui.container.Composite,

  construct : function()
  {
    this.base(arguments);
    this.setLayout(new qx.ui.layout.Canvas());

    this._widgets = new qx.type.Array();
  },

  members :
  {
    _widgets: null,

    getWidgets: function()
    {
      return this._widgets;
    }
  }
});
