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

qx.Class.define("demobrowser.demo.layout.Spacer_HBox",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var root = this.getRoot();
      root.add(this.getSpacerWithoutFlex(), {left: 10, top: 10});
      root.add(this.getSpacerWithFlex(), {left: 10, top: 70});
      root.add(this.getAddRemoveSpacer(), {left: 10, top: 200});
    },


    getSpacerWithoutFlex : function()
    {
      // spacer without flex
      var box = new qx.ui.container.Composite().set({
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowX: false
      });

      var layout = new qx.ui.layout.HBox();
      layout.setSpacing(5);
      box.setLayout(layout);

      box.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}));
      box.add(new qx.ui.core.Spacer(30, 40));
      box.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}));
      box.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}));


      return box;
    },

    getSpacerWithFlex : function()
    {
      // spacer with flex
      var box = new qx.ui.container.Composite().set({
        decorator: "main",
        backgroundColor: "yellow",
        height: 100,
        width: 400
      });

      var layout = new qx.ui.layout.HBox();
      layout.setSpacing(5);
      box.setLayout(layout);

      box.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxHeight: 40, alignY: "top"}));
      box.add(new qx.ui.core.Spacer(30, 40), {flex: 1});
      box.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxHeight: 40, alignY: "middle"}));
      box.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxHeight: 40, alignY: "bottom"}));

      return box;
    },

    getAddRemoveSpacer : function()
    {
      // addSpacer and remove
      var box = new qx.ui.container.Composite().set({
        decorator: "main",
        backgroundColor: "yellow"
      });

      var layout = new qx.ui.layout.HBox();
      layout.setSpacing(5);
      box.setLayout(layout);

      box.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxHeight: 40, alignY: "top"}));
      box.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxHeight: 40, alignY: "middle"}));
      var spacer = new qx.ui.core.Spacer(30, 40);
      box.add(spacer, {flex: 1});
      box.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxHeight: 40, alignY: "bottom"}));

      box.remove(spacer);
      return box;
    }
  }
});
