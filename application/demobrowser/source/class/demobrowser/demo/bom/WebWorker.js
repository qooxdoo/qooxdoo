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

/**
 * @tag noPlayground
 */
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

      var label1 = new qx.ui.basic.Label("Calculate Fibonacci Numbers in a Web Worker");
      var info = new qx.ui.basic.Label("");
      var calculate = new qx.ui.form.Button("Calculate").set({width: 100});
      var what = new qx.ui.form.TextField("30");
      var result = new qx.ui.form.List().set({width: 200});

      if (qx.core.Environment.get("html.webworker")) {
        info.setValue("Your browser supports Web Workers");
      } else {
        info.setValue("Your browser doesn't support Web Workers");
      }


      doc.add(info, {left:20, top:10});
      doc.add(label1, {left:20, top:40});
      doc.add(what, {left:20, top:60});
      doc.add(calculate, {left:120, top:58});
      doc.add(result, {left:20, top:90});

      worker.addListener("message", function(e) {
        var data = e.getData();
        result.addAt(new qx.ui.form.ListItem(""+data.result), 0);
        if (data.done) {
          calculate.setEnabled(true);
          what.setEnabled(true);
          calculate.setLabel("Calculate");
        }
      });

      calculate.addListener("execute", function(e) {
        result.removeAll();
        worker.postMessage(parseInt(what.getValue() || 0, 10));
        calculate.setEnabled(false);
        what.setEnabled(false);
        calculate.setLabel("Calculating...");
      }, this);
    }
  }
});
