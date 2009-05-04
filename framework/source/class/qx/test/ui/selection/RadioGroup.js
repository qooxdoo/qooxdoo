/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Schmidt (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.test.ui.selection.RadioGroup",
{
  extend : qx.test.ui.selection.AbstractSingleSelectonTest,

  members :
  {
    __radioButtons : null,
    
    setUp : function()
    {
      var length = 10;
      this._mode = "";
      this.__radioButtons = [];
      this._notInSelection = [];
      
      this._widget = new qx.ui.form.RadioGroup();
      var root = this.getRoot();
      
      for (var i = 0; i < length; i++) {
        var item = new qx.ui.form.RadioButton("RadioButton" + i);
        root.add(item, {top: 20*i});
        this._widget.add(item);
        this.__radioButtons.push(item);
        
        if (i == 5) {
          this._widget.setSelection([item]);
          this._selection = [item];
        } else {
          this._notInSelection.push(item);
        }
      } 
      
      this.flush();
    },

    tearDown : function()
    {
      this.getRoot().removeAll();
      for (var i = 0; i < this.__radioButtons.length; i++) {
        this.__radioButtons[i].destroy();
      }
      this.__radioButtons = null;
      this._widget = null;
      this._selection = null;
      this._notInSelection = null;
    },
    
    _getChildren : function() 
    {
      if (this._widget != null) {
        return this._widget.getItems();
      } else {
        return [];
      }
    },
    
    _createTestElement : function(name) {
      return new qx.ui.form.RadioButton(name);
    }
  }
});