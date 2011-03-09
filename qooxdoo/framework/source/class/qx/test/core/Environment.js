/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.core.Environment", 
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    testEngineName : function() {
      this.assertNotEquals("", qx.core.Environment.get("engine.name"));
    },
    
    testEngineVersion : function() {
      this.assertNotEquals("", qx.core.Environment.get("engine.version"));      
    },
    
    testBrowserName : function() {
      this.assertNotEquals("", qx.core.Environment.get("browser.name"));
    },
    
    testBrowserVersion : function() {
      this.assertNotEquals("", qx.core.Environment.get("browser.version"));      
    },
    
    testLocale : function() {
      this.assertNotEquals("", qx.core.Environment.get("locale"));
    },
    
    testVariant : function() {
      // just make sure the call is working
      qx.core.Environment.get("locale.variant");
    },
    
    testOSName : function() {
      // just make sure the call is working
      qx.core.Environment.get("os.name");
    }
  }
});
