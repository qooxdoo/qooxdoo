/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Adrian Olaru (adrianolaru)

************************************************************************ */

/* ************************************************************************

#asset(demobrowser/demo/webworker/webworker.js)

************************************************************************ */

qx.Class.define("demobrowser.demo.bom.WebWorker",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      this.base(arguments);
      var doc = this.getRoot();

      var url = qx.util.ResourceManager.getInstance().toUri("demobrowser/demo/webworker/webworker.js");
      var worker = new qx.bom.WebWorker(url);
      worker.addListener("message", function(e) {
        result.setValue(result.getValue() + " " + e.getData());
      });


      var label1 = new qx.ui.basic.Label("Calculate Fibonacci Numbers in a web worker. Enter a number and click the Calculate button.");
      var calculate = new qx.ui.form.Button("Calculate");
      var what = new qx.ui.form.TextField("30");
      var result = new qx.ui.basic.Label();


      doc.add(label1, {left:20, top:10});
      doc.add(what, {left:20, top:30});
      doc.add(calculate, {left:120, top:28});
      doc.add(result, {left:20, top:60});

      calculate.addListener("execute", function(e) {
        result.setValue("");
        worker.postMessage(parseInt(what.getValue() || 0, 10));
      }, this);
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function() {
  }
});
