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
     * Christian Schmidt (chris_schmidt)

************************************************************************ */

qx.Class.define("inspector.objects2.Controller",
{
  extend : qx.core.Object,

  construct : function(model)
  {
    this.base(arguments);

    if (qx.core.Variant.isSet("qx.debug", "on"))
    {
      qx.core.Assert.assertInterface(
        model,
        inspector.objects2.Model,
        "Invalid parameter 'model'."
      );
    }

    this.__model = model;
    this.__model.addListener("changeInspected", this.__onChangeInspected, this);
    this.__model.addListener("changeObjects", this.__onChangeObjects, this);

    this.__view = new inspector.objects2.View(this);

    this.__timer = qx.util.TimerManager.getInstance();

    this.__view.addListenerOnce("appear", function(event) {
      this.__view.selectObject(this.__model.getInspected());
    }, this);

    this.__initializeView();
  },

  members :
  {
    __view : null,

    __model : null,

    __tableHashModel : null,

    __tableCountModel : null,

    __timer : null,

    __timerId : null,

    __ignoreInpectObject : false,

    getView : function() {
      return this.__view;
    },

    reload : function() {
      this.__ignoreInpectObject = true;
      this.__getTableCountModel().reload();
      this.__getTableHashModel().reload();
      this.__ignoreInpectObject = false;
      this.__view.selectObject(this.__model.getInspected());
    },

    showByHash : function() {
      this.__view.setByHashActive(true);
      this.__view.setByCountActive(false);

      this.__view.setTableModel(this.__getTableHashModel());
      this.__view.setTableSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
      this.__view.selectObject(this.__model.getInspected());
    },

    showByCount : function() {
      this.__view.setByHashActive(false);
      this.__view.setByCountActive(true);

      this.__view.setTableModel(this.__getTableCountModel());
      this.__view.setTableSelectionMode(qx.ui.table.selection.Model.NO_SELECTION);
      this.__view.selectObject(null);
    },

    setFilter : function(filter) {
      this.__ignoreInpectObject = true;
      this.__stopTimer();

      this.__timerId = this.__timer.start(function() {
        this.__timerId = null;

        this.__getTableCountModel().filter(filter);
        this.__getTableHashModel().filter(filter);

        // Set the inspcected object, because the filter changes the selection
        // model, which try to select a wrong object
        this.__ignoreInpectObject = false;
        this.__view.selectObject(this.__model.getInspected());
      }, 0, this, null, 200);
    },

    inspect : function(hashCode) {
      if (hashCode == null) {
        // This occurs when the table lost the selection.
        // -> set the selected object again.
        this.__view.selectObject(this.__model.getInspected());
        return;
      }

      var objectToInspect = this.__model.getObjectFromHashCode(hashCode);

      if (objectToInspect != null && !this.__ignoreInpectObject) {
        this.__model.setInspected(objectToInspect);
      }
    },

    __initializeView: function() {
      this.__view.setFilter("");
      this.showByHash();
    },

    __stopTimer : function()
    {
      if (this.__timerId != null) {
        this.__timer.stop(this.__timerId);
        this.__timerId = null;
      }
    },

    __onChangeInspected : function(event)
    {
      var objectToInspect = event.getData();
      this.__view.selectObject(objectToInspect);
    },

    __onChangeObjects : function(event) {
      this.reload();
    },

    __getTableHashModel : function() {
      if (this.__tableHashModel == null) {
        this.__tableHashModel = new inspector.objects2.table.HashModel(this.__model);
      }
      return this.__tableHashModel;
    },

    __getTableCountModel : function() {
      if (this.__tableCountModel == null) {
        this.__tableCountModel = new inspector.objects2.table.CountModel(this.__model);
      }
      return this.__tableCountModel;
    }
  },

  destruct : function()
  {
    this.__stopTimer();

    if(this.__tableHashModel != null) {
      this.__tableHashModel.dispose();
    }

    if (this.__tableCountModel) {
      this.__tableCountModel.dispose();
    }

    this.__view.destroy();
    
    this.__view = this.__model = this.__tableHashModel =
      this.__tableCountModel = this.__timer = null;
  }
});
