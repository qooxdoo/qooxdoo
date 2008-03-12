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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.ui.Decoration_2",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var containerLayout = new qx.ui.layout.HBox();
      containerLayout.setSpacing(10);

      var container = new qx.ui.core.Widget();
      container.setPadding(20);
      container.setLayout(containerLayout);

      this.getRoot().add(container, 0, 0);


      // Examples
      containerLayout.add(this.getWidget1());
    },


    getWidget1 : function()
    {
      var deco = new qx.ui.decoration.Grid("grid_decoration.png");

      var widget = new qx.ui.core.Widget;
      widget.setDecoration(deco);

      return widget;
    }
  }
});
