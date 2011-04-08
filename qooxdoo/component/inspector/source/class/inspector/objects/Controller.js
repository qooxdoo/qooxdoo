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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Controller for the object view {@link inspector.objects.View}.
 */
qx.Class.define("inspector.objects.Controller",
{
  extend : qx.core.Object,

  /**
   * Creates the controller with the view.
   *
   * @param model {inspector.objects.Model} the model for the view.
   */
  construct : function(model)
  {
    this.base(arguments);

    if (qx.core.Environment.get("qx.debug"))
    {
      qx.core.Assert.assertInterface(
        model,
        inspector.objects.Model,
        "Invalid parameter 'model'."
      );
    }

    this.__model = model;
    this.__model.addListener("changeInspected", this.__onChangeInspected, this);
    this.__model.addListener("changeObjects", this.__onChangeObjects, this);

    this.__view = new inspector.objects.View(this);

    this.__timer = qx.util.TimerManager.getInstance();

    // The table only scroll in to view when the table is visible
    this.__view.addListenerOnce("appear", function(event) {
      this.__view.selectObject(this.__model.getInspected());
    }, this);

    this.__initializeView();
  },

  members :
  {
    /**
     * {inspector.objects.View} the view instance to control.
     */
    __view : null,

    /**
     * {inspector.objects.Model} the model instance.
     */
    __model : null,

    /**
     * {inspector.objects.table.HashModel} the table model for the hash code presentation.
     */
    __tableHashModel : null,

    /**
     * {inspector.objects.table.CountModel} the table model for the count presentation.
     */
    __tableCountModel : null,

    /**
     * {qx.util.TimerManager} instance to the timer util manager.
     */
    __timer : null,

    /**
     * {Integer|null} timer id of current running timer.
     */
    __timerId : null,

    /**
     * {Boolean} if the value is set to <code>true</code> the controller ignore
     *  a inspected object change from the view. In this case the model is
     *  not updated.
     */
    __ignoreInpectObject : false,

    /**
     * Returns the controlled view.
     *
     * @return {inspector.objects.View} returns the controlled view instance.
     */
    getView : function() {
      return this.__view;
    },

    /**
     * Reload the current view. Updated the hash code and the count presentation
     * form the view.
     */
    reload : function() {
      this.__ignoreInpectObject = true;
      this.__getTableCountModel().reload();
      this.__getTableHashModel().reload();
      this.__ignoreInpectObject = false;
      this.__view.selectObject(this.__model.getInspected());
    },

    /**
     * Switch the view to the hash code presentation.
     */
    showByHash : function() {
      this.__view.setByHashActive(true);
      this.__view.setByCountActive(false);

      this.__view.setTableModel(this.__getTableHashModel());
      this.__view.setTableSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
      this.__view.selectObject(this.__model.getInspected());
    },

    /**
     * Switch the view to the count presentation.
     */
    showByCount : function() {
      this.__view.setByHashActive(false);
      this.__view.setByCountActive(true);

      this.__view.setTableModel(this.__getTableCountModel());
      this.__view.setTableSelectionMode(qx.ui.table.selection.Model.NO_SELECTION);
      this.__view.selectObject(null);
    },

    /**
     * Set the passed filter to the model. The model shows only the objects
     * which match to the passed filter value.
     *
     * @param filter {String} The filter value for the model.
     */
    setFilter : function(filter) {
      this.__ignoreInpectObject = true;
      this.__stopTimer();

      this.__timerId = this.__timer.start(function() {
        this.__timerId = null;

        this.__getTableCountModel().filter(filter);
        this.__getTableHashModel().filter(filter);

        // Set the inspected object, because the filter changes the selection
        // model, which try to select a wrong object
        this.__ignoreInpectObject = false;
        this.__view.selectObject(this.__model.getInspected());
      }, 0, this, null, 500);
    },

    /**
     * Sets the inspected object. If the passed value is not <code>null</code>
     * the object with the passed hash code is set to the model. Otherwise
     * the model is not updated.
     *
     * @param hashCode {String} hash code form the new object, which should set
     *   as inspected.
     */
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

    /**
     * Initialize the view.
     */
    __initializeView: function() {
      this.__view.setFilter("");
      this.showByHash();
    },

    /**
     * Stops the current running timer.
     */
    __stopTimer : function()
    {
      if (this.__timerId != null) {
        this.__timer.stop(this.__timerId);
        this.__timerId = null;
      }
    },

    /**
     * Event listener from the "changeInspected" event form the model.
     *
     * @param event {qx.event.type.Data} the event from the model.
     */
    __onChangeInspected : function(event)
    {
      var objectToInspect = event.getData();
      this.__view.selectObject(objectToInspect);
    },

    /**
     * Event listener from the "changeObjects" event form the model.
     *
     * @param event {qx.event.type.Event} the event from the model.
     */
    __onChangeObjects : function(event) {
      this.reload();
    },

    /**
     * Returns the table model for the hash code presentation. If no model exists, a
     * new instance will be created.
     *
     * @return {inspector.objects.table.HashModel} the model for the hash code representation.
     */
    __getTableHashModel : function() {
      if (this.__tableHashModel == null) {
        this.__tableHashModel = new inspector.objects.table.HashModel(this.__model);
      }
      return this.__tableHashModel;
    },

    /**
     * Returns the table model for the count presentation. If no model exists, a
     * new instance will be created.
     *
     * @return {inspector.objects.CountModel} the model for the count representation.
     */
    __getTableCountModel : function() {
      if (this.__tableCountModel == null) {
        this.__tableCountModel = new inspector.objects.table.CountModel(this.__model);
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

    this.__view = this.__model = this.__tableHashModel = this.__timerId
      this.__tableCountModel = this.__timer = this.__ignoreInpectObject = null;
  }
});
