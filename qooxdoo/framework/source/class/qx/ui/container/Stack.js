/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)
     * Christian Schmidt (chris_schmidt)

************************************************************************ */

/**
 * The stack container puts its child widgets on top of each other and only the
 * topmost widget is visible.
 *
 * This is used e.g. in the tab view widget. Which widget is visible can be
 * controlled by using the {@link #getSelection} method.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   // create stack container
 *   var stack = new qx.ui.container.Stack();
 *
 *   // add some children
 *   stack.add(new qx.ui.core.Widget().set({
 *    backgroundColor: "red"
 *   }));
 *   stack.add(new qx.ui.core.Widget().set({
 *    backgroundColor: "green"
 *   }));
 *   stack.add(new qx.ui.core.Widget().set({
 *    backgroundColor: "blue"
 *   }));
 *
 *   // select green widget
 *   stack.setSelection([stack.getChildren()[1]]);
 *
 *   this.getRoot().add(stack);
 * </pre>
 *
 * This example creates an stack with three children. Only the selected "green"
 * widget is visible.
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/documentation/0.8/widget/Stack' target='_blank'>
 * Documentation of this widget in the qooxdoo wiki.</a>
 */
qx.Class.define("qx.ui.container.Stack",
{
  extend : qx.ui.core.Widget,
  implement : qx.ui.core.ISingleSelection,
  include : qx.ui.core.MSingleSelectionHandling,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */


  construct : function()
  {
    this.base(arguments);

    this._setLayout(new qx.ui.layout.Grow);

    this.addListener("changeSelection", this.__onChangeSelection, this);
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */


  events :
  {
    /**
     * Fires after the selection was modified
     * @deprecated Use 'changeSelection' instead!
     */
    "change" : "qx.event.type.Data"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */


  properties :
  {
    /**
     * Whether the size of the widget depends on the selected child. When
     * disabled (default) the size is configured to the largest child.
     */
    dynamic :
    {
      check : "Boolean",
      init : false,
      apply : "_applyDynamic"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members :
  {
    // property apply
    _applyDynamic : function(value)
    {
      var children = this._getChildren();
      var selected = this.getSelection()[0];
      var child;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (child != selected)
        {
          if (value) {
            children[i].exclude();
          } else {
            children[i].hide();
          }
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      OLD SELECTION PROPERTY METHODS
    ---------------------------------------------------------------------------
    */


    /**
     * Select the given widget.
     *
     * @deprecated Use 'setSelection' instead!
     * @param item {qx.ui.core.Widget} Widget to select.
     */
    setSelected : function(item)
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'setSelection' instead!"
      );

      this.setSelection([item]);
    },

    /**
     * Returns the selected widget.
     *
     * @deprecated Use 'getSelection' instead!
     * @return {qx.ui.core.Widget} Selected widget.
     */
    getSelected : function()
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'getSelection' instead!"
      );

      var item = this.getSelection()[0];
      if (item) {
        return item
      } else {
        return null;
      }
    },

    /**
     * Reset the current selection.
     *
     * @deprecated Use 'resetSelection' instead!
     */
    resetSelected : function()
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'resetSelection' instead!"
      );

      this.resetSelection();
    },


    /*
    ---------------------------------------------------------------------------
      HELPER METHODS FOR SELECTION API
    ---------------------------------------------------------------------------
    */


    /**
     * Returns the widget for the selection.
     * @return {qx.ui.core.Widget[]} Widgets to select.
     */
    _getItems : function() {
      return this.getChildren();
    },

    /**
     * Returns if the selection could be empty or not.
     *
     * @return {Boolean} <code>true</code> If selection could be empty,
     *    <code>false</code> otherwise.
     */
    _isAllowEmptySelection : function() {
      return true;
    },

    /**
     * Returns whether the given item is selectable.
     *
     * @param item {qx.ui.core.Widget} The item to be checked
     * @return {Boolean} Whether the given item is selectable
     */
    _isItemSelectable : function(item) {
      return item.isEnabled();
    },

    /**
     * Event handler for <code>changeSelection</code>.
     *
     * Shows the new selected widget and hide the old one.
     *
     * @param e {qx.event.type.Data} Data event.
     */
    __onChangeSelection : function(e)
    {
      var old = e.getOldData()[0];
      var value = e.getData()[0];

      if (old)
      {
        if (this.isDynamic()) {
          old.exclude();
        } else {
          old.hide();
        }
      }

      if (value) {
        value.show();
      }

      /*
       * TODO remove this if the methods and event for old selection API
       * doesn't exist.
       *
       * Methods: 'getSelected', 'setSelected', 'resetSelected'
       * Event: 'change'
       */
      if (this.hasListener("change")) {
        this.fireDataEvent("change", value, old);
      }
    },

    // overridden
    addListener : function(type, listener, self, capture)
    {
      /*
       * TODO this method must be removed if the old selection API doesn't exist.
       *
       * Methods: 'getSelected', 'setSelected', 'resetSelected'
       * Event: 'change'
       */

      if (type === "change") {
        qx.log.Logger.deprecatedEventWarning(
        arguments.callee,
        "change",
        "Use 'changeSelection' instead!");
      }

      return this.base(arguments, type, listener, self, capture);
    },


    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */


    /**
     * Adds a new child to the stack.
     *
     * @param widget {qx.ui.core.Widget} Any widget.
     */
    add : function(widget)
    {
      this._add(widget);

      var selected = this.getSelection()[0];

      if (!selected) {
        this.setSelection([widget]);
      }
      else if (selected !== widget)
      {
        if (this.isDynamic()) {
          widget.exclude();
        } else {
          widget.hide();
        }
      }
    },

    /**
     * Removes the given widget from the stack.
     *
     * @param widget {qx.ui.core.Widget} Any widget.
     */
    remove : function(widget)
    {
      this._remove(widget);

      if (this.getSelection()[0] === widget)
      {
        var first = this._getChildren()[0];
        if (first) {
          this.setSelection([first]);
        } else {
          this.resetSelection();
        }
      }
    },

    /**
     * Detects the position of the given widget in the
     * children list of this widget.
     *
     * @param widget {qx.ui.core.Widget} Any child.
     * @return {Integer} The position.
     */
    indexOf : function(widget) {
      return this._indexOf(widget);
    },

    /**
     * Returns all children.
     *
     * @return {qx.ui.core.Widget[]} List of all children.
     */
    getChildren : function() {
      return this._getChildren();
    },

    /**
     * Go to the previous child in the children list.
     */
    previous : function()
    {
      var selected = this.getSelection()[0];
      var go = this._indexOf(selected)-1;
      var children = this._getChildren();

      if (go < 0) {
        go = children.length - 1;
      }

      var prev = children[go];
      this.setSelection([prev]);
    },

    /**
     * Go to the next child in the children list.
     */
    next : function()
    {
      var selected = this.getSelection()[0];
      var go = this._indexOf(selected)+1;
      var children = this._getChildren();

      var next = children[go] || children[0];

      this.setSelection([next]);
    }
  }
});
