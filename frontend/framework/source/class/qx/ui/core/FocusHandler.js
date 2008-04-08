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

  construct : function(widget)
  {
    if (!widget) {
      throw new Error("Widget to connect with is missing!");
    }

    // Call superclass
    this.base(arguments);

    // Store relations
    this._attachedWidget = widget;
    this._domFocusHandler = qx.event.Registration.getManager(widget.getDom).getHandler(qx.event.handler.Focus);

    // Register events
    widget.addListener("keypress", this._onkeyevent, this);
    widget.addListener("focusin", this._onfocusin, this, true);
    widget.addListener("focusout", this._onfocusin, this, true);
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
     * @param ev {qx.event.type.Focus}
     * @return {void}
     */
    _onfocusin : function(e) {
      this._focusedChild = e.getTarget();
    },


    /**
     * Internal event handler for focusout event.
     *
     * @type member
     * @param ev {qx.event.type.Focus}
     * @return {void}
     */
    _onfocusout : function(e) {
      this._focusedChild = null;
    },


    /**
     * Internal event handler for TAB key.
     *
     * @type member
     * @param ev {qx.event.type.KeySequence}
     * @return {void}
     */
    _onkeyevent : function(ev)
    {
      if (ev.getKeyIdentifier() != "Tab") {
        return;
      }

      // Stop all key-events with a TAB keycode
      ev.stopPropagation();
      ev.preventDefault();

      // Working variables
      var container = this._attachedWidget;
      var current = this._focusedChild;

      // Support shift key to reverse widget detection order
      if (!ev.isShiftPressed()) {
        var next = current ? this.__getWidgetAfter(container, current) : this.__getFirstWidget(container);
      } else {
        var next = current ? this.__getWidgetBefore(container, current) : this.__getLastWidget(container);
      }

      // If there was a widget found, focus it
      if (next) {
        next.focus();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param c1 {var} TODOC
     * @param c2 {var} TODOC
     * @return {int | var} TODOC
     */
    __compareTabOrder : function(c1, c2)
    {
      // Sort-Check #1: Tab-Index
      if (c1 == c2) {
        return 0;
      }

      var tab1 = c1.getTabIndex() || 0;
      var tab2 = c2.getTabIndex() || 0;

      // The following are some ideas to handle focus after tabindex.
      if (tab1 != tab2) {
        return tab1 - tab2;
      }

      // Computing location
      var el1 = c1.getContainerElement().getDomElement();
      var el2 = c2.getContainerElement().getDomElement();

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
      var z1 = c1.getZIndex();
      var z2 = c2.getZIndex();

      if (z1 != z2) {
        return z1 - z2;
      }

      return 0;
    },




    /*
    ---------------------------------------------------------------------------
      INTERNAL APIS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param parentContainer {var} TODOC
     * @return {var} TODOC
     */
    __getFirstWidget : function(parentContainer) {
      return this.__getFirst(parentContainer, null);
    },


    /**
     * TODOC
     *
     * @type member
     * @param parentContainer {var} TODOC
     * @return {var} TODOC
     */
    __getLastWidget : function(parentContainer) {
      return this.__getLast(parentContainer, null);
    },


    /**
     * TODOC
     *
     * @type member
     * @param parentContainer {var} TODOC
     * @param widget {var} TODOC
     * @return {var | Array} TODOC
     */
    __getWidgetAfter : function(parentContainer, widget)
    {
      if (parentContainer == widget) {
        return this.__getFirstWidget(parentContainer);
      }

      while (widget && widget.getAnonymous()) {
        widget = widget.getLayoutParent();
      }

      if (widget == null) {
        return [];
      }

      var vAll = [];
      this.__collectAllAfter(parentContainer, widget, vAll);
      vAll.sort(this.__compareTabOrder);

      var len = vAll.length;
      return len > 0 ? vAll[0] : this.__getFirstWidget(parentContainer);
    },


    /**
     * TODOC
     *
     * @type member
     * @param parentContainer {var} TODOC
     * @param widget {var} TODOC
     * @return {var | Array} TODOC
     */
    __getWidgetBefore : function(parentContainer, widget)
    {
      if (parentContainer == widget) {
        return this.__getLastWidget(parentContainer);
      }

      while (widget && widget.getAnonymous()) {
        widget = widget.getLayoutParent();
      }

      if (widget == null) {
        return [];
      }

      var vAll = [];
      this.__collectAllBefore(parentContainer, widget, vAll);
      vAll.sort(this.__compareTabOrder);

      var len = vAll.length;
      return len > 0 ? vAll[len - 1] : this.__getLastWidget(parentContainer);
    },


    /**
     * TODOC
     *
     * @type member
     * @param parent {var} TODOC
     * @param widget {var} TODOC
     * @param result {var} TODOC
     * @return {void}
     */
    __collectAllAfter : function(parent, widget, result)
    {
      var children = parent.getLayoutChildren();
      var child;
      var len = children.length;

      for (var i=0; i<len; i++)
      {
        child = children[i];

        if (child.isFocusable() && this.__compareTabOrder(widget, child) < 0) {
          result.push(child);
        }

        if (!child.isFocusRoot()) {
          this.__collectAllAfter(child, widget, result);
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param parent {var} TODOC
     * @param widget {var} TODOC
     * @param result {var} TODOC
     * @return {void}
     */
    __collectAllBefore : function(parent, widget, result)
    {
      var children = parent.getLayoutChildren();
      var child;
      var len = children.length;

      for (var i=0; i<len; i++)
      {
        child = children[i];

        if (!child.isFocusRoot())
        {
          if (child.isFocusable() && this.__compareTabOrder(widget, child) > 0) {
            result.push(child);
          }

          this.__collectAllBefore(child, widget, result);
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param parent {var} TODOC
     * @param firstWidget {var} TODOC
     * @return {var} TODOC
     */
    __getFirst : function(parent, firstWidget)
    {
      var children = parent.getLayoutChildren();
      var child;
      var len = children.length;

      for (var i=0; i<len; i++)
      {
        child = children[i];

        if (child.isFocusable())
        {
          if (firstWidget == null || this.__compareTabOrder(child, firstWidget) < 0) {
            firstWidget = child;
          }
        }

        if (!child.isFocusRoot()) {
          firstWidget = this.__getFirst(child, firstWidget);
        }
      }

      return firstWidget;
    },


    /**
     * TODOC
     *
     * @type member
     * @param parent {var} TODOC
     * @param lastWidget {var} TODOC
     * @return {var} TODOC
     */
    __getLast : function(parent, lastWidget)
    {
      var children = parent.getLayoutChildren();
      var child;
      var len = children.length;

      for (var i=0; i<len; i++)
      {
        child = children[i];

        if (child.isFocusable())
        {
          if (lastWidget == null || this.__compareTabOrder(child, lastWidget) > 0) {
            lastWidget = child;
          }
        }

        if (!child.isFocusRoot()) {
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
