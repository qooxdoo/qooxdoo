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
qx.Class.define("playground.view.gist.UserNameMenuItem", 
{
  extend : qx.ui.core.Widget,


  construct : function()
  {
    this.base(arguments);
    
    var layout = new qx.ui.layout.Grid(5, 5);
    layout.setColumnFlex(1, 1);
    layout.setRowFlex(0, 1);
    layout.setRowAlign(0, "left", "middle");
    this._setLayout(layout);
    this.setPadding(4);
    this.__textField = new qx.ui.form.TextField();
    this.__textField.set({
      width: 50
    });
    
    this._add(new qx.ui.basic.Label(this.tr("Username")), {row: 0, column: 0});
    this._add(this.__textField, {row: 0, column: 1});
    
    this.__textField.addListener("changeValue", function(e) {
      this.fireDataEvent("reload", e.getData());
    }, this);
  },
  
  
  events : {
    "reload" : "qx.event.type.Data"
  },
  

  members :
  {
    getChildrenSizes : function()
    {
      // iconWidth, labelWidth, shortcutWidth, arrowWidth
      return [0, this.getSizeHint().width, 0, 0];
    },
    
    
    markInvalid : function(invalid, message) 
    {
      this.__textField.setValid(!invalid);
      this.__textField.setInvalidMessage(message || "");
    }
  }
});
