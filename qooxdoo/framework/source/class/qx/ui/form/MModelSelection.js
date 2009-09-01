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
qx.Mixin.define("qx.ui.form.MModelSelection", 
{
  members :
  {
    getModelSelection : function() 
    {
      var selection = this.getSelection();
      var models = [];
      for (var i = 0; i < selection.length; i++) {
        models.push(selection[i].getModel());
      }
      return models;
    },
    
    
    setModelSelection : function(modelSelection) 
    {
      var selectables = this.getSelectables();
      
      var itemSelection = [];
      
      for (var i = 0; i < modelSelection.length; i++) {
        var model = modelSelection[i];
        for (var j = 0; j < selectables.length; j++) {
          var selectable = selectables[j];
          if (model === selectable.getModel()) {
            itemSelection.push(selectable);
            break;
          }
        }
      }
     
      this.setSelection(itemSelection);
    }
  }
});
