/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/* ************************************************************************
#asset(qx/icon/Tango/22/actions/media-skip-backward.png)
#asset(qx/icon/Tango/22/actions/media-playback-start.png)
#asset(qx/icon/Tango/22/actions/media-eject.png)
#asset(qx/icon/Tango/22/actions/media-skip-forward.png)
************************************************************************ */

qx.Class.define("tutorial.view.Description",
{
  extend : qx.ui.container.Composite,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @lint ignoreUndefined(qxc)
   */
  construct : function()
  {
    this.base(arguments);
    var layout = new qx.ui.layout.VBox();
    layout.setAlignX("center");
    this.setLayout(layout);
    this.setDecorator("main");
    this.setBackgroundColor("white");

    this.add(new qx.ui.container.Stack(), {flex: 1});

    this.add(this.__createButtonContainer());
  },


  events : {
    "run" : "qx.event.type.Event"
  },

  members : {
    __createButtonContainer : function() {
      var pref = new qx.ui.toolbar.Button("Pref", "icon/22/actions/media-skip-backward.png");
      var update = new qx.ui.toolbar.Button("Update", "icon/22/actions/media-eject.png");
      var run = new qx.ui.toolbar.Button("Run", "icon/22/actions/media-playback-start.png");
      var next = new qx.ui.toolbar.Button("Next", "icon/22/actions/media-skip-forward.png");

      // states
      pref.addState("left");
      update.addState("middle");
      run.addState("middle");
      next.addState("right");

      // events
      run.addListener("execute", function() {
        this.fireEvent("run");
      }, this);

      // container
      var container = new qx.ui.container.Composite();
      var layout = new qx.ui.layout.HBox();
      layout.setAlignX("center");
      container.setLayout(layout);
      container.setPadding(10);
      container.add(pref);
      container.add(update);
      container.add(run);
      container.add(next);
      return container;
    }
  }
});
