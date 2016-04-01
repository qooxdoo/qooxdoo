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
     * John Spackman (john.spackman@zenesis.com)

************************************************************************ */


/**
 * <h2>List Controller</h2>
 *
 * *General idea*
 * The list controller is responsible for synchronizing every list like widget
 * with a data array. It does not matter if the array contains atomic values
 * like strings of complete objects where one property holds the value for
 * the label and another property holds the icon url. You can even use converters
 * that make the label show a text corresponding to the icon, by binding both
 * label and icon to the same model property and converting one of them.
 *
 * *Features*
 *
 * * Synchronize the model and the target
 * * Label and icon are bindable
 * * Takes care of the selection
 * * Passes on the options used by {@link qx.data.SingleValueBinding#bind}
 *
 * *Usage*
 *
 * As model, only {@link qx.data.Array}s do work. The currently supported
 * targets are
 *
 * * {@link qx.ui.form.SelectBox}
 * * {@link qx.ui.form.List}
 * * {@link qx.ui.form.ComboBox}
 *
 * All the properties like model, target or any property path is bindable.
 * Especially the model is nice to bind to another selection for example.
 * The controller itself can only work if it has a model and a target set. The
 * rest of the properties may be empty.
 *
 * *Update from List*
 *
 * This controller is an optional upgrade for {@link qx.data.controller.List}, the
 * use of which is discouraged because of issues when the model length changes 
 * (@see https://github.com/qooxdoo/qooxdoo/pull/197).  It is largely a drop in 
 * replacement for List with the exception of the delegate which no longer provides 
 * the filter or configureItem methods.  Filtering is achieved by using 
 * {@link qx.data.controller.ArrayFilter} on the model, and the delegate has changed
 * to reflect that model items are bound directly, and not indexed from the model 
 * array.  The delegate configureItem method has been replaced with bindTargetItem
 * (which has a corresponding unbindTargetItem).
 * 
 * There is one crucial difference between ListOfObjects and List - ListOfObjects 
 * requires that all of the objects in the model are derived from qx.core.Object, 
 * while List also supports scalar values (eg strings); however, this requires List 
 * to bind by model indexes which causes the issues when the length of the model changes. 
 */
qx.Class.define("qx.data.controller.ListOfObjects",
{
  extend : qx.core.Object,
  include: qx.data.controller.MSelection,
  implement : qx.data.controller.ISelection,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param model {qx.data.Array?null} The array containing the data.
   *
   * @param target {qx.ui.core.Widget?null} The widget which should show the
   *   ListItems.
   *
   * @param labelPath {String?null} If the model contains objects, the labelPath
   *   is the path reference to the property in these objects which should be
   *   shown as label.
   */
  construct : function(model, target, labelPath)
  {
    this.base(arguments);
    
    var targetItems = new qx.data.Array();
    targetItems.addListener("change", this.__onTargetItemsChange, this);
    this.__items = new qx.data.controller.ArrayMirror({
      createTargetItem: this._onCreateTargetItem.bind(this),
      bindTargetItem: this._onBindTargetItem.bind(this),
      unbindTargetItem: this._onUnbindTargetItem.bind(this),
      disposeTargetItem: this._onDisposeTargetItem.bind(this)
    }).set({
      target: targetItems
    });
    this.__items.bindChild("", "model");

    if (labelPath != null) {
      this.setLabelPath(labelPath);
    }
    if (model != null) {
      this.setModel(model);
    }
    if (target != null) {
      this.setTarget(target);
    }
  },



  /*
   *****************************************************************************
      PROPERTIES
   *****************************************************************************
   */

  properties :
  {
    /** Data array containing the data which should be shown in the list. */
    model :
    {
      check: "qx.data.IListData",
      apply: "_applyModel",
      event: "changeModel",
      nullable: true,
      dereference: true
    },


    /** The target widget which should show the data. */
    target :
    {
      apply: "_applyTarget",
      event: "changeTarget",
      nullable: true,
      init: null,
      dereference: true
    },


    /**
     * The path to the property which holds the information that should be
     * shown as a label. This is only needed if objects are stored in the model.
     */
    labelPath :
    {
      check: "String",
      apply: "_applyLabelPath",
      nullable: true
    },


    /**
     * The path to the property which holds the information that should be
     * shown as an icon. This is only needed if objects are stored in the model
     * and if the icon should be shown.
     */
    iconPath :
    {
      check: "String",
      apply: "_applyIconPath",
      nullable: true
    },


    /**
     * A map containing the options for the label binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */
    labelOptions :
    {
      apply: "_applyLabelOptions",
      nullable: true
    },


    /**
     * A map containing the options for the icon binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */
    iconOptions :
    {
      apply: "_applyIconOptions",
      nullable: true
    },


    /**
     * Delegation object, which can have one or more functions defined by the
     * {@link qx.data.controller.IArrayDelegate} interface.
     */
    delegate :
    {
      apply: "_applyDelegate",
      event: "changeDelegate",
      init: null,
      nullable: true
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    
    
    /*
    ---------------------------------------------------------------------------
       PUBLIC API
    ---------------------------------------------------------------------------
    */
    reload: function() {
      this.__items.reload();
    },

    
    
    /*
    ---------------------------------------------------------------------------
       ITEMS ARRAYMIRROR DELEGATE METHODS
    ---------------------------------------------------------------------------
    */
    _onCreateTargetItem: function() {
      var delegate = this.getDelegate();
      if (delegate && typeof delegate.createItem == "function")
        return delegate.createItem();
      return new qx.ui.form.ListItem();
    },
    
    _onBindTargetItem: function(targetItem, modelItem) {
      var delegate = this.getDelegate();
      if (delegate && typeof delegate.bindTargetItem == "function")
        return delegate.bindTargetItem(this, targetItem, modelItem);
    },
    
    _onUnbindTargetItem: function(targetItem, modelItem) {
      var delegate = this.getDelegate();
      if (delegate && typeof delegate.unbindTargetItem == "function")
        return delegate.unbindTargetItem(this, targetItem, modelItem);
    },
    
    _onDisposeTargetItem: function(targetItem) {
      var delegate = this.getDelegate();
      if (delegate && typeof delegate.disposeTargetItem == "function")
        return delegate.disposeTargetItem(this, targetItem);
    },
    
    
    
    /*
    ---------------------------------------------------------------------------
       EVENT HANDLERS
    ---------------------------------------------------------------------------
    */
    __onTargetItemsChange: function(evt) {
      var t = this;
      var target = this.getTarget();
      if (!target)
        return;
      var targetItems = this.__items.getTarget();
      var data = evt.getData();
      
      if (data.removed) {
        data.removed.forEach(function(item) {
          target.remove(item);
        });
      }
      if (data.added) {
        data.added.forEach(function(item) {
          var index = targetItems.indexOf(item);
          target.addAt(item, index);
        });
      }
      
      // Sync the order
      var children = target.getChildren();
      for (var i = 0; i < targetItems.getLength(); i++) {
        var targetItem = targetItems.getItem(i);
        var child = children[i];
        if (targetItem !== child) {
          target.remove(targetItem);
          target.addAt(targetItem, i);
        }
      }
    },
    
    
    /*
    ---------------------------------------------------------------------------
       APPLY METHODS
    ---------------------------------------------------------------------------
    */
    /**
     * If a new delegate is set, it applies the stored configuration for the
     * list items to the already created list items once.
     *
     * @param value {qx.core.Object|null} The new delegate.
     * @param old {qx.core.Object|null} The old delegate.
     */
    _applyDelegate: function(value, oldValue) {
      this.reload();
    },


    /**
     * Apply-method which will be called if the icon options has been changed.
     * It invokes a renewing of all set bindings.
     *
     * @param value {Map|null} The new icon options.
     * @param old {Map|null} The old icon options.
     */
    _applyIconOptions: function(value, oldValue) {
      var path = this.getIconPath();
      if (path) {
        this.__items.unbindChild(path, "icon");
        this.__items.bindChild(path, "icon", value);
      }
      this.reload();
    },


    /**
     * Apply-method which will be called if the label options has been changed.
     * It invokes a renewing of all set bindings.
     *
     * @param value {Map|null} The new label options.
     * @param old {Map|null} The old label options.
     */
    _applyLabelOptions: function(value, oldValue) {
      var path = this.getLabelPath();
      if (path) {
        this.__items.unbindChild(path, "label");
        this.__items.bindChild(path, "label", value);
      }
      this.reload();
    },


    /**
     * Apply-method which will be called if the icon path has been changed.
     * It invokes a renewing of all set bindings.
     *
     * @param value {String|null} The new icon path.
     * @param old {String|null} The old icon path.
     */
    _applyIconPath: function(value, oldValue) {
      if (oldValue)
        this.__items.unbindChild(oldValue, "icon");
      if (value)
        this.__items.bindChild(value, "icon", this.getIconOptions());
      this.reload();
    },


    /**
     * Apply-method which will be called if the label path has been changed.
     * It invokes a renewing of all set bindings.
     *
     * @param value {String|null} The new label path.
     * @param old {String|null} The old label path.
     */
    _applyLabelPath: function(value, oldValue) {
      if (oldValue)
        this.__items.unbindChild(oldValue, "label");
      if (value)
        this.__items.bindChild(value, "label", this.getLabelOptions());
      this.reload();
    },


    /**
     * Apply-method which will be called if the model has been changed. It
     * removes all the listeners from the old model and adds the needed
     * listeners to the new model. It also invokes the initial filling of the
     * target widgets if there is a target set.
     *
     * @param value {qx.data.Array|null} The new model array.
     * @param old {qx.data.Array|null} The old model array.
     */
    _applyModel: function(value, oldValue) {

      // erase the selection if there is something selected
      if (this.getSelection() != undefined && this.getSelection().length > 0) {
        this.getSelection().splice(0, this.getSelection().length).dispose();
      }
      
      this.__items.setModel(value);

      // if a model is set
      if (value != null) {
        // update the selection
        this._changeTargetSelection();
      }
      this._updateSelection();
    },


    /**
     * Apply-method which will be called if the target has been changed.
     * When the target changes, every binding needs to be reset and the old
     * target needs to be cleaned up. If there is a model, the target will be
     * filled with the data of the model.
     *
     * @param value {qx.ui.core.Widget|null} The new target.
     * @param old {qx.ui.core.Widget|null} The old target.
     */
    _applyTarget: function(value, oldValue) {
      // add a listener for the target change
      this._addChangeTargetListener(value, oldValue);
      
      if (oldValue) {
        oldValue.removeAll().forEach(function(item) {
          item.destroy();
        });
      }
      
      if (value) {
        value.removeAll().forEach(function(item) {
          item.destroy();
        });
        this.__items.getTarget().forEach(function(item) {
          value.add(item);
        });
      }
    }
  }
});
