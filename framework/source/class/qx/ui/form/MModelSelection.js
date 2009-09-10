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
/**
 * This mixin offers the selection of the model properties.
 * It can only be included if the object including it implements the
 * {@link qx.ui.core.ISingleSelection} interface and the selectables implement
 * the {@link qx.ui.form.IModel} interface.
 */
qx.Mixin.define("qx.ui.form.MModelSelection",
{
  members :
  {
    /**
     * Returns always an array of the models of the selected items. If no
     * item is selected or no model is given, the array will be empty.
     *
     * @return {var} An array of the models of the selected items.
     */
    getModelSelection : function()
    {
      var selection = this.getSelection();
      var models = [];
      for (var i = 0; i < selection.length; i++) {
        var model = selection[i].getModel();
        if (model != null) {
          models.push(model);
        }
      }
      return models;
    },


    /**
     * Takes the given models in the array and searches for the corresponding
     * selecables. If an selectable does have that model attached, it will be
     * selected.
     *
     * *Attention:* This method can have a time complexity of O(n^2)!
     *
     * @param modelSelection {Array} An array of models, which should be
     *   selected.
     */
    setModelSelection : function(modelSelection)
    {
      // check for null values
      if (!modelSelection) 
      {
        this.resetSelection();
        return;
      }
      
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        this.assertArray(modelSelection, "Please use an array as parameter.");
      }
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
