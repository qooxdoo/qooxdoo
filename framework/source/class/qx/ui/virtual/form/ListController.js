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
 */


qx.Class.define("qx.ui.virtual.form.ListController",
{
  extend : qx.core.Object,


  construct : function(model, target)
  {
    this.base(arguments);

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
    target :
    {
      check : "qx.ui.virtual.form.List",
      event: "changeTarget",
      nullable: true,
      init: null,
      apply: "_applyTarget"
    },

    model :
    {
      check : "qx.data.IListData",
      event : "changeModel",
      nullable: true,
      init: null,
      apply: "_applyModel"
    },

    selection :
    {
      check : "qx.data.IListData",
      event : "changeSelection",
      apply: "_applySelection"
    },


    /**
     * Delegation object, which can have one ore more functions defined by the
     * {@link #IControllerDelegate} interface.
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
    
    /** @lint ignoreReferenceField(_validDelegates) */
    _validDelegates : ["sorter", "filter"],

    /*
    ---------------------------------------------------------------------------
       DATA PROVIDER
    ---------------------------------------------------------------------------
    */

    /**
     * @type member
     * @param row {Number} index of lookup table
     * @return {Object}
     */
    _getRowData : function(row)
    {
      var model = this.getModel();
      return model ? model.getItem(this.__lookup(row)) : null;
    },


    /**
     * @type member
     * @param modelItem {Object}
     * @return {Number}
     */
    _getModelRow : function(modelItem)
    {
      return this.getModel().indexOf(modelItem);
    },


    /**
     * @type member
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
     * updates the lookup table
     *
     * @return {void}
     */
    update : function () {
      this.__buildUpLookupTable();
    },


    /**
     * @return {void}
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
     * @param model {qx.data.IListData}
     * @return {void}
     */
    _runDelegateSorter : function (model)
    {
      if (!this._containsDelegateMethod(this.getDelegate(), "sorter") ||
          qx.lang.Type.isObject(model))
      {
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
     * @param model {qx.data.IListData}
     * @return {void}
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
     * @type member
     * @param delegate {Object}
     * @return {Boolean}
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
     * @type member
     * @param method {String}
     * @return {Function}
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
     * @type member
     * @param index {Number}
     */
    __lookup: function(index) {
      return this.__lookupTable[index];
    },


    /*
    ---------------------------------------------------------------------------
       APPLY METHODS
    ---------------------------------------------------------------------------
    */

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


    _applyModel: function(value, old)
    {
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

      if (old != null)
      {
        old.removeListenerById(this.__changeLengthListenerId);
        old.removeListenerById(this.__changeListenerId);
        old.removeListenerById(this.__changeBubbleListenerId);
      }

      if (this.getTarget() != null) {
        this._syncRowCount();
      }
    },


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
     * TODOC
     */
    _onChangeSelectionView: function(e) {
      this._syncViewSelectionToModel();
    },


    /**
     * TODOC
     */
    _onChangeSelectionModel : function(e) {
      this._syncModelSelectionToView();
    },


    /**
     * TODOC
     */
    _onChangeLengthModel: function(e) {
      this.__buildUpLookupTable();
      this._syncRowCount();
    },


    /**
     * TODOC
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
     * TODOC
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
     * TODOC
     */
    _syncViewSelectionToModel : function()
    {
      if (this._ignoreSelectionChange) {
        return;
      }

      var target = this.getTarget();
      if (!target)
      {
        this.getSelection().removaeAll();
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
     * TODOC
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
     * TODOC
     */
    _syncRowCount: function()
    {
      var length = this.getRowCount();
      this.getTarget().setRowCount(length);
    },


    /**
     * TODOC
     */
    getCellData: function(row) {
      return this._getRowData(row) || "";
    }

  }
});
