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




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param widget {qx.ui.core.Widget} The widget to connect the focus handler to.
   */
  construct : function(widget)
  {
    if (!widget) {
      throw new Error("Widget to connect with is missing!");
    }

    // Call superclass
    this.base(arguments);

    // Store relations
    this._attachedWidget = widget;

    // Register events
    widget.addListener("keypress", this._onkeyevent, this);
    widget.addListener("focusin", this._onfocusin, this, true);
    widget.addListener("focusout", this._onfocusout, this, true);
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
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Internal event handler for focusin event.
     *
     * @type member
     * @param e {qx.event.type.Focus} Focus event
     * @return {void}
     */
    _onfocusin : function(e)
    {
      var target = e.getTarget();
      if (target.getFocusRoot() === this._attachedWidget) {
        this._focusedChild = target;
      }
    },


    /**
     * Internal event handler for focusout event.
     *
     * @type member
     * @param e {qx.event.type.Focus} Focus event
     * @return {void}
     */
    _onfocusout : function(e) {
      this._focusedChild = null;
    },


    /**
     * Internal event handler for TAB key.
     *
     * @type member
     * @param e {qx.event.type.KeySequence} Key event
     * @return {void}
     */
    _onkeyevent : function(e)
    {
      return;
      
      if (e.getKeyIdentifier() != "Tab") {
        return;
      }

      // Stop all key-events with a TAB keycode
      e.stopPropagation();
      e.preventDefault();

      // Support shift key to reverse widget detection order
      var current = this._focusedChild;
      if (!e.isShiftPressed()) {
        var next = current ? this.__getWidgetAfter(current) : this.__getFirstWidget();
      } else {
        var next = current ? this.__getWidgetBefore(current) : this.__getLastWidget();
      }

      // If there was a widget found, focus it
      if (next) {
        next.focus();
      }
    },


    /**
     * Compares the order of two widgets
     *
     * @type member
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




    /*
    ---------------------------------------------------------------------------
      API USED BY KEY EVENT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the first widget of the given
     *
     * @type member
     * @return {var} TODOC
     */
    __getFirstWidget : function() {
      return this.__getFirst(this._attachedWidget, null);
    },


    /**
     * Returns the first widget
     *
     * @type member
     * @return {var} TODOC
     */
    __getLastWidget : function() {
      return this.__getLast(this._attachedWidget, null);
    },


    /**
     * Returns the widget after the given one.
     *
     * @type member
     * @param widget {qx.ui.core.Widget} Widget to start with
     * @return {qx.ui.core.Widget} The found widget.
     */
    __getWidgetAfter : function(widget)
    {
      var root = this._attachedWidget;
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
     * @type member
     * @param widget {qx.ui.core.Widget} Widget to start with
     * @return {qx.ui.core.Widget} The found widget.
     */
    __getWidgetBefore : function(widget)
    {
      var root = this._attachedWidget;
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
     * @type member
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

        if (!child.isFocusRoot() && child.isEnabled())
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
     * @type member
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

        if (!child.isFocusRoot() && child.isEnabled())
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
     * @type member
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
        if (!child.isFocusRoot() && child.isEnabled())
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
     * @type member
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
        if (!child.isFocusRoot() && child.isEnabled())
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

  destruct : function() {
    this._disposeFields("_attachedWidget", "_focusedChild");
  }
});
