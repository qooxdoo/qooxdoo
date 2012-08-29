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

    this.__embed = new qx.ui.embed.Html();
    this.__embed.setMargin(10);
    this.__embed.setOverflow("auto", "auto");
    this.add(this.__embed, {flex: 1});

    this.add(this.__createButtonContainer());

    this.updateView();
  },


  events : {
    "run" : "qx.event.type.Event",
    "update" : "qx.event.type.Data"
  },


  properties : {
    tutorial : {
      apply : "_applyTutorial",
      init : tutorial.tutorial.HelloWorld
    },

    step : {
      check : "Number",
      apply : "_applyStep",
      event : "changeStep",
      init: 0
    }
  },


  members : {
    __embed : null, 

    _applyTutorial : function(value) {
      this.setStep(0);
    },

    _applyStep : function(value) {
      this.updateView();
    },

    updateView : function() {
      this.__embed.setHtml(this.getTutorial().steps[this.getStep()].text);
    },


    __createButtonContainer : function() {
      var pref = new qx.ui.toolbar.Button(null, "icon/22/actions/media-skip-backward.png");
      var update = new qx.ui.toolbar.Button("Help me out");
      var run = new qx.ui.toolbar.Button("Run", "icon/22/actions/media-playback-start.png");
      var next = new qx.ui.toolbar.Button(null, "icon/22/actions/media-skip-forward.png");

      // states
      pref.addState("left");
      update.addState("middle");
      run.addState("middle");
      next.addState("right");
      next.setIconPosition("right");

      // constant width for all buttons
      pref.setWidth(100);
      update.setWidth(100);
      run.setWidth(100);
      next.setWidth(100);

      // align text middle
      pref.setCenter(true);
      update.setCenter(true);
      run.setCenter(true);
      next.setCenter(true);

      // enabled for next / pref
      var self = this;
      this.bind("step", pref, "enabled", {converter : function(data) {
        return data > 0;
      }});
      this.bind("step", next, "enabled", {converter : function(data) {
        return data < self.getTutorial().steps.length - 1;
      }});

      // next, pref control
      pref.addListener("execute", function() {
        this.setStep(this.getStep() - 1);
      }, this);
      next.addListener("execute", function() {
        this.setStep(this.getStep() + 1);
      }, this);

      // run / update events
      run.addListener("execute", function() {
        this.fireEvent("run");
      }, this);
      update.addListener("execute", function() {
        this.fireDataEvent("update", this.getTutorial().steps[this.getStep()].code);
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
