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
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * EVIL (!!!) hack to get the profiling button into the testrunner GUI!
 */
qx.Class.define("performance.test.RunnerPatch", 
{
  extend : qx.core.Object,

  defer : function() 
  {
    if (window.top === window) {
      return;
    }
  
    var testRunnerApp = window.frames.top.qx.core.Init.getApplication();
    var toolbar = testRunnerApp.getRoot().getChildren()[1].getChildren()[1];
    var part = toolbar.getChildren()[3];
    
    var button = new window.frames.top.qx.ui.toolbar.CheckBox("Profile");
    part.add(button);
    
    button.addListener("changeValue", function(e) {
      var on = e.getData();
      performance.test.RunnerPatch.ENABLE_PROFILE = on;
      qx.bom.Cookie.set("profiling", on);
    });
    
    // cookie support
    var on = qx.bom.Cookie.get("profiling");
    if (on == "true") {
      button.setValue(true);
    }    
  }
});
