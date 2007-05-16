/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_core)
#optional(qx.event.handler.FocusHandler)
#optional(qx.manager.object.ToolTipManager)
#optional(qx.manager.object.PopupManager)

************************************************************************ */

/**
 * Abstract base class for all widget which have child widgets (e.g. layout manager)
 *
 * Don't instantiate this class directly.
 */
qx.Class.define("qx.ui.core.Parent",
{
  extend : qx.ui.core.Widget,
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
      check : "qx.event.handler.FocusHandler",
      apply : "_modifyFocusHandler",
      nullable : true
    },

    /** The current active child. */
    activeChild :
    {
      check : "qx.ui.core.Widget",
      event : "changeActiveChild",
      nullable : true
    },

    /** The current focused child. */
    focusedChild :
    {
      check : "qx.ui.core.Widget",
      apply : "_modifyFocusedChild",
      event : "changeFocusedChild",
      nullable : true
    },

    /** all visible child widgets */
    visibleChildren :
    {
      _cached      : true,
      defaultValue : null
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
     * @type member
     * @return {Boolean} whether the widget has its own focus handler
     */
    isFocusRoot : function() {
      return this.getFocusHandler() != null;
    },


    /**
     * Return the responsible focus handler
     *
     * @type member
     * @return {qx.event.handler.FocusHandler} TODOC
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
     * @type member
     * @return {void}
     */
    activateFocusRoot : function() {
      this.setFocusHandler(new qx.event.handler.FocusHandler(this));
    },


    /**
     * Delegate keyevent to the focus handler
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onfocuskeyevent : function(e) {
      this.getFocusHandler()._onkeyevent(this, e);
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyFocusHandler : function(propValue, propOldValue, propData)
    {
      if (propValue)
      {
        // Add Key Handler
        this.addEventListener("keydown", this._onfocuskeyevent);
        this.addEventListener("keypress", this._onfocuskeyevent);

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
        this.removeEventListener("keydown", this._onfocuskeyevent);
        this.removeEventListener("keypress", this._onfocuskeyevent);

        // Deactivate focus handling
        this.setTabIndex(-1);

        // Don't hide focus outline
        this.setHideFocus(false);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyFocusedChild : function(propValue, propOldValue, propData)
    {
      // this.debug("FocusedChild: " + propValue);
      var vFocusValid = propValue != null;
      var vBlurValid = propOldValue != null;

      if (qx.Class.isDefined("qx.manager.object.PopupManager") && vFocusValid)
      {
        var vMgr = qx.manager.object.PopupManager.getInstance();

        if (vMgr) {
          vMgr.update(propValue);
        }
      }

      if (vBlurValid)
      {
        // Dispatch FocusOut
        if (propOldValue.hasEventListeners("focusout"))
        {
          var vEventObject = new qx.event.type.FocusEvent("focusout", propOldValue);

          if (vFocusValid) {
            vEventObject.setRelatedTarget(propValue);
          }

          propOldValue.dispatchEvent(vEventObject);
          vEventObject.dispose();
        }
      }

      if (vFocusValid)
      {
        if (propValue.hasEventListeners("focusin"))
        {
          // Dispatch FocusIn
          var vEventObject = new qx.event.type.FocusEvent("focusin", propValue);

          if (vBlurValid) {
            vEventObject.setRelatedTarget(propOldValue);
          }

          propValue.dispatchEvent(vEventObject);
          vEventObject.dispose();
        }
      }

      if (vBlurValid)
      {
        if (this.getActiveChild() == propOldValue && !vFocusValid) {
          this.setActiveChild(null);
        }

        propOldValue.setFocused(false);

        // Dispatch Blur
        var vEventObject = new qx.event.type.FocusEvent("blur", propOldValue);

        if (vFocusValid) {
          vEventObject.setRelatedTarget(propValue);
        }

        propOldValue.dispatchEvent(vEventObject);

        if (qx.Class.isDefined("qx.manager.object.ToolTipManager"))
        {
          var vMgr = qx.manager.object.ToolTipManager.getInstance();

          if (vMgr) {
            vMgr.handleBlur(vEventObject);
          }
        }

        vEventObject.dispose();
      }

      if (vFocusValid)
      {
        this.setActiveChild(propValue);
        propValue.setFocused(true);
        qx.event.handler.EventHandler.getInstance().setFocusRoot(this);

        // Dispatch Focus
        var vEventObject = new qx.event.type.FocusEvent("focus", propValue);

        if (vBlurValid) {
          vEventObject.setRelatedTarget(propOldValue);
        }

        propValue.dispatchEvent(vEventObject);

        if (qx.Class.isDefined("qx.manager.object.ToolTipManager"))
        {
          var vMgr = qx.manager.object.ToolTipManager.getInstance();

          if (vMgr) {
            vMgr.handleFocus(vEventObject);
          }
        }

        vEventObject.dispose();
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
     * return {qx.renderer.layout.LayoutImpl}
     *
     * @type member
     * @return {null} TODOC
     */
    _createLayoutImpl : function() {
      return null;
    },


    /**
     * Return the layout implementation.
     *
     * return {qx.renderer.layout.LayoutImpl}
     *
     * @type member
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
     * @type member
     * @return {qx.ui.core.Widget[]} all children
     */
    getChildren : function() {
      return this._children;
    },


    /**
     * Get number of children
     *
     * @type member
     * @return {Integer} number of children
     */
    getChildrenLength : function() {
      return this.getChildren().length;
    },


    /**
     * Check if the widget has children
     *
     * @type member
     * @return {Boolean} whether the widget has children
     */
    hasChildren : function() {
      return this.getChildrenLength() > 0;
    },


    /**
     * Check if there are any childrens inside
     *
     * @type member
     * @return {Boolean} whether the number of children is 0
     */
    isEmpty : function() {
      return this.getChildrenLength() == 0;
    },


    /**
     * Get the index of a child widget.
     *
     * @type member
     * @param vChild {qx.ui.core.Widget} TODOC
     * @return {Integer} index of the child widget
     */
    indexOf : function(vChild) {
      return this.getChildren().indexOf(vChild);
    },


    /**
     * Check if the given widget is a child
     *
     * @type member
     * @param vWidget {qx.ui.core.Widget} The widget which should be checked.
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
     * @type member
     * @return {qx.ui.core.Widget[]} all visible children
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
     * Get length of visible children
     *
     * @type member
     * @return {var} TODOC
     */
    getVisibleChildrenLength : function() {
      return this.getVisibleChildren().length;
    },


    /**
     * Check if the widget has any visible children
     *
     * @type member
     * @return {var} TODOC
     */
    hasVisibleChildren : function() {
      return this.getVisibleChildrenLength() > 0;
    },


    /**
     * Check if there are any visible childrens inside
     *
     * @type member
     * @return {var} TODOC
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
     * @type member
     * @param varargs {qx.core.Widget} variable number of widgets to add
     * @return {Parent} This widget.
     * @throws TODOC
     */
    add : function(varargs)
    {
      var vWidget;

      for (var i=0, l=arguments.length; i<l; i++)
      {
        vWidget = arguments[i];

        if (!(vWidget instanceof qx.ui.core.Parent) && !(vWidget instanceof qx.ui.basic.Terminator)) {
//if (!(vWidget instanceof qx.ui.core.Widget)) {
          throw new Error("Invalid Widget: " + vWidget);
        } else {
          vWidget.setParent(this);
        }
      }

      return this;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vChild {var} TODOC
     * @param vIndex {var} TODOC
     * @return {void}
     * @throws TODOC
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
     * TODOC
     *
     * @type member
     * @param vChild {var} TODOC
     * @return {var} TODOC
     */
    addAtBegin : function(vChild) {
      return this.addAt(vChild, 0);
    },


    /**
     * TODOC
     *
     * @type member
     * @param vChild {var} TODOC
     * @return {var} TODOC
     */
    addAtEnd : function(vChild)
    {
      // we need to fix here, when the child is already inside myself, but
      // want to change its position
      var vLength = this.getChildrenLength();
      return this.addAt(vChild, vChild.getParent() == this ? vLength - 1 : vLength);
    },


    /**
     * Add a widget before another already inserted child
     *
     * @type member
     * @param vChild {var} TODOC
     * @param vBefore {var} TODOC
     * @return {var} TODOC
     * @throws TODOC
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
     * Add a widget after another already inserted child
     *
     * @type member
     * @param vChild {var} TODOC
     * @param vAfter {var} TODOC
     * @return {var} TODOC
     * @throws TODOC
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
     * @type member
     * @return {void}
     * @throws TODOC
     */
    remove : function()
    {
      var vWidget;

      for (var i=0, l=arguments.length; i<l; i++)
      {
        vWidget = arguments[i];

        if (!(vWidget instanceof qx.ui.core.Parent) && !(vWidget instanceof qx.ui.basic.Terminator)) {
          throw new Error("Invalid Widget: " + vWidget);
        } else if (vWidget.getParent() == this) {
          vWidget.setParent(null);
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vIndex {var} TODOC
     * @return {void}
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
     * Remove all childrens.
     *
     * @type member
     * @return {void}
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
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getFirstChild : function() {
      return qx.lang.Array.getFirst(this.getChildren());
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getFirstVisibleChild : function() {
      return qx.lang.Array.getFirst(this.getVisibleChildren());
    },


    /**
     * TODOC
     *
     * @type member
     * @param vIgnoreClasses {var} TODOC
     * @return {var} TODOC
     */
    getFirstActiveChild : function(vIgnoreClasses) {
      return qx.ui.core.Widget.getActiveSiblingHelper(null, this, 1, vIgnoreClasses, "first");
    },




    /*
    ---------------------------------------------------------------------------
      CHILDREN MANAGMENT: LAST CHILD
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getLastChild : function() {
      return qx.lang.Array.getLast(this.getChildren());
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getLastVisibleChild : function() {
      return qx.lang.Array.getLast(this.getVisibleChildren());
    },


    /**
     * TODOC
     *
     * @type member
     * @param vIgnoreClasses {var} TODOC
     * @return {var} TODOC
     */
    getLastActiveChild : function(vIgnoreClasses) {
      return qx.ui.core.Widget.getActiveSiblingHelper(null, this, -1, vIgnoreClasses, "last");
    },




    /*
    ---------------------------------------------------------------------------
      CHILDREN MANAGMENT: LOOP UTILS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vFunc {var} TODOC
     * @return {void}
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
     * TODOC
     *
     * @type member
     * @param vFunc {var} TODOC
     * @return {void}
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

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
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


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
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


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
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


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
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

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
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


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
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


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
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


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
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
     * @type member
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
     * @type member
     * @return {void}
     */
    _addChildrenToStateQueue : function()
    {
      this.forEachVisibleChild(function() {
        this.addToStateQueue();
      });
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    recursiveAddToStateQueue : function()
    {
      this.addToStateQueue();

      this.forEachVisibleChild(function() {
        this.recursiveAddToStateQueue();
      });
    },


    /**
     * TODOC
     *
     * @type member
     * @param vNewAppearanceTheme {var} TODOC
     * @param vOldAppearanceTheme {var} TODOC
     * @return {void}
     */
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
     * @type member
     * @param vChild {var} TODOC
     * @return {void}
     */
    _addChildToChildrenQueue : function(vChild)
    {
      if (!vChild._isInParentChildrenQueue && !vChild._isDisplayable) {
        this.warn("Ignoring invisible child: " + vChild);
      }

      if (!vChild._isInParentChildrenQueue && vChild._isDisplayable)
      {
        qx.ui.core.Widget.addToGlobalLayoutQueue(this);

        if (!this._childrenQueue) {
          this._childrenQueue = {};
        }

        this._childrenQueue[vChild.toHashCode()] = vChild;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vChild {var} TODOC
     * @return {void}
     */
    _removeChildFromChildrenQueue : function(vChild)
    {
      if (this._childrenQueue && vChild._isInParentChildrenQueue)
      {
        delete this._childrenQueue[vChild.toHashCode()];

        if (qx.lang.Object.isEmpty(this._childrenQueue)) {
          qx.ui.core.Widget.removeFromGlobalLayoutQueue(this);
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
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
     * @type member
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
     * @type member
     * @param vChild {var} TODOC
     * @return {void}
     */
    _layoutChild : function(vChild)
    {
      if (!vChild._isDisplayable)
      {
        this.warn("Want to render an invisible child: " + vChild + " -> omitting!");
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
          qx.ui.core.Widget.addToGlobalDisplayQueue(vChild);
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
     * @type member
     * @return {var} TODOC
     */
    _computePreferredInnerWidth : function() {
      return this.getLayoutImpl().computeChildrenNeededWidth();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    _computePreferredInnerHeight : function() {
      return this.getLayoutImpl().computeChildrenNeededHeight();
    },


    /**
     * TODOC
     *
     * @type member
     * @param vNew {var} TODOC
     * @param vOld {var} TODOC
     * @return {void}
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
     * TODOC
     *
     * @type member
     * @param vNew {var} TODOC
     * @param vOld {var} TODOC
     * @return {void}
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
     * @type member
     * @param vChild {var} TODOC
     * @return {var} TODOC
     */
    getInnerWidthForChild : function(vChild) {
      return this.getInnerWidth();
    },


    /**
     * TODOC
     *
     * @type member
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
     * @type member
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
        this[s] = new Function(qx.ui.core.Parent.prototype._remapStart + s + qx.ui.core.Parent.prototype._remapStop);
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
    this._disposeObjectDeep("_children", 1);
    this._disposeObjects("_layoutImpl");
    this._disposeFields("_childrenQueue", "_childrenQueue", "_remappingChildTable",
      "_remappingChildTarget", "_cachedVisibleChildren");
  }
});
