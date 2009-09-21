/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.ui.core.Command", 
{
  extend : qx.core.Object,


  construct : function(shortcut)
  {
    this.base(arguments);
    this._shortcut = new qx.bom.Shortcut(shortcut);
    
    this._shortcut.addListener("execute", this.execute, this);
  },


  events :
  {
    /**
     * Fired when the command is executed. Sets the "data" property of the 
     * event to the object that issued the command.
     */
    "execute" : "qx.event.type.Data"
  },
  

  properties :
  {
    /** whether the command should be respected/enabled */
    enabled :
    {
      init : true,
      check : "Boolean",
      event : "changeEnabled",
      apply : "_applyEnabled"
    },


    /** The command shortcut */
    shortcut :
    {
      check : "String",
      apply : "_applyShortcut",
      nullable : true
    }
  },


  members :
  {
    _shortcut : null,
    
    _applyEnabled : function(value) {
      this._shortcut.setEnabled(value);
    },
    
    
    _applyShortcut : function(value) {
      this._shortcut.setShortcut(value);
    },
    
    
    execute : function(target) 
    {
      this.fireDataEvent("execute", target);
    },
    
    
    toString : function() 
    {
      return this._shortcut.toString();
    }
  }
});
