/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * Base class for Demo simulations.
 * 
 * @lint ignoreUndefined(simulator)
 */
qx.Class.define("demobrowser.simulation.demo.Abstract", {

  extend : simulator.unit.TestCase,
  
  type : "abstract",
  
  members :
  {
    __demoList : null,
    iframeRootLocator : 'qxhv=[@classname=demobrowser.DemoBrowser]/qx.ui.splitpane.Pane/qx.ui.splitpane.Pane/qx.ui.embed.Iframe/qx.ui.root.Application',
    demoTreeLocator : 'qxhv=[@classname=demobrowser.DemoBrowser]/qx.ui.splitpane.Pane/qx.ui.container.Composite/qx.ui.tree.Tree',
    
    
    /**
     * Loads the demo to be tested.
     */
    setUp : function()
    {
      this.loadDemo();
    },
    
    
    /**
     * Loads the demo corresponding to this test class in the demobrowser.
     * A test class name like "demobrowser.simulation.demo.widget.Tree"
     * is converted to a parameter like "#widget~Tree.html". This is
     * appended to the Demobrowser's URL and loaded in the browser.
     */
    loadDemo : function()
    {
      var hash = null;
      var testClass = this.classname;
      var match = /demobrowser\.simulation\.demo\.(.*)/.exec(testClass);
      if (match && match[1]) {
        hash = match[1].replace(/\./, "~") + ".html";
      }
      
      if (!hash) {
        throw new Error("Couldn't determine demo URL from class name!");
      }
      
      var fullUrl = qx.core.Setting.get("simulator.autHost") 
      + qx.core.Setting.get("simulator.autPath") + "#" + hash; 
      
      this.getSimulation().qxOpen(fullUrl);
      this.getSimulation().waitForQxApplication();
    }
    
  }
  
});