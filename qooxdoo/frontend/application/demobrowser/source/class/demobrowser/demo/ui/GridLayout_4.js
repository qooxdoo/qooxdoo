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

qx.Class.define("demobrowser.demo.ui.GridLayout_4",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);

      doc = new qx.ui.root.Application(document);
      doc.setTextColor("black");
      doc.setBackgroundColor("white");

      var docLayout = new qx.ui.layout.Grid();
      docLayout.setSpacing(20);

      var container = new qx.ui.core.Widget();
      container.setPadding(20);
      container.setLayout(docLayout);

      doc.add(container, 0, 0);

      this._border = new qx.ui.decoration.Basic(1, "solid", "black");

      docLayout.add(this.getAnimGrid(), 0, 0);
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
        var duration = 1;

        if (this._active) {
          this._active.set({
            backgroundColor : "green",
            width: 50,
            height: 50
          });

          /*
          effects.shrinkX = new demobrowser.demo.ui.GridLayout_4_Property(this._active, "width", {
            from: 200,
            to: 50,
            duration: duration
          });
          effects.shrinkY = new demobrowser.demo.ui.GridLayout_4_Property(this._active, "height", {
            from: 200,
            to: 50,
            duration: duration
          });
          */

        }

        widget.set({
            backgroundColor : "orange"
            //width: 200,
            //height: 200
        });

        effects.push(new demobrowser.demo.ui.GridLayout_4_Property(widget, "width").set({
          from: 50,
          to: 200,
          duration: duration,
          transition: qx.fx.Transition.sinoidal
        }));
        effects.push(new demobrowser.demo.ui.GridLayout_4_Property(widget, "height").set({
          from: 50,
          to: 200,
          duration: duration,
          transition: qx.fx.Transition.sinoidal
        }));

        var effect = new qx.fx.effect.core.Parallel(effects);
        effect.start();

        this._active = widget;
      }, this);

      return widget;
    },


    getAnimGrid : function()
    {
      var box = (new qx.ui.core.Widget).set({decorator: this._border, backgroundColor: "yellow", width: 500, height: 500});
      var layout = new qx.ui.layout.Grid();
      layout.setSpacing(3);

      this._active = null;

      for (var x=0; x<7; x++)
      {
        layout.setColumnFlex(x, 1);
        layout.setRowFlex(x, 1);

        for (var y=0; y<7; y++) {
          layout.add(this.getNewWidget(), y, x);
        }
      }

      box.setLayout(layout);

      return box;
    }
  }
});
