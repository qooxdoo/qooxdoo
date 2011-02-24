/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * The mixin controls the binding between model and item.
 *
 * @internal
 */
qx.Mixin.define("qx.ui.tree.core.MWidgetController",
{
  construct : function() {
    this.__boundItems = [];
  },


  properties :
  {
    /**
     * The name of the property, where the value for the tree node/leaf label
     * is stored in the model classes.
     */
    labelPath :
    {
      check: "String",
      nullable: true
    },


    /**
     * A map containing the options for the label binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */
    labelOptions :
    {
      nullable: true
    },


    /**
     * Delegation object, which can have one or more functions defined by the
     * {@link qx.ui.tree.core.IVirtualTreeDelegate} interface.
     */
    delegate :
    {
      event: "changeDelegate",
      init: null,
      nullable: true
    }
  },


  members :
  {
    /** {Array} which contains the bounded items */
    __boundItems : null,


    /**
     * Helper-Method for binding the default properties from the model to the 
     * target widget. The used default properties  depends on the passed item.
     *
     * This method should only be called in the {@link IVirtualTreeDelegate#bindItem} 
     * function implemented by the {@link #delegate} property.
     *
     * @param item {qx.ui.core.Widget} The internally created and used node or 
     *   leaf.
     * @param index {Integer} The index of the item (node or leaf).
     */
    bindDefaultProperties : function(item, index)
    {
      this.bindProperty(
        this.getLabelPath(), "label", this.getLabelOptions(), item, index
      );
    },


    /**
     * Helper-Method for binding a given property from the model to the target
     * widget.
     * 
     * This method should only be called in the {@link IVirtualTreeDelegate#bindItem} 
     * function implemented by the {@link #delegate} property.
     *
     * @param sourcePath {String | null} The path to the property in the model.
     * @param targetProperty {String} The name of the property in the target widget.
     * @param options {Map | null} The options to use for the binding.
     * @param targetWidget {qx.ui.core.Widget} The target widget.
     * @param index {Integer} The index of the current binding.
     */
    bindProperty : function(sourcePath, targetProperty, options, targetWidget, index)
    {
      var bindPath = this.__getBindPath(index, sourcePath);
      var bindTarget = this._tree.getLookupTable();

      var id = bindTarget.bind(bindPath, targetWidget, targetProperty, options);
      this.__addBinding(targetWidget, id);
    },


    /**
     * Helper-Method for binding a given property from the target widget to
     * the model.
     * This method should only be called in the
     * {@link IListDelegate#bindItem} function implemented by the
     * {@link #delegate} property.
     *
     * @param targetPath {String | null} The name of the property in the target.
     * @param sourcePath {String} The path to the property in the model.
     * @param options {Map | null} The options to use for the binding.
     * @param sourceWidget {qx.ui.core.Widget} The source widget.
     * @param index {Integer} The index of the current binding.
     */
    bindPropertyReverse: function(targetPath, sourcePath, options, sourceWidget, index)
    {
    },


    /**
     * Configure the passed item if a delegate is set and the needed function 
     * {@link IVirtualTreeDelegate#configureNode} is available.
     *
     * @param item {qx.ui.core.Widget} item to configure.
     */
    _configureItem : function(item)
    {
      var delegate = this.getDelegate();

      if (delegate != null && delegate.configureNode != null) {
        delegate.configureNode(item);
      }
    },


    /**
     * Configure the passed item if a delegate is set and the needed function 
     * {@link IVirtualTreeDelegate#configurLeaf} is available.
     *
     * @param item {qx.ui.core.Widget} item to configure.
     */
    _configureLeafItem : function(item)
    {
      var delegate = this.getDelegate();

      if (delegate != null && delegate.configurLeaf != null) {
        delegate.configurLeaf(item);
      }
    },


    /**
     * Sets up the binding for the given node and index.
     *
     * @param item {qx.ui.core.Widget} The internally created and used node.
     * @param index {Integer} The index of the item.
     */
    _bindNode : function(item, index)
    {
      var delegate = this.getDelegate();

      if (delegate != null && delegate.bindItem != null) {
        delegate.bindItem(this, item, index);
      } else {
        this.bindDefaultProperties(item, index);
      }
    },


    /**
     * Sets up the binding for the given leaf and index.
     *
     * @param item {qx.ui.core.Widget} The internally created and used leaf.
     * @param index {Integer} The index of the item.
     */
    _bindLeaf : function(item, index)
    {
      var delegate = this.getDelegate();

      if (delegate != null && delegate.bindGroupItem != null) {
        delegate.bindGroupItem(this, item, index);
      } else {
        this.bindDefaultProperties(item, index);
      }
    },

    /**
     * Removes the binding of the given item.
     *
     * @param item {qx.ui.core.Widget} The item which the binding should be 
     *   removed.
     */
    _removeBindingsFrom : function(item)
    {
      var bindings = this.__getBindings(item);

      while (bindings.length > 0)
      {
        var id = bindings.pop();

        try {
          this._tree.getLookupTable().removeBinding(id);
        } catch(e) {
          item.removeBinding(id);
        }
      }

      if (qx.lang.Array.contains(this.__boundItems, item)) {
        qx.lang.Array.remove(this.__boundItems, item);
      }
    },


    /**
     * Helper method to create the path for binding.
     *
     * @param index {Integer} The index of the item.
     * @param path {String|null} The path to the property.
     */
    __getBindPath : function(index, path)
    {
      var bindPath = "[" + index + "]";
      if (path != null && path != "") {
        bindPath += "." + path;
      }
      return bindPath;
    },


    /**
     * Helper method to save the binding for the widget.
     *
     * @param widget {qx.ui.core.Widget} widget to save binding.
     * @param id {var} the id from the binding.
     */
    __addBinding : function(widget, id)
    {
      var bindings = this.__getBindings(widget);

      if (!qx.lang.Array.contains(bindings, id)) {
        bindings.push(id);
      }

      if (!qx.lang.Array.contains(this.__boundItems, widget)) {
        this.__boundItems.push(widget);
      }
    },


    /**
     * Helper method which returns all bound id from the widget.
     *
     * @param widget {qx.ui.core.Widget} widget to get all binding.
     * @return {Array} all bound id's.
     */
    __getBindings : function(widget)
    {
      var bindings = widget.getUserData("BindingIds");

      if (bindings == null) {
        bindings = [];
        widget.setUserData("BindingIds", bindings);
      }

      return bindings;
    }
  },


  destruct : function() {
    this.__boundItems = null;
  }
});
