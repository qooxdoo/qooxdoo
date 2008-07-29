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
     * Alexander Back (aback)

************************************************************************ */

qx.Class.define("demobrowser.demo.event.DragDrop_2",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);
      
      qx.event.Registration.addListener(document.getElementById("atom"), "mousedown", this._onmousedown, this, true);
      qx.event.Registration.addListener(document.body, "mouseup", this._onmouseup, this, true);
    },
    
    _onmousedown : function(e)
    {
      this._writeDebugMessage("mousedown on " + e.getTarget().id);
      
      if (e.isLeftPressed()) 
      {
        qx.event.Registration.addListener(document.getElementById("container"), "mousemove", this._onmousemove, this, true);
      }
    },
    
    _onmouseup : function(e)
    {
      this._writeDebugMessage("onmouseup")
      
      qx.event.Registration.removeListener(document.getElementById("container"), "mousemove", this._onmousemove, this, true);
    },
    
    _onmousemove : function(e)
    {
      var debug = e.getTarget().id != "" ? e.getTarget().id : e.getTarget().nodeName;
      this._writeDebugMessage("ID of target element: " + debug);
    },
    
    
    _writeDebugMessage : function(mesg)
    {
      document.getElementById("debugconsole").innerHTML += "<br/>" + mesg; 
    }
  }
});