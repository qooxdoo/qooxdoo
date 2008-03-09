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

qx.Class.define("demobrowser.demo.io.HttpRequest_1",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);
      
      var el = document.getElementById("content");
      el.value = "Loading...";
      
      var req = new qx.io2.HttpRequest("HttpRequest_1.html");
      
      req.addListener("change", function() {
        this.debug("Change to state: " + this.getReadyState())
      });

      req.addListener("load", function() 
      {
        this.debug("Fired load event");
        el.value = this.getResponseText();
      });

      req.addListener("error", function() 
      {
        this.debug("Fired error event");        
        el.value = "Error";
      });
      
      req.send();      
    }
  }
});
