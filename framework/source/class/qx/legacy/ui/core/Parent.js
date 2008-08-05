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

/* ************************************************************************

#optional(qx.legacy.event.handler.FocusHandler)
#optional(qx.legacy.ui.popup.ToolTipManager)
#optional(qx.legacy.ui.popup.PopupManager)

************************************************************************ */

/**
 * Abstract base class for all widget which have child widgets (e.g. layout manager)
 *
 * Don't instantiate this class directly.
 */
qx.Class.define("qx.legacy.ui.core.Parent",
{
  extend : qx.legacy.ui.core.Widget,
  type : "abstract",




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Contains all children
    this._children = [];

    // Create instanceof layout implementation
    this._layoutImpl = this._createLayoutImpl();
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Individual focus handler for all child elements. */
    focusHandler :
    {
      check : "qx.legacy.event.handler.FocusHandler",
      apply : "_applyFocusHandler",
      nullable : true
    },

    /** The current active child. */
    activeChild :
    {
      check : "qx.legacy.ui.core.Widget",
      apply : "_applyActiveChild",
      event : "changeActiveChild",
      nullable : true
    },

    /** The current focused child. */
    focusedChild :
    {
      check : "qx.legacy.ui.core.Widget",
      apply : "_applyFocusedChild",
      event : "changeFocusedChild",
      nullable : true
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
      FOCUS HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Wether the widget has its own focus handler or uses one of its parent's
     * focus handler.
     *
     * @return {Boolean} whether the widget has its own focus handler
     */
    isFocusRoot : function() {
      return this.getFocusHandler() != null;
    },


    /**
     * Return the responsible focus handler
     *
     * @return {qx.legacy.event.handler.FocusHandler} TODOC
     */
    getFocusRoot : function()
    {
      if (this.isFocusRoot()) {
        return this;
      }

      if (this._hasParent) {
        return this.getParent().getFocusRoot();
      }

      return null;
    },


    /**
     * Let the widget use its own focus handler
     *
     * @return {void}
     */
    activateFocusRoot : function()
    {
      if (this._focusHandler) {
        return;
      }

      this._focusHandler = new qx.legacy.event.handler.FocusHandler(this);
      this.setFocusHandler(this._focusHandler);
    },


    /**
     * Delegate keyevent to the focus handler
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onfocuskeyevent : function(e) {
      this.getFocusHandler()._onkeyevent(this, e);
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyFocusHandler : function(value, old)
    {
      if (value)
      {
        // Add Key Handler
        this.addListener("keypress", this._onfocuskeyevent);

        // Activate focus handling (but keep already configured tabIndex)
        if (this.getTabIndex() < 1) {
          this.setTabIndex(1);
        }

        // But hide the focus outline
        this.setHideFocus(true);

        // Make myself the default
        this.setActiveChild(this);
      }
      else
      {
        // Remove Key Handler
        this.removeListener("keydown", this._onfocuskeyevent);
        this.removeListener("keypress", this._onfocuskeyevent);

        // Deactivate focus handling
        this.setTabIndex(-1);

        // Don't hide focus outline
        this.setHideFocus(false);
      }
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyActiveChild : function(value, old) {
      // this.debug("ActiveChild: " + value);
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyFocusedChild : function(value, old)
    {
      // this.debug("FocusedChild: " + value);
      var vFocusValid = value != null;
      var vBlurValid = old != null;

      if (qx.Class.isDefined("qx.legacy.ui.popup.PopupManager") && vFocusValid)
      {
        var vMgr = qx.legacy.ui.popup.PopupManager.getInstance();

        if (vMgr) {
          vMgr.update(value);
        }
      }

      if (vBlurValid)
      {
        // Dispatch FocusOut
        var vEventObject = qx.event.Registration.createEvent("focusout", qx.legacy.event.type.FocusEvent);
        vEventObject.setBubbles(true);

        if (vFocusValid) {
          vEventObject.setRelatedTarget(value);
        }

        old.dispatchEvent(vEventObject);
      }


      if (vFocusValid)
      {
        // Dispatch FocusIn
        var vEventObject = qx.event.Registration.createEvent("focusin", qx.legacy.event.type.FocusEvent);
        vEventObject.setBubbles(true);

        if (vBlurValid) {
          vEventObject.setRelatedTarget(old);
        }

        value.dispatchEvent(vEventObject);
      }

      if (vBlurValid)
      {
        if (this.getActiveChild() == old && !vFocusValid) {
          this.setActiveChild(null);
        }

        old.setFocused(false);

        // Dispatch Blur
        var vEventObject = qx.event.Registration.createEvent("blur", qx.legacy.event.type.FocusEvent);

        if (vFocusValid) {
          vEventObject.setRelatedTarget(value);
        }

        old.dispatchEvent(vEventObject);

        if (qx.Class.isDefined("qx.legacy.ui.popup.ToolTipManager"))
        {
          var vMgr = qx.legacy.ui.popup.ToolTipManager.getInstance();

          if (vMgr) {
            vMgr.handleBlur(vEventObject);
          }
        }
      }

      if (vFocusValid)
      {
        this.setActiveChild(value);
        value.setFocused(true);
        qx.legacy.event.handler.EventHandler.getInstance().setFocusRoot(this);

        // Dispatch Focus
        var vEventObject = qx.event.Registration.createEvent("focus", qx.legacy.event.type.FocusEvent);

        if (vBlurValid) {
          vEventObject.setRelatedTarget(old);
        }

        var eventClone = vEventObject.clone();
        value.dispatchEvent(vEventObject);

        if (qx.Class.isDefined("qx.legacy.ui.popup.ToolTipManager"))
        {
          var vMgr = qx.legacy.ui.popup.ToolTipManager.getInstance();

          if (vMgr) {
            eventClone.setTarget(value);
            vMgr.handleFocus(eventClone);
          }
        }

        eventClone.dispose();
      }
    },




    /*
    ---------------------------------------------------------------------------
      LAYOUT IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    _layoutImpl : null,


    /**
     * abstract method. Create layout implementation.
     *
     * This method must be overwritten by all subclasses
     *
     * return
     *
     * @return {qx.legacy.ui.layout.BoxLayout} TODOC
     */
    _createLayoutImpl : function() {
      return null;
    },


    /**
     * Return the layout implementation.
     *
     * return {qx.legacy.ui.layout.impl.LayoutImpl}
     *
     * @return {var} TODOC
     */
    getLayoutImpl : function() {
      return this._layoutImpl;
    },




    /*
    ---------------------------------------------------------------------------
      CHILDREN MANAGMENT: MANAGE ALL
    ---------------------------------------------------------------------------
    */

    /**
     * Return the array of all children
     *
     * @return {qx.legacy.ui.core.Widget[]} all children
     */
    getChildren : function() {
      return this._children;
    },


    /**
     * Get number of children
     *
     * @return {Integer} number of children
     */
    getChildrenLength : function() {
      return this.getChildren().length;
    },


    /**
     * Check if the widget has children
     *
     * @return {Boolean} whether the widget has children
     */
    hasChildren : function() {
      return this.getChildrenLength() > 0;
    },


    /**
     * Check if there are any children inside
     *
     * @return {Boolean} whether the number of children is 0
     */
    isEmpty : function() {
      return this.getChildrenLength() == 0;
    },


    /**
     * Get the index of a child widget.
     *
     * @param vChild {qx.legacy.ui.core.Widget} Child widget to get the index for
     * @return {Integer} index of the child widget
     */
    indexOf : function(vChild) {
      return this.getChildren().indexOf(vChild);
    },


    /**
     * Check if the given widget is a child
     *
     * @param vWidget {qx.legacy.ui.core.Widget} The widget which should be checked.
     * @return {Boolean | var} TODOC
     */
    contains : function(vWidget)
    {
      switch(vWidget)
      {
        case null:
          return false;

        case this:
          return true;

        default:
          // try the next parent of the widget (recursive until found)
          return this.contains(vWidget.getParent());
      }
    },




    /*
    ---------------------------------------------------------------------------
      CHILDREN MANAGMENT: MANAGE VISIBLE ONES

      uses a cached private property
    ---------------------------------------------------------------------------
    */

    /**
     * Return the array of all visible children
     * (which are configured as visible=true)
     *
     * @return {qx.legacy.ui.core.Widget[]} all visible children
     */
    _computeVisibleChildren : function()
    {
      var vVisible = [];
      var vChildren = this.getChildren();

      if (! vChildren)
      {
        return 0;
      }

      var vLength = vChildren.length;

      for (var i=0; i<vLength; i++)
      {
        var vChild = vChildren[i];

        if (vChild._isDisplayable) {
          vVisible.push(vChild);
        }
      }

      return vVisible;
    },


    /**
     * Get number of visible children
     *
     * @return {Integer} number of visible children
     */
    getVisibleChildrenLength : function() {
      return this.getVisibleChildren().length;
    },


    /**
     * Check if the widget has any visible children
     *
     * @return {Boolean} whether the widget has any visible children
     */
    hasVisibleChildren : function() {
      return this.getVisibleChildrenLength() > 0;
    },


    /**
     * Check whether there are any visible children inside
     *
     * @return {Boolean} whether there are any visible children inside
     */
    isVisibleEmpty : function() {
      return this.getVisibleChildrenLength() == 0;
    },




    /*
    ---------------------------------------------------------------------------
      CHILDREN MANAGMENT: ADD
    ---------------------------------------------------------------------------
    */

    /**
     * Add/Append another widget. Allows to add multiple at
     *  one, a parameter could be a widget.
     *
     * @param varargs {qx.legacy.ui.core.Widget} variable number of widgets to add
     * @return {Parent} This widget.
     * @throws TODOC
     */
    add : function(varargs)
    {
      var vWidget;

      for (var i=0, l=arguments.length; i<l; i++)
      {
        vWidget = arguments[i];

        if (!(vWidget instanceof qx.legacy.ui.core.Parent) && !(vWidget instanceof qx.legacy.ui.basic.Terminator)) {
          throw new Error("Invalid Widget: " + vWidget);
        } else {
          vWidget.setParent(this);
        }
      }

      return this;
    },


    /**
     * Add a child widget at the specified index
     *
     * @param vChild {widget} widget to add
     * @param vIndex {Integer} Index, at which the widget will be inserted
     */
    addAt : function(vChild, vIndex)
    {
      if (vIndex == null || vIndex < 0) {
        throw new Error("Not a valid index for addAt(): " + vIndex);
      }

      if (vChild.getParent() == this)
      {
        var vChildren = this.getChildren();
        var vOldIndex = vChildren.indexOf(vChild);

        if (vOldIndex != vIndex)
        {
          if (vOldIndex != -1) {
            qx.lang.Array.removeAt(vChildren, vOldIndex);
          }

          qx.lang.Array.insertAt(vChildren, vChild, vIndex);

          if (this._initialLayoutDone)
          {
            this._invalidateVisibleChildren();
            this.getLayoutImpl().updateChildrenOnMoveChild(vChild, vIndex, vOldIndex);
          }
        }
      }
      else
      {
        vChild._insertIndex = vIndex;
        vChild.setParent(this);
      }
    },


    /**
     * Add a child widget as the first widget
     *
     * @param vChild {widget} widget to add
     */
    addAtBegin : function(vChild) {
      return this.addAt(vChild, 0);
    },


    /**
     * Add a child widget as the last widget
     *
     * @param vChild {widget} widget to add
     */
    addAtEnd : function(vChild)
    {
      // we need to fix here, when the child is already inside myself, but
      // want to change its position
      var vLength = this.getChildrenLength();
      return this.addAt(vChild, vChild.getParent() == this ? vLength - 1 : vLength);
    },


    /**
     * Add a widget before another already inserted widget
     *
     * @param vChild {var} widget to add
     * @param vBefore {var} widget before the new widget will be inserted.
     */
    addBefore : function(vChild, vBefore)
    {
      var vChildren = this.getChildren();
      var vTargetIndex = vChildren.indexOf(vBefore);

      if (vTargetIndex == -1) {
        throw new Error("Child to add before: " + vBefore + " is not inside this parent.");
      }

      var vSourceIndex = vChildren.indexOf(vChild);

      if (vSourceIndex == -1 || vSourceIndex > vTargetIndex) {
        vTargetIndex++;
      }

      return this.addAt(vChild, Math.max(0, vTargetIndex - 1));
    },


    /**
     * Add a widget after another already inserted widget
     *
     * @param vChild {var} widget to add
     * @param vAfter {var} widgert, after which the new widget will be inserted
     */
    addAfter : function(vChild, vAfter)
    {
      var vChildren = this.getChildren();
      var vTargetIndex = vChildren.indexOf(vAfter);

      if (vTargetIndex == -1) {
        throw new Error("Child to add after: " + vAfter + " is not inside this parent.");
      }

      var vSourceIndex = vChildren.indexOf(vChild);

      if (vSourceIndex != -1 && vSourceIndex < vTargetIndex) {
        vTargetIndex--;
      }

      return this.addAt(vChild, Math.min(vChildren.length, vTargetIndex + 1));
    },




    /*
    ---------------------------------------------------------------------------
      CHILDREN MANAGMENT: REMOVE
    ---------------------------------------------------------------------------
    */

    /**
     * Remove one or multiple childrens.
     *
     * @param varargs {qx.legacy.ui.core.Widget} variable number of widgets to remove
     */
    remove : function(varargs)
    {
      var vWidget;

      for (var i=0, l=arguments.length; i<l; i++)
      {
        vWidget = arguments[i];

        if (!(vWidget instanceof qx.legacy.ui.core.Parent) && !(vWidget instanceof qx.legacy.ui.basic.Terminator)) {
          throw new Error("Invalid Widget: " + vWidget);
        } else if (vWidget.getParent() == this) {
          vWidget.setParent(null);
        }
      }
    },


    /**
     * Remove the widget at the specified index.
     *
     * @param vIndex {Integer} Index of the widget to remove.
     */
    removeAt : function(vIndex)
    {
      var vChild = this.getChildren()[vIndex];

      if (vChild)
      {
        delete vChild._insertIndex;

        vChild.setParent(null);
      }
    },


    /**
     * Remove all children.
     *
     */
    removeAll : function()
    {
      var cs = this.getChildren();
      var co = cs[0];

      while (co)
      {
        this.remove(co);
        co = cs[0];
      }
    },




    /*
    ---------------------------------------------------------------------------
      CHILDREN MANAGMENT: FIRST CHILD
    ---------------------------------------------------------------------------
    */

    /**
     * Get the first child
     *
     * @return {Widget|null} First child widget (null if this widget does not have any children)
     */
    getFirstChild : function() {
      return qx.lang.Array.getFirst(this.getChildren()) || null;
    },


    /**
     * Get the first visible child
     *
     * @return {Widget|null} First visible child widget (null if this widget does
     *     not have any visible children)
     */
    getFirstVisibleChild : function() {
      return qx.lang.Array.getFirst(this.getVisibleChildren()) || null;
    },


    /**
     * Get the first active child
     *
     * @param vIgnoreClasses {Class[]} array of classes which should be ignored
     * @return {Widget|null} First active child widget (null if this widget does
     *     not have any active children)
     */
    getFirstActiveChild : function(vIgnoreClasses) {
      return qx.legacy.ui.core.Widget.getActiveSiblingHelper(null, this, 1, vIgnoreClasses, "first") || null;
    },




    /*
    ---------------------------------------------------------------------------
      CHILDREN MANAGMENT: LAST CHILD
    ---------------------------------------------------------------------------
    */

    /**
     * Get the last child
     *
     * @return {Widget|null} Last child widget (null if this widget does
     *     not have any children)
     */
    getLastChild : function() {
      return qx.lang.Array.getLast(this.getChildren()) || null;
    },


    /**
     * Get the last visible child
     *
     * @return {Widget|null} Last visible child widget (null if this widget does
     *     not have any visible children)
     */
    getLastVisibleChild : function() {
      return qx.lang.Array.getLast(this.getVisibleChildren()) || null;
    },


    /**
     * Get the last active child
     *
     * @param vIgnoreClasses {Class[]} array of classes which should be ignored
     * @return {Widget|null} Last active child widget (null if this widget does
     *     not have any active children)
     */
    getLastActiveChild : function(vIgnoreClasses) {
      return qx.legacy.ui.core.Widget.getActiveSiblingHelper(null, this, -1, vIgnoreClasses, "last") || null;
    },




    /*
    ---------------------------------------------------------------------------
      CHILDREN MANAGMENT: LOOP UTILS
    ---------------------------------------------------------------------------
    */

    /**
     * Call a callbach function for each child widget. The callback has the following signature:
     * <code>function(childWidget, widgetIndex)</code>. The first parameter is the child widget
     * and the second the index of the child widget in its parent.
     *
     * @param vFunc {Function} callback function. Signature: <code>function(childWidget, widgetIndex)</code>
     */
    forEachChild : function(vFunc)
    {
      var ch = this.getChildren(), chc, i = -1;

      if (! ch) {
        return;
      }

      while (chc = ch[++i]) {
        vFunc.call(chc, i);
      }
    },


    /**
     * Call a callbach function for each visible child widget. The callback has the following signature:
     * <code>function(childWidget, widgetIndex)</code>. The first parameter is the child widget
     * and the second the index of the child widget in its parent.
     *
     * @param vFunc {Function} callback function. Signature: <code>function(childWidget, widgetIndex)</code>
     */
    forEachVisibleChild : function(vFunc)
    {
      var ch = this.getVisibleChildren(), chc, i = -1;

      if (! ch) {
        return;
      }

      while (chc = ch[++i]) {
        vFunc.call(chc, i);
      }
    },




    /*
    ---------------------------------------------------------------------------
      APPEAR/DISAPPEAR MESSAGES FOR CHILDREN
    ---------------------------------------------------------------------------
    */

    // overridden
    _beforeAppear : function()
    {
      this.base(arguments);

      this.forEachVisibleChild(function()
      {
        if (this.isAppearRelevant()) {
          this._beforeAppear();
        }
      });
    },


    // overridden
    _afterAppear : function()
    {
      this.base(arguments);

      this.forEachVisibleChild(function()
      {
        if (this.isAppearRelevant()) {
          this._afterAppear();
        }
      });
    },


    // overridden
    _beforeDisappear : function()
    {
      this.base(arguments);

      this.forEachVisibleChild(function()
      {
        if (this.isAppearRelevant()) {
          this._beforeDisappear();
        }
      });
    },


    // overridden
    _afterDisappear : function()
    {
      this.base(arguments);

      this.forEachVisibleChild(function()
      {
        if (this.isAppearRelevant()) {
          this._afterDisappear();
        }
      });
    },




    /*
    ---------------------------------------------------------------------------
      INSERTDOM/REMOVEDOM MESSAGES FOR CHILDREN
    ---------------------------------------------------------------------------
    */

    // overridden
    _beforeInsertDom : function()
    {
      this.base(arguments);

      this.forEachVisibleChild(function()
      {
        if (this.isAppearRelevant()) {
          this._beforeInsertDom();
        }
      });
    },


    // overridden
    _afterInsertDom : function()
    {
      this.base(arguments);

      this.forEachVisibleChild(function()
      {
        if (this.isAppearRelevant()) {
          this._afterInsertDom();
        }
      });
    },


    // overridden
    _beforeRemoveDom : function()
    {
      this.base(arguments);

      this.forEachVisibleChild(function()
      {
        if (this.isAppearRelevant()) {
          this._beforeRemoveDom();
        }
      });
    },


    // overridden
    _afterRemoveDom : function()
    {
      this.base(arguments);

      this.forEachVisibleChild(function()
      {
        if (this.isAppearRelevant()) {
          this._afterRemoveDom();
        }
      });
    },




    /*
    ---------------------------------------------------------------------------
      DISPLAYBLE HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param vDisplayable {var} TODOC
     * @param vParent {var} TODOC
     * @param vHint {var} TODOC
     * @return {void}
     */
    _handleDisplayableCustom : function(vDisplayable, vParent, vHint)
    {
      this.forEachChild(function() {
        this._handleDisplayable();
      });
    },




    /*
    ---------------------------------------------------------------------------
      STATE QUEUE
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {void}
     */
    _addChildrenToStateQueue : function()
    {
      this.forEachVisibleChild(function() {
        this.addToStateQueue();
      });
    },


    // overridden
    recursiveAddToStateQueue : function()
    {
      this.addToStateQueue();

      this.forEachVisibleChild(function() {
        this.recursiveAddToStateQueue();
      });
    },


    // overridden
    _recursiveAppearanceThemeUpdate : function(vNewAppearanceTheme, vOldAppearanceTheme)
    {
      this.base(arguments, vNewAppearanceTheme, vOldAppearanceTheme);

      this.forEachVisibleChild(function() {
        this._recursiveAppearanceThemeUpdate(vNewAppearanceTheme, vOldAppearanceTheme);
      });
    },




    /*
    ---------------------------------------------------------------------------
      CHILDREN QUEUE
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param vChild {var} TODOC
     * @return {void}
     */
    _addChildToChildrenQueue : function(vChild)
    {
      if (!vChild._isInParentChildrenQueue && !vChild._isDisplayable) {
        this.warn("Ignoring invisible child: " + vChild);
        return;
      }

      if (!vChild._isInParentChildrenQueue && vChild._isDisplayable)
      {
        qx.legacy.ui.core.Widget.addToGlobalLayoutQueue(this);

        if (!this._childrenQueue) {
          this._childrenQueue = {};
        }

        this._childrenQueue[vChild.toHashCode()] = vChild;
      }
    },


    /**
     * TODOC
     *
     * @param vChild {var} TODOC
     * @return {void}
     */
    _removeChildFromChildrenQueue : function(vChild)
    {
      if (this._childrenQueue && vChild._isInParentChildrenQueue)
      {
        delete this._childrenQueue[vChild.toHashCode()];

        if (qx.lang.Object.isEmpty(this._childrenQueue)) {
          qx.legacy.ui.core.Widget.removeFromGlobalLayoutQueue(this);
        }
      }
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    _flushChildrenQueue : function()
    {
      if (!qx.lang.Object.isEmpty(this._childrenQueue))
      {
        this.getLayoutImpl().flushChildrenQueue(this._childrenQueue);
        delete this._childrenQueue;
      }
    },




    /*
    ---------------------------------------------------------------------------
      LAYOUT QUEUE
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param p {var} TODOC
     * @return {void}
     */
    _addChildrenToLayoutQueue : function(p)
    {
      this.forEachChild(function() {
        this.addToLayoutChanges(p);
      });
    },


    /**
     * TODOC
     *
     * @param vChild {var} TODOC
     * @return {void}
     */
    _layoutChild : function(vChild)
    {
      if (!vChild._isDisplayable)
      {
        // this.warn("Want to render an invisible child: " + vChild + " -> omitting!");
        return;
      }

      // APPLY LAYOUT
      var vChanges = vChild._layoutChanges;

      // this.debug("Layouting " + vChild + ": " + qx.lang.Object.getKeysAsString(vChanges));

      try
      {
        if (vChild.renderBorder)
        {
          if (vChanges.borderTop || vChanges.borderRight || vChanges.borderBottom || vChanges.borderLeft) {
            vChild.renderBorder(vChanges);
          }
        }
      }
      catch(ex)
      {
        this.error("Could not apply border to child " + vChild, ex);
      }

      try
      {
        if (vChild.renderPadding)
        {
          if (vChanges.paddingLeft || vChanges.paddingRight || vChanges.paddingTop || vChanges.paddingBottom) {
            vChild.renderPadding(vChanges);
          }
        }
      }
      catch(ex)
      {
        this.error("Could not apply padding to child " + vChild, ex);
      }

      // WRAP TO LAYOUT ENGINE
      try {
        this.getLayoutImpl().layoutChild(vChild, vChanges);
      } catch(ex) {
        this.error("Could not layout child " + vChild + " through layout handler", ex);
      }

      // POST LAYOUT
      try {
        vChild._layoutPost(vChanges);
      } catch(ex) {
        this.error("Could not post layout child " + vChild, ex);
      }

      // DISPLAY DOM NODE
      try
      {
        // insert dom node (if initial flag enabled)
        if (vChanges.initial)
        {
          vChild._initialLayoutDone = true;
          qx.legacy.ui.core.Widget.addToGlobalDisplayQueue(vChild);
        }
      }
      catch(ex)
      {
        this.error("Could not handle display updates from layout flush for child " + vChild, ex);
      }

      // CLEANUP
      vChild._layoutChanges = {};

      delete vChild._isInParentLayoutQueue;
      delete this._childrenQueue[vChild.toHashCode()];
    },

    /**
     * @signature function()
     */
    _layoutPost : qx.lang.Function.returnTrue,




    /*
    ---------------------------------------------------------------------------
      DIMENSION CACHE
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    _computePreferredInnerWidth : function() {
      return this.getLayoutImpl().computeChildrenNeededWidth();
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    _computePreferredInnerHeight : function() {
      return this.getLayoutImpl().computeChildrenNeededHeight();
    },


    /**
     * Called on inner width changes by the layout engine.
     *
     * @param vNew {var} new width value
     * @param vOld {var} old width value
     */

    _changeInnerWidth : function(vNew, vOld)
    {
      var vLayout = this.getLayoutImpl();

      if (vLayout.invalidateChildrenFlexWidth) {
        vLayout.invalidateChildrenFlexWidth();
      }

      this.forEachVisibleChild(function()
      {
        if (vLayout.updateChildOnInnerWidthChange(this) && this._recomputeBoxWidth())
        {
          this._recomputeOuterWidth();
          this._recomputeInnerWidth();
        }
      });
    },


    /**
     * Called on inner height changes by the layout engine.
     *
     * @param vNew {var} new height value
     * @param vOld {var} old height value
     */
    _changeInnerHeight : function(vNew, vOld)
    {
      var vLayout = this.getLayoutImpl();

      if (vLayout.invalidateChildrenFlexHeight) {
        vLayout.invalidateChildrenFlexHeight();
      }

      this.forEachVisibleChild(function()
      {
        if (vLayout.updateChildOnInnerHeightChange(this) && this._recomputeBoxHeight())
        {
          this._recomputeOuterHeight();
          this._recomputeInnerHeight();
        }
      });
    },


    /**
     * TODOC
     *
     * @param vChild {var} TODOC
     * @return {var} TODOC
     */
    getInnerWidthForChild : function(vChild) {
      return this.getInnerWidth();
    },


    /**
     * TODOC
     *
     * @param vChild {var} TODOC
     * @return {var} TODOC
     */
    getInnerHeightForChild : function(vChild) {
      return this.getInnerHeight();
    },






    /*
    ---------------------------------------------------------------------------
      REMAPPING
    ---------------------------------------------------------------------------
    */

    _remappingChildTable : [ "add", "remove", "addAt", "addAtBegin", "addAtEnd", "removeAt", "addBefore", "addAfter", "removeAll" ],

    _remapStart : "return this._remappingChildTarget.",
    _remapStop : ".apply(this._remappingChildTarget, arguments)",


    /**
     * TODOC
     *
     * @param vTarget {var} TODOC
     * @return {void}
     */
    remapChildrenHandlingTo : function(vTarget)
    {
      var t = this._remappingChildTable;

      this._remappingChildTarget = vTarget;

      for (var i=0, l=t.length, s; i<l; i++)
      {
        s = t[i];
        this[s] = new Function(qx.legacy.ui.core.Parent.prototype._remapStart + s + qx.legacy.ui.core.Parent.prototype._remapStop);
      }
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics, members, properties)
  {
    qx.legacy.core.Property.addCachedProperty({ name : "visibleChildren", defaultValue : null }, members);


    // TODO There must be a better way than to define this in defer

    // Fix Operas Rendering Bugs
    if (qx.core.Variant.isSet("qx.client", "opera"))
    {
      members._layoutChildOrig = members._layoutChild;

      members._layoutChild = function(vChild)
      {
        if (!vChild._initialLayoutDone || !vChild._layoutChanges.border) {
          return this._layoutChildOrig(vChild);
        }

        var vStyle = vChild.getElement().style;

        var vOldDisplay = vStyle.display;
        vStyle.display = "none";
        var vRet = this._layoutChildOrig(vChild);
        vStyle.display = vOldDisplay;

        return vRet;
      };
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeArray("_children");
    this._disposeObjects("_layoutImpl", "_focusHandler");
    this._disposeFields("_childrenQueue", "_childrenQueue", "_remappingChildTable",
      "_remappingChildTarget", "_cachedVisibleChildren");
  }
});
