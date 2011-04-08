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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * @tag test
 */
qx.Class.define("demobrowser.demo.test.TimerManager",
{
  extend : qx.application.Standalone,

  members :
  {
    __textarea : null,

    startTimers : function()
    {
      var timer = qx.util.TimerManager.getInstance();

      timer.start(
        function(userData, timerId) {
          this.__addLog("Recurrent 5-second timer: " + timerId);
        },
        5000,
        this,
        null,
        0
      );

      timer.start(
        function(userData, timerId) {
          this.__addLog("One-shot 1-second timer: " + timerId);
        },
        0,
        this,
        null,
        1000
      );

      timer.start(
        function(userData, timerId)
        {
          this.__addLog("Recurrent 2-second timer with limit 3:" +
                     timerId);
          if (++userData.count == 3)
          {
            this.__addLog("Stopping recurrent 2-second timer");
            timer.stop(timerId);
          }
        },
        2000,
        this,
        { count : 0 },
        2000
      );
    },

    __addLog : function(msg)
    {
      msg = Date.parse(new Date) + " " + msg + "\n";
      this.__textarea.setValue(this.__textarea.getValue() + msg);
    },

    main : function()
    {
      this.base(arguments);

      var layout = new qx.ui.layout.VBox(5);
      var container = new qx.ui.container.Composite(layout);

      var btStart = new qx.ui.form.Button("Start timers");
      btStart.set({
        allowGrowX : false,
        allowGrowY : false
      });
      btStart.addListener("execute", function(){
        btStart.setEnabled(false);
        this.startTimers();
      }, this)

      var textarea = new qx.ui.form.TextArea();
      textarea.set({
        width : 400,
        height: 300
      });


      this.__textarea = textarea;

      container.add(textarea);
      container.add(btStart);

      this.getRoot().add(container, {left : 20, top : 10});
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function()
  {
    this._disposeObjects("__textarea");
  }
});