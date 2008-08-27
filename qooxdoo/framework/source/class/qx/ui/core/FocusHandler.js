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
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * Each focus root delegates the focus handling to instances of the FocusHandler.
 */
qx.Class.define("qx.ui.core.FocusHandler",
{
  extend : qx.core.Object,
  type : "singleton",




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Create data structure
    this.__roots = {};
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __roots : null,
    __activeChild : null,
    __focusedChild : null,
    __currentRoot : null,


    /**
     * Connects to a top-level root element (which initially receives
     * all events of the root). This are normally all page and application
     * roots, but no inline roots (they are typically sitting inside
     * another root).
     *
     * @param root {qx.ui.root.Abstract} Any root
     */
    connectTo : function(root)
    {
      // this.debug("Connect to: " + root);
      root.addListener("keypress", this.__onKeyPress, this);
      root.addListener("focusin", this._onFocusIn, this, true);
      root.addListener("focusout", this._onFocusOut, this, true);
      root.addListener("activate", this._onActivate, this, true);
      root.addListener("deactivate", this._onDeactivate, this, true);
    },

    /**
     * Registers a widget as a focus root. A focus root comes
     * with an separate tab sequence handling.
     *
     * @param widget {qx.ui.core.Widget} The widget to register
     */
    addRoot : function(widget)
    {
      // this.debug("Add focusRoot: " + widget);
      this.__roots[widget.$$hash] = widget;
    },


    /**
     * Deregisters a previous added widget.
     *
     * @param widget {qx.ui.core.Widget} The widget to deregister
     */
    removeRoot : function(widget)
    {
      // this.debug("Remove focusRoot: " + widget);
      delete this.__roots[widget.$$hash];
    },


    /**
     * Whether the given widget is the active one
     *
     * @param widget {qx.ui.core.Widget} The widget to check
     */
    isActive : function(widget) {
      return this.__activeChild == widget;
    },


    /**
     * Whether the given widget is the focused one.
     *
     * @param widget {qx.ui.core.Widget} The widget to check
     */
    isFocused : function(widget) {
      return this.__focusedChild == widget;
    },


    /**
     * Whether the given widgets acts as a focus root.
     *
     * @param widget {qx.ui.core.Widget} The widget to check
     */
    isFocusRoot : function(widget) {
      !!this.__roots[widget.$$hash];
    },





    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Internal event handler for activate event.
     *
     * @param e {qx.event.type.Focus} Focus event
     * @return {void}
     */
    _onActivate : function(e)
    {
      var target = e.getTarget();
      this.__activeChild = target;
      //this.debug("active: " + target);

      var root = this.__findFocusRoot(target);
      if (root != this.__currentRoot) {
        this.__currentRoot = root;
      }
    },


    /**
     * Internal event handler for deactivate event.
     *
     * @param e {qx.event.type.Focus} Focus event
     * @return {void}
     */
    _onDeactivate : function(e)
    {
      var target = e.getTarget();
      if (this.__activeChild == target) {
        this.__activeChild = null;
      }
    },


    /**
     * Internal event handler for focusin event.
     *
     * @param e {qx.event.type.Focus} Focus event
     * @return {void}
     */
    _onFocusIn : function(e)
    {
      var target = e.getTarget();
      if (target != this.__focusedChild)
      {
        this.__focusedChild = target;
        target.visualizeFocus();
      }
    },


    /**
     * Internal event handler for focusout event.
     *
     * @param e {qx.event.type.Focus} Focus event
     * @return {void}
     */
    _onFocusOut : function(e)
    {
      var target = e.getTarget();
      if (target == this.__focusedChild)
      {
        this.__focusedChild = null;
        target.visualizeBlur();
      }
    },


    /**
     * Internal event handler for TAB key.
     *
     * @param e {qx.event.type.KeySequence} Key event
     * @return {void}
     */
    __onKeyPress : function(e)
    {
      if (e.getKeyIdentifier() != "Tab") {
        return;
      }

      if (!this.__currentRoot) {
        return;
      }

      // Stop all key-events with a TAB keycode
      e.stopPropagation();
      e.preventDefault();

      // Support shift key to reverse widget detection order
      var current = this.__focusedChild;
      if (!e.isShiftPressed()) {
        var next = current ? this.__getWidgetAfter(current) : this.__getFirstWidget();
      } else {
        var next = current ? this.__getWidgetBefore(current) : this.__getLastWidget();
      }

      // If there was a widget found, focus it
      if (next) {
        next.tabFocus();
      }
    },




    /*
    ---------------------------------------------------------------------------
      UTILS
    ---------------------------------------------------------------------------
    */

    /**
     * Finds the next focus root, starting with the given widget.
     *
     * @param widget {qx.ui.core.Widget} The widget to find a focus root for.
     */
    __findFocusRoot : function(widget)
    {
      var roots = this.__roots;
      while (widget)
      {
        if (roots[widget.$$hash]) {
          return widget;
        }

        widget = widget.getLayoutParent();
      }

      return null;
    },





    /*
    ---------------------------------------------------------------------------
      TAB SUPPORT IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    /**
     * Compares the order of two widgets
     *
     * @param widget1 {qx.ui.core.Widget} Widget A
     * @param widget2 {qx.ui.core.Widget} Widget B
     * @return {Integer} A sort() compatible integer with values
     *   small than 0, exactly 0 or bigger than 0.
     */
    __compareTabOrder : function(widget1, widget2)
    {
      if (widget1 === widget2) {
        return 0;
      }

      // Sort-Check #1: Tab-Index
      var tab1 = widget1.getTabIndex() || 0;
      var tab2 = widget2.getTabIndex() || 0;

      if (tab1 != tab2) {
        return tab1 - tab2;
      }

      // Computing location
      var el1 = widget1.getContainerElement().getDomElement();
      var el2 = widget2.getContainerElement().getDomElement();

      var Location = qx.bom.element.Location;

      var loc1 = Location.get(el1);
      var loc2 = Location.get(el2);

      // Sort-Check #2: Top-Position
      if (loc1.top != loc2.top) {
        return loc1.top - loc2.top;
      }

      // Sort-Check #3: Left-Position
      if (loc1.left != loc2.left) {
        return loc1.left - loc2.left;
      }

      // Sort-Check #4: zIndex
      var z1 = widget1.getZIndex();
      var z2 = widget2.getZIndex();

      if (z1 != z2) {
        return z1 - z2;
      }

      return 0;
    },


    /**
     * Returns the first widget of the given
     *
     * @return {var} TODOC
     */
    __getFirstWidget : function() {
      return this.__getFirst(this.__currentRoot, null);
    },


    /**
     * Returns the first widget
     *
     * @return {var} TODOC
     */
    __getLastWidget : function() {
      return this.__getLast(this.__currentRoot, null);
    },


    /**
     * Returns the widget after the given one.
     *
     * @param widget {qx.ui.core.Widget} Widget to start with
     * @return {qx.ui.core.Widget} The found widget.
     */
    __getWidgetAfter : function(widget)
    {
      var root = this.__currentRoot;
      if (root == widget) {
        return this.__getFirstWidget();
      }

      while (widget && widget.getAnonymous()) {
        widget = widget.getLayoutParent();
      }

      if (widget == null) {
        return [];
      }

      var result = [];
      this.__collectAllAfter(root, widget, result);
      result.sort(this.__compareTabOrder);

      var len = result.length;
      return len > 0 ? result[0] : this.__getFirstWidget();
    },


    /**
     * Returns the widget before the given one.
     *
     * @param widget {qx.ui.core.Widget} Widget to start with
     * @return {qx.ui.core.Widget} The found widget.
     */
    __getWidgetBefore : function(widget)
    {
      var root = this.__currentRoot;
      if (root == widget) {
        return this.__getLastWidget();
      }

      while (widget && widget.getAnonymous()) {
        widget = widget.getLayoutParent();
      }

      if (widget == null) {
        return [];
      }

      var result = [];
      this.__collectAllBefore(root, widget, result);
      result.sort(this.__compareTabOrder);

      var len = result.length;
      return len > 0 ? result[len - 1] : this.__getLastWidget();
    },






    /*
    ---------------------------------------------------------------------------
      INTERNAL API USED BY METHODS ABOVE
    ---------------------------------------------------------------------------
    */

    /**
     * Collects all widgets which are after the given widget in
     * the given parent widget. Append all found children to the
     * <code>list</code>.
     *
     * @param parent {qx.ui.core.Widget} Parent widget
     * @param widget {qx.ui.core.Widget} Child widget to start with
     * @param result {Array} Result list
     * @return {void}
     */
    __collectAllAfter : function(parent, widget, result)
    {
      var children = parent.getLayoutChildren();
      var child;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        // Filter spacers etc.
        if (!(child instanceof qx.ui.core.Widget)) {
          continue;
        }

        if (!this.isFocusRoot(child) && child.isEnabled())
        {
          if (child.isTabable() && this.__compareTabOrder(widget, child) < 0) {
            result.push(child);
          }

          this.__collectAllAfter(child, widget, result);
        }
      }
    },


    /**
     * Collects all widgets which are before the given widget in
     * the given parent widget. Append all found children to the
     * <code>list</code>.
     *
     * @param parent {qx.ui.core.Widget} Parent widget
     * @param widget {qx.ui.core.Widget} Child widget to start with
     * @param result {Array} Result list
     * @return {void}
     */
    __collectAllBefore : function(parent, widget, result)
    {
      var children = parent.getLayoutChildren();
      var child;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        // Filter spacers etc.
        if (!(child instanceof qx.ui.core.Widget)) {
          continue;
        }

        if (!this.isFocusRoot(child) && child.isEnabled())
        {
          if (child.isTabable() && this.__compareTabOrder(widget, child) > 0) {
            result.push(child);
          }

          this.__collectAllBefore(child, widget, result);
        }
      }
    },


    /**
     * Find first (positioned) widget. (Sorted by coordinates, zIndex, etc.)
     *
     * @param parent {qx.ui.core.Widget} Parent widget
     * @param firstWidget {qx.ui.core.Widget?null} Current first widget
     * @return {qx.ui.core.Widget} The first (positioned) widget
     */
    __getFirst : function(parent, firstWidget)
    {
      var children = parent.getLayoutChildren();
      var child;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        // Filter spacers etc.
        if (!(child instanceof qx.ui.core.Widget)) {
          continue;
        }

        // Ignore focus roots completely
        if (!this.isFocusRoot(child) && child.isEnabled())
        {
          if (child.isTabable())
          {
            if (firstWidget == null || this.__compareTabOrder(child, firstWidget) < 0) {
              firstWidget = child;
            }
          }

          // Deep iteration into children hierarchy
          firstWidget = this.__getFirst(child, firstWidget);
        }
      }

      return firstWidget;
    },


    /**
     * Find last (positioned) widget. (Sorted by coordinates, zIndex, etc.)
     *
     * @param parent {qx.ui.core.Widget} Parent widget
     * @param lastWidget {qx.ui.core.Widget?null} Current last widget
     * @return {qx.ui.core.Widget} The last (positioned) widget
     */
    __getLast : function(parent, lastWidget)
    {
      var children = parent.getLayoutChildren();
      var child;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        // Filter spacers etc.
        if (!(child instanceof qx.ui.core.Widget)) {
          continue;
        }

        // Ignore focus roots completely
        if (!this.isFocusRoot(child) && child.isEnabled())
        {
          if (child.isTabable())
          {
            if (lastWidget == null || this.__compareTabOrder(child, lastWidget) > 0) {
              lastWidget = child;
            }
          }

          // Deep iteration into children hierarchy
          lastWidget = this.__getLast(child, lastWidget);
        }
      }

      return lastWidget;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeMap("__roots");
    this._disposeFields("__focusedChild",
      "__activeChild", "__currentRoot");
  }
});
