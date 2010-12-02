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
   * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * EXPERIMENTAL!
 *
 * This controller is responsible for bringing a data array like model to
 * a virtual list.
 *
 * This code is highly experimental and there will be API changes.
 *
 * @deprecated This 'qx.ui.virtual.form.List' is deprecated use 'qx.ui.list.List'
 *   instead. The current 'qx.ui.list.List' doens't support HTML rendering, but
 *   it will have this feature in the future. Due to the missing HTML rendering
 *   feature we suggest only to use deprecated 'qx.ui.virtual.form.List'
 *   implementation when the HTML rendering feature is needed otherwise use
 *   'qx.ui.list.List'.
 */
qx.Class.define("qx.ui.virtual.form.ListController",
{
  extend : qx.core.Object,


  /**
   * @param model {qx.data.IListData} The model as array.
   * @param target {qx.ui.virtual.form.List} The virtual list as target.
   */
  construct : function(model, target)
  {
    this.base(arguments);

    this.__lookupTable = [];

    this.setSelection(new qx.data.Array());

    if (model != null) {
      this.setModel(model);
    }

    if (target != null) {
      this.setTarget(target);
    }
  },


  properties :
  {
    /** The target widget which should show the data. */
    target :
    {
      check : "qx.ui.virtual.form.List",
      event: "changeTarget",
      nullable: true,
      init: null,
      apply: "_applyTarget"
    },


    /** Data array containing the data which should be shown in the list. */
    model :
    {
      check : "qx.data.IListData",
      event : "changeModel",
      nullable: true,
      init: null,
      apply: "_applyModel"
    },


    /**
     * Data array containing the selected model objects. This property can be
     * manipulated directly which means that a push to the selection will also
     * select the corresponding element in the target.
     */
    selection :
    {
      check : "qx.data.IListData",
      event : "changeSelection",
      apply: "_applySelection"
    },


    /**
     * Delegation object, which can have one ore more functions defined by the
     * {@link qx.data.controller.IControllerDelegate} interface.
     */
    delegate :
    {
      apply: "_applyDelegate",
      event: "changeDelegate",
      init: null,
      nullable: true
    }
  },


  members :
  {
    __changeLengthListenerId : null,
    __changeListenerId : null,
    __changeBubbleListenerId : null,
    __changeSelectionListenerId: null,
    __changeSelectionModelListenerId : null,
    __changeSelectionLengthModelListenerId : null,

    __lookupTable : null,


    /**
     * @lint ignoreReferenceField(_validDelegates)
     */
    _validDelegates : ["sorter", "filter"],

    /*
    ---------------------------------------------------------------------------
       DATA PROVIDER
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the data in the given row.
     *
     * @param row {Number} index of lookup table
     * @return {var}
     */
    _getRowData : function(row)
    {
      var model = this.getModel();
      return model ? model.getItem(this.__lookup(row)) : null;
    },


    /**
     * Returns the row of the given model.
     *
     * @param modelItem {Object} The model to search for.
     * @return {Number} The index of the model.
     */
    _getModelRow : function(modelItem)
    {
      return this.getModel().indexOf(modelItem);
    },


    /**
     * Returns the absolute number of rows.
     *
     * @return {Number} length of lookup table
     */
    getRowCount : function()
    {
      return this.__lookupTable.length;
    },



    /*
    ---------------------------------------------------------------------------
       LOOKUP STUFF
    ---------------------------------------------------------------------------
    */

    /**
     * Updates the lookup table used for sorting and filtering.
     */
    update : function ()
    {
      this.__buildUpLookupTable();
      this._syncViewSelectionToModel();
    },


    /**
     * Internal method for building the lookup table.
     */
    __buildUpLookupTable : function()
    {
      var model = this.getModel();

      if (model == null) {
        return;
      }

      // clear lookup table
      this.__lookupTable = [];

      // apply the filter
      // run filter first to get a smaller list for other delegates
      this._runDelegateFilter(model);

      // apply the sorting
      this._runDelegateSorter(model);

      if (this.getTarget() != null) {
        this._syncRowCount();
      }
    },


    /**
     * Invokes a sorting using the sorter given in the delegate.
     *
     * @param model {qx.data.IListData} The model.
     */
    _runDelegateSorter : function (model)
    {
      if (!this._containsDelegateMethod(this.getDelegate(), "sorter") ||
          qx.lang.Type.isObject(model)) {
        return;
      }

      if (this.__lookupTable.length == 0) {
        return;
      }

      var sorter = this._getDelegate("sorter");

      if (sorter != null)
      {
        this.__lookupTable.sort(function(a, b)
        {
          return sorter(model.getItem(a), model.getItem(b));
        });
      }
    },


    /**
     * Invokes a filtering using the filter given in the delegate.
     *
     * @param model {qx.data.IListData} The model.
     */
    _runDelegateFilter : function (model)
    {
      if (typeof model !== "object")
      {
        return;
      }

      var filter = this._getDelegate("filter");

      for (var i = 0,l = model.length; i < l; ++i)
      {
        if (filter == null || filter(model.getItem(i))) {
          this.__lookupTable.push(i);
        }
      }
    },


    /**
     * Checks, if the given delegate is valid or if a specific method is given.
     *
     * @param delegate {Object} The delegate object.
     * @param specificMethod {String} The name of the method to search for.
     * @return {Boolean} True, if everything was ok.
     */
    _containsDelegateMethod : function (delegate, specificMethod)
    {
      var Type = qx.lang.Type;

      if (Type.isObject(delegate))
      {
        if (Type.isString(specificMethod))
        {
          return Type.isFunction(delegate[specificMethod]);
        }
        else
        {
          for (var methodName in this._validDelegates)
          {
            if (Type.isFunction(delegate[methodName]))
            {
              return true;
            }
          }
        }
      }

      return false;
    },


    /**
     * Returns the delegate method given my its name.
     *
     * @param method {String} The name of the delegate method.
     * @return {Function|null} The requested method or null, if no method is set.
     */
    _getDelegate : function (method)
    {
      var delegate = this.getDelegate();

      if (this._containsDelegateMethod(delegate, method))
      {
        return delegate[method];
      }

      return null;
    },


    /**
     * Performs a lookup.
     *
     * @param index {Number} The index to look at.
     */
    __lookup: function(index) {
      return this.__lookupTable[index];
    },


    /*
    ---------------------------------------------------------------------------
       APPLY METHODS
    ---------------------------------------------------------------------------
    */

    // apply method
    _applyDelegate: function(value, old)
    {
      // TODO add other delegate functions
      if (this.getTarget() == null || this.getModel() == null) {
        return;
      }

      if (this._containsDelegateMethod(value)) {
        this.__buildUpLookupTable();
      }
    },


    // apply method
    _applyTarget: function(value, old)
    {
      if (value != null)
      {
        value.setDelegate(this);

        this.__changeSelectionListenerId = value.getSelectionManager().addListener(
          "changeSelection", this._onChangeSelectionView, this
        );
      }

      if (old != null)
      {
        old.setDelegate(null);
        old.getSelectionManager().removeListenerById(this.__changeSelectionListenerId);
      }

      if (this.getModel() == null) {
        return;
      }

      this.__buildUpLookupTable();
      this._syncRowCount();
    },


    // apply method
    _applyModel: function(value, old)
    {
      if (old != null)
      {
        old.removeListenerById(this.__changeLengthListenerId);
        old.removeListenerById(this.__changeListenerId);
        old.removeListenerById(this.__changeBubbleListenerId);
      }

      if (value != null)
      {
        this.__buildUpLookupTable();

        this.__changeLengthListenerId = value.addListener(
          "changeLength", this._onChangeLengthModel, this
        );

        this.__changeListenerId = value.addListener(
          "change", this._onChangeModel, this
        );

        this.__changeBubbleListenerId = value.addListener(
          "changeBubble", this._onChangeBubbleModel, this
        );
      }

      if (this.getTarget() != null) {
        this._syncRowCount();
      }
    },


    // apply method
    _applySelection: function(value, old)
    {
      if (value != null)
      {
        this.__changeSelectionModelListenerId = value.addListener(
          "change", this._onChangeSelectionModel, this
        );
        this.__changeSelectionLengthModelListenerId = value.addListener(
          "changeLength", this._onChangeSelectionModel, this
        );
        this._syncModelSelectionToView();
      }

      if (old != null)
      {
        old.removeListenerById(this.__changeSelectionModelListenerId);
        old.removeListenerById(this.__changeSelectionLengthModelListenerId);
      }
    },


    /*
    ---------------------------------------------------------------------------
       EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Handler for the changes of the target selection.
     *
     * @param e {qx.event.type.Data} The change event.
     */
    _onChangeSelectionView: function(e) {
      this._syncViewSelectionToModel();
    },


    /**
     * Handler for the selection changes of the model.
     *
     * @param e {qx.event.type.Data} The change event.
     */
    _onChangeSelectionModel : function(e) {
      this._syncModelSelectionToView();
    },


    /**
     * Handler for the change of the model length.
     *
     * @param e {qx.event.type.Event} The change event.
     */
    _onChangeLengthModel: function(e) {
      this.__buildUpLookupTable();
      this._syncRowCount();
    },


    /**
     * Handler for changes in the model itself.
     *
     * @param e {qx.event.type.Data} The change event.
     */
    _onChangeModel: function(e)
    {
      var target = this.getTarget();
      if (target != null) {
        this.__buildUpLookupTable();
        target.update();
      }
    },


    /**
     * Handler for changes in the children of the model.
     *
     * @param e {qx.event.type.Data} The change event.
     */
    _onChangeBubbleModel : function(e)
    {
      var target = this.getTarget();
      if (target != null) {
        this.__buildUpLookupTable();
        target.update();
      }
    },



    /*
    ---------------------------------------------------------------------------
       SYNC STUFF
    ---------------------------------------------------------------------------
    */

    /**
     * Internal helper for syncing the selection of the view to the controller
     * selection.
     */
    _syncViewSelectionToModel : function()
    {
      if (this._ignoreSelectionChange) {
        return;
      }

      var target = this.getTarget();
      if (!target)
      {
        this.getSelection().removeAll();
        return;
      }

      var targetSelection = target.getSelectionManager().getSelection();
      var selection = [];

      for (var i = 0; i < targetSelection.length; i++) {
        var modelItem = this._getRowData(targetSelection[i]);
        selection.push(modelItem);
      }

      // put the first two parameter into the selection array
      selection.unshift(this.getSelection().length);
      selection.unshift(0);

      this._ignoreSelectionChange = true;
      this.getSelection().splice.apply(this.getSelection(), selection);
      this._ignoreSelectionChange = false;
    },


    /**
     * Internal helper for syncing the selection of the controller to the
     * selection of the target.
     */
    _syncModelSelectionToView : function()
    {
      if (this._ignoreSelectionChange) {
        return;
      }

      var target = this.getTarget();
      if (!target) {
        return;
      }

      this._ignoreSelectionChange = true;

      var modelSelection = this.getSelection();
      var selection = [];

      for (var i = modelSelection.length; i >= 0; i--)
      {
        var row = this._getModelRow(modelSelection.getItem(i));
        if (row !== -1) {
          selection.push(row);
        } else {
          modelSelection.removeAt(i);
        }
      }

      target.getSelectionManager().replaceSelection(selection);
      this._ignoreSelectionChange = false;
    },


    /**
     * Helper for passing a new row count to the target.
     */
    _syncRowCount: function()
    {
      var length = this.getRowCount();
      this.getTarget().setRowCount(length);
    },


    /**
     * Accessor for the row data.
     *
     * @param row {Number} The row to access.
     */
    getCellData: function(row) {
      return this._getRowData(row) || "";
    }

  },


  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct : function() {
    this.__lookupTable = null;
  }
});
