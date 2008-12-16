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

qx.Class.define("demobrowser.demo.layout.Grid_Animated",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var layout = new qx.ui.layout.Grid();
      layout.setSpacing(20);

      var container = new qx.ui.container.Composite(layout);
      container.setPadding(20);

      this.getRoot().add(container, {left:0,top:0});

      container.add(this.getAnimGrid(), {row: 0, column: 0});
    },


    getNewWidget : function()
    {
      var widget = new qx.ui.core.Widget().set({
        width: 50,
        height: 50,
        backgroundColor: "green"
      });

      widget.addListener("click", function(e)
      {
        if (this._active == widget) {
          return;
        }

        var effects = [];
        var duration = 0.3;

        if (this._active)
        {
          this._active.set({
            backgroundColor : "green",
            width: 50,
            height: 50
          });
        }

        widget.set({
            backgroundColor : "orange"
        });

        var bounds = widget.getBounds();

        effects.push(new demobrowser.demo.layout.Grid_Animated_Property(widget, "width").set({
          from: bounds.width,
          to: 200,
          duration: duration,
          transition: "sinodial"
        }));
        effects.push(new demobrowser.demo.layout.Grid_Animated_Property(widget, "height").set({
          from: bounds.height,
          to: 200,
          duration: duration,
          transition: "sinodial"
        }));

        var effect = new qx.fx.effect.core.Parallel(effects[0], effects[1]);
        effect.start();

        this._active = widget;
      }, this);

      return widget;
    },


    getAnimGrid : function()
    {
      var box = new qx.ui.container.Composite().set({
        decorator: "main",
        backgroundColor: "yellow",
        width: 500,
        height: 500
      });

      var layout = new qx.ui.layout.Grid();
      layout.setSpacing(3);
      box.setLayout(layout);

      this._active = null;

      for (var x=0; x<7; x++)
      {
        layout.setColumnFlex(x, 1);
        layout.setRowFlex(x, 1);

        for (var y=0; y<7; y++) {
          box.add(this.getNewWidget(), {row: y, column: x});
        }
      }
      return box;
    }
  }
});
