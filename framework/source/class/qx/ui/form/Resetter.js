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
qx.Class.define("qx.ui.form.Resetter", 
{
  extend : qx.core.Object,


  construct : function()
  {
    this.base(arguments);
    
    this.__items = [];
  },

  members :
  {
    __items : null,
    
    add : function(item) {
      // check the init values
      if (this.__supportsValue(item)) {
        var init = item.getValue();
      } else if (this.__supportsSingleSelection(item)) {
        var init = item.getSelection();
      } else {
        throw new Error("Item " + item + " not supported for reseting.");
      }
      // store the item and its init value
      this.__items.push({item: item, init: init});
    },
    
    
    /**
     * Resets all added form items to their initial value. The initial value 
     * is the value in the widget during the {@link #add}.
     */
    reset: function() {
      // reset all form items
      for (var i = 0; i < this.__items.length; i++) {
        var dataEntry = this.__items[i];
        // set the init value        
        if (this.__supportsValue(dataEntry.item)) {
          dataEntry.item.setValue(dataEntry.init);          
        } else if (this.__supportsSingleSelection(dataEntry.item)) {
          dataEntry.item.setSelection(dataEntry.init)
        }
      }
    },
    
    
    /**
     * Returns true, if the given item implements the 
     * {@link qx.ui.core.ISingleSelection} interface.
     *
     * @param formItem {qx.core.Object} The item to check.
     * @return {boolean} true, if the given item implements the 
     *   necessary interface. 
     */    
    __supportsSingleSelection : function(formItem) {
      var clazz = formItem.constructor;
      return qx.Class.hasInterface(clazz, qx.ui.core.ISingleSelection);      
    },
    
    
    /**
     * Returns true, if the value property is supplied by the form item.
     * 
     * @param formItem {qx.core.Object} The item to check.
     * @return {boolean} true, if the given item implements the 
     *   necessary interface. 
     */    
    __supportsValue : function(formItem) {
      var clazz = formItem.constructor;
      return (
        qx.Class.hasInterface(clazz, qx.ui.form.IBooleanForm) ||
        qx.Class.hasInterface(clazz, qx.ui.form.IColorForm) ||
        qx.Class.hasInterface(clazz, qx.ui.form.IDateForm) ||
        qx.Class.hasInterface(clazz, qx.ui.form.INumberForm) ||
        qx.Class.hasInterface(clazz, qx.ui.form.IStringForm)
      );
    }    
  }
});