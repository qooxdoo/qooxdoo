/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#use(qx.event.dispatch.DomBubbling)

************************************************************************ */

/**
 * This handler is used to normalize all focus/activation requirements
 * and normalize all cross browser quirks in this area.
 *
 * Notes:
 *
 * Webkit and Opera (before 9.5) do not support tabIndex for all elements
 * (See also: http://bugs.webkit.org/show_bug.cgi?id=7138)
 */
qx.Class.define("qx.event.handler.Focus",
{
  extend : qx.core.Object,
  implement : qx.event.IEventHandler,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */


  /**
   * Create a new instance
   *
   * @type constructor
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct : function(manager)
  {
    this.base(arguments);

    // Define shorthands
    this._manager = manager;
    this._window = manager.getWindow();
    this._document = this._window.document;
    this._root = this._document.documentElement;
    this._body = this._document.body;

    this._initObserver();
  },






  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The active DOM element */
    active :
    {
      check : "Element",
      apply : "_applyActive",
      nullable : true
    },

    /** The focussed DOM element */
    focus :
    {
      check : "Element",
      apply : "_applyFocus",
      nullable : true
    }
  },





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL
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
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canHandleEvent : function(target, type) {
      return this._eventTypes[type];
    },


    // interface implementation
    registerEvent : function(target, type, capture) {
      // Nothing needs to be done here
    },


    // interface implementation
    unregisterEvent : function(target, type, capture) {
      // Nothing needs to be done here
    },






    /*
    ---------------------------------------------------------------------------
      FOCUS/BLUR USER INTERFACE
    ---------------------------------------------------------------------------
    */

    /**
     * Focusses the given DOM element
     *
     * @type member
     * @param element {Element} DOM element to focus
     * @return {void}
     */
    focus : function(element) {
      element.focus();
    },


    /**
     * Activates the given DOM element
     *
     * @type member
     * @param element {Element} DOM element to activate
     * @return {void}
     */
    activate : function(element)
    {
      // Use native setActive()
      // Supported by MSHTML: http://msdn2.microsoft.com/en-us/library/ms536738(VS.85).aspx
      if (element.setActive) {
        element.setActive();
      } else {
        this.setActive(element);
      }
    },


    /**
     * Blurs the given DOM element
     *
     * @type member
     * @param element {Element} DOM element to focus
     * @return {void}
     */
    blur : function(element) {
      element.blur();
    },


    /**
     * Deactivates the given DOM element
     *
     * @type member
     * @param element {Element} DOM element to activate
     * @return {void}
     */
    deactivate : function(element)
    {
      if (this.getActive() === element) {
        this.resetActive();
      }
    },





    /*
    ---------------------------------------------------------------------------
      HELPER
    ---------------------------------------------------------------------------
    */

    /** {Map} Internal data structure with all supported event types */
    _eventTypes :
    {
      focus : 1,
      blur : 1,
      focusin : 1,
      focusout : 1,
      beforedeactivate : 1,
      beforeactivate : 1,
      activate : 1,
      deactivate : 1
    },


    /**
     * Shorthand to fire events from within this class.
     *
     * @type member
     * @param target {Element} DOM element which is the target
     * @param related {Element} DOM element which is the related target
     * @param type {String} Name of the event to fire
     * @param bubbles {Boolean} Whether the event should bubble
     * @return {void}
     */
    _fireEvent : function(target, related, type, bubbles)
    {
      var Registration = qx.event.Registration;

      var evt = Registration.createEvent(type, qx.event.type.Focus);
      evt.setBubbles(bubbles);
      evt.setRelatedTarget(related);

      Registration.dispatchEvent(target, evt);
    },






    /*
    ---------------------------------------------------------------------------
      WINDOW FOCUS/BLUR SUPPORT
    ---------------------------------------------------------------------------
    */

    /** {Boolean} Whether the window is focused currently */
    _windowFocused : true,


    /**
     * Helper for native event listeners to react on window blur
     *
     * @type member
     * @return {void}
     */
    _doWindowBlur : function()
    {
      // Omit doubled blur events
      // which is a common behavior at least for gecko based clients
      if (this._windowFocused)
      {
        this._windowFocused = false;

        this.resetActive();
        this.resetFocus();

        this._fireEvent(this._window, null, "blur", false);
      }
    },


    /**
     * Helper for native event listeners to react on window focus
     *
     * @type member
     * @return {void}
     */
    _doWindowFocus : function()
    {
      // Omit doubled focus events
      // which is a common behavior at least for gecko based clients
      if (!this._windowFocused)
      {
        this._windowFocused = true;
        this._fireEvent(this._window, null, "focus", false);
      }
    },






    /*
    ---------------------------------------------------------------------------
      NATIVE OBSERVER
    ---------------------------------------------------------------------------
    */

    /**
     * Initializes event listeners.
     *
     * @type member
     * @signature function()
     * @return {void}
     */
    _initObserver : qx.core.Variant.select("qx.client",
    {
      "gecko" : function()
      {
        // Bind methods
        this.__onNativeMouseDownWrapper = qx.lang.Function.listener(this.__onNativeMouseDown, this);
        this.__onNativeMouseUpWrapper = qx.lang.Function.listener(this.__onNativeMouseUp, this);

        this.__onNativeFocusWrapper = qx.lang.Function.listener(this.__onNativeFocus, this);
        this.__onNativeBlurWrapper = qx.lang.Function.listener(this.__onNativeBlur, this);


        // Register events
        this._document.addEventListener("mousedown", this.__onNativeMouseDownWrapper, true);
        this._document.addEventListener("mouseup", this.__onNativeMouseUpWrapper, true);

        // Capturing is needed for gecko to correctly
        // handle focus of input and textarea fields
        this._window.addEventListener("focus", this.__onNativeFocusWrapper, true);
        this._window.addEventListener("blur", this.__onNativeBlurWrapper, true);
      },

      "mshtml" : function()
      {
        // Bind methods
        this.__onNativeMouseDownWrapper = qx.lang.Function.listener(this.__onNativeMouseDown, this);
        this.__onNativeMouseUpWrapper = qx.lang.Function.listener(this.__onNativeMouseUp, this);

        this.__onNativeFocusInWrapper = qx.lang.Function.listener(this.__onNativeFocusIn, this);
        this.__onNativeFocusOutWrapper = qx.lang.Function.listener(this.__onNativeFocusOut, this);

        this.__onNativeSelectStartWrapper = qx.lang.Function.listener(this.__onNativeSelectStart, this);


        // Register events
        this._document.attachEvent("onmousedown", this.__onNativeMouseDownWrapper);
        this._document.attachEvent("onmouseup", this.__onNativeMouseUpWrapper);

        // MSHTML supports their own focusin and focusout events
        // To detect which elements get focus the target is useful
        // The window blur can detected using focusout and look
        // for the toTarget property which is empty in this case.
        this._document.attachEvent("onfocusin", this.__onNativeFocusInWrapper);
        this._document.attachEvent("onfocusout", this.__onNativeFocusOutWrapper);

        // Add selectstart to prevent selection
        this._document.attachEvent("onselectstart", this.__onNativeSelectStartWrapper);
      },

      "webkit" : function()
      {
        // Bind methods
        this.__onNativeMouseDownWrapper = qx.lang.Function.listener(this.__onNativeMouseDown, this);

        this.__onNativeFocusInWrapper = qx.lang.Function.listener(this.__onNativeFocusIn, this);
        this.__onNativeFocusOutWrapper = qx.lang.Function.listener(this.__onNativeFocusOut, this);

        this.__onNativeActivateWrapper = qx.lang.Function.listener(this.__onNativeActivate, this);

        this.__onNativeFocusWrapper = qx.lang.Function.listener(this.__onNativeFocus, this);
        this.__onNativeBlurWrapper = qx.lang.Function.listener(this.__onNativeBlur, this);

        this.__onNativeSelectStartWrapper = qx.lang.Function.listener(this.__onNativeSelectStart, this);


        // Register events
        this._document.addEventListener("mousedown", this.__onNativeMouseDownWrapper, true);
        this._document.addEventListener("selectstart", this.__onNativeSelectStartWrapper, false);

        this._window.addEventListener("DOMFocusIn", this.__onNativeFocusInWrapper, true);
        this._window.addEventListener("DOMFocusOut", this.__onNativeFocusOutWrapper, true);

        this._window.addEventListener("DOMActivate", this.__onNativeActivateWrapper, true);

        this._window.addEventListener("focus", this.__onNativeFocusWrapper, true);
        this._window.addEventListener("blur", this.__onNativeBlurWrapper, true);
      },

      "opera" : function()
      {
        // Bind methods
        this.__onNativeMouseDownWrapper = qx.lang.Function.listener(this.__onNativeMouseDown, this);

        this.__onNativeFocusInWrapper = qx.lang.Function.listener(this.__onNativeFocusIn, this);
        this.__onNativeFocusOutWrapper = qx.lang.Function.listener(this.__onNativeFocusOut, this);

        this.__onNativeFocusWrapper = qx.lang.Function.listener(this.__onNativeFocus, this);
        this.__onNativeBlurWrapper = qx.lang.Function.listener(this.__onNativeBlur, this);


        // Register events
        this._document.addEventListener("mousedown", this.__onNativeMouseDownWrapper, true);

        this._window.addEventListener("DOMFocusIn", this.__onNativeFocusInWrapper, true);
        this._window.addEventListener("DOMFocusOut", this.__onNativeFocusOutWrapper, true);

        this._window.addEventListener("focus", this.__onNativeFocusWrapper, true);
        this._window.addEventListener("blur", this.__onNativeBlurWrapper, true);
      }
    }),


    /**
     * Disconnects event listeners.
     *
     * @type member
     * @signature function()
     * @return {void}
     */
    _stopObserver : qx.core.Variant.select("qx.client",
    {
      "gecko" : function()
      {
        this._document.removeEventListener("mousedown", this.__onNativeMouseDownWrapper, true);
        this._document.removeEventListener("mouseup", this.__onNativeMouseUpWrapper, true);

        this._window.removeEventListener("focus", this.__onNativeFocusWrapper, false);
        this._window.removeEventListener("blur", this.__onNativeBlurWrapper, false);
      },

      "mshtml" : function()
      {
        this._document.detachEvent("onmousedown", this.__onNativeMouseDownWrapper);
        this._document.detachEvent("onmouseup", this.__onNativeMouseUpWrapper);

        this._document.detachEvent("onfocusin", this.__onNativeFocusInWrapper);
        this._document.detachEvent("onfocusout", this.__onNativeFocusOutWrapper);

        this._document.detachEvent("onselectstart", this.__onNativeSelectStartWrapper);
      },

      "webkit" : function()
      {
        this._document.removeEventListener("mousedown", this.__onNativeMouseDownWrapper, true);
        this._document.removeEventListener("selectstart", this.__onNativeSelectStartWrapper, false);

        this._window.removeEventListener("DOMFocusIn", this.__onNativeFocusInWrapper, true);
        this._window.removeEventListener("DOMFocusOut", this.__onNativeFocusOutWrapper, true);

        this._window.removeEventListener("DOMActivate", this.__onNativeActivateWrapper, true);

        this._window.removeEventListener("focus", this.__onNativeFocusWrapper, true);
        this._window.removeEventListener("blur", this.__onNativeBlurWrapper, true);
      },

      "opera" : function()
      {
        this._document.removeEventListener("mousedown", this.__onNativeMouseDownWrapper, true);

        this._window.removeEventListener("DOMFocusIn", this.__onNativeFocusInWrapper, true);
        this._window.removeEventListener("DOMFocusOut", this.__onNativeFocusOutWrapper, true);

        this._window.removeEventListener("focus", this.__onNativeFocusWrapper, true);
        this._window.removeEventListener("blur", this.__onNativeBlurWrapper, true);
      }
    }),






    /*
    ---------------------------------------------------------------------------
      NATIVE LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Native event listener for <code>DOMActivate</code> or <code>activate</code>
     * depending on the client's engine.
     *
     * @type member
     * @signature function(e)
     * @param e {Event} Native event
     * @return {void}
     */
    __onNativeActivate : qx.core.Variant.select("qx.client",
    {
      "webkit" : function(e)
      {
        this.setActive(e.target);

        this._fromActivate = true;

        var focus = this.__findFocusNode(e.target);
        this.setFocus(focus);

        delete this._fromActivate;
      },

      "default" : function(e) {}
    }),


    /**
     * Native event listener for <code>DOMDeactivate</code> or <code>deactivate</code>
     * depending on the client's engine.
     *
     * Not used yet. No browser support this correctly.
     *
     * @type member
     * @signature function(e)
     * @param e {Event} Native event
     * @return {void}
     */
    __onNativeDeactivate : null,


    /**
     * Native event listener for <code>DOMFocusIn</code> or <code>focusin</code>
     * depending on the client's engine.
     *
     * @type member
     * @signature function(e)
     * @param e {Event} Native event
     * @return {void}
     */
    __onNativeFocusIn : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(e)
      {
        if (!window.event.toElement) {
          this._doWindowFocus();
        }

        var target = window.event.srcElement;

        // In mousedown sequences the target is already set correctly. In all
        // other cases the active element is identical to the focus element.
        if (!this._fromMouseDown) {
          this.setActive(target);
        } else {
          delete this._fromMouseDown;
        }

        var focusTarget = this.__findFocusNode(target);
        this.setFocus(focusTarget);
      },

      "webkit" : function(e)
      {
        var target = e.target;
        this.setFocus(target);

        if (!this._fromActivate) {
          this.setActive(target);
        }
      },

      "opera" : function(e)
      {
        // Force window focus to be the first
        this._doWindowFocus();

        // Then reconfigure active and focused data
        // when the target is not the document (real inner focusing)
        var target = e.target;
        if (target !== this._document)
        {
          this.setActive(target);
          this.setFocus(target);
        }
      },

      "default" : null
    }),


    /**
     * Native event listener for <code>DOMFocusOut</code> or <code>focusout</code>
     * depending on the client's engine.
     *
     * @type member
     * @signature function(e)
     * @param e {Event} Native event
     * @return {void}
     */
    __onNativeFocusOut : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(e)
      {
        if (!window.event.toElement) {
          this._doWindowBlur();
        }
      },

      "webkit" : function(e) {
        this.resetFocus();
      },

      "default" : null
    }),


    /**
     * Native event listener for <code>blur</code>.
     *
     * @type member
     * @signature function(e)
     * @param e {Event} Native event
     * @return {void}
     */
    __onNativeBlur : qx.core.Variant.select("qx.client",
    {
      "gecko|webkit|opera" : function(e)
      {
        // Only process window blur here. In every tested case
        // where a blur occours a focus follows, but not when
        // leaving the window completely. This is exactly the case
        // which is handled here.
        var target = e.target;
        if (target === this._window || target === this._document) {
          this._doWindowBlur();
        }
      },

      "default" : null
    }),


    /**
     * Native event listener for <code>focus</code>.
     *
     * @type member
     * @signature function(e)
     * @param e {Event} Native event
     * @return {void}
     */
    __onNativeFocus : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(e)
      {
        var target = e.target;

        if (!this._windowFocused)
        {
          // A focus event normally means that at least the window
          // should be focused. The other stuff is not needed because
          // there follow special focus events for the real targets
          // afterwards as well.
          this._doWindowFocus();
        }
        else if (target === this._window || target === this._document)
        {
          // Internally we normalize all these to the body element
          this.setFocus(this._body);
        }
        else
        {
          if (!this._fromMouseDown || !this.getActive()) {
            this.setActive(target);
          }

          // Cleanup marker
          delete this._fromMouseDown;

          // Update property
          this.setFocus(target);
        }
      },

      "webkit|opera" : function(e)
      {
        // Only window focus is handled here. All other things are done by
        // focusIn, focusOut etc.
        var target = e.target;
        if (target === this._window || target === this._document) {
          this._doWindowFocus();
        }
      },

      "default" : null
    }),


    /**
     * Native event listener for <code>mousedown</code>.
     *
     * @type member
     * @param e {Event} Native event
     * @return {void}
     */
    __onNativeMouseDown : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(e)
      {
        var target = e.target;

        // Ignore XUL elements
        while (target.boxObject) {
          target = target.parentNode;
        }

        // Activate element
        this.setActive(target);

        // Remember mouse active target
        this._fromMouseDown = true;

        // Sometimes the focus is not fired correctly in gecko
        var focusTarget = this.__findFocusNode(target);
        focusTarget.focus();

        // Blocks selection & dragdrop
        if (!this.__isSelectable(target)) {
          qx.bom.Event.preventDefault(e);
        }
      },

      "mshtml" : function(e)
      {
        this.setActive(window.event.srcElement);
        this._fromMouseDown = true;
      },

      "webkit" : function(e)
      {
        // It seems that Webkit (at least Safari 3.1) do not properly fire
        // activate / focus events when clicking on checkboxes and radiobuttons.
        // But it also seems that the focus happens onmouseup and not when the mouse
        // is pressed down. We correct both behaviors here through forcing the focus.
        var target = e.target;
        this.setActive(target);

        // We must be sure to remove the old focus. Safari as of version 3.1
        // does not support tabIndex and focusing on every element so the
        // focus call does not mean to remove the old focus in all tested cases.
        var nextFocus = this.__findFocusNode(target);
        var currentFocus = this.getFocus();
        if (currentFocus != nextFocus)
        {
          currentFocus.blur();
          nextFocus.focus();
        }
      },

      "opera" : function(e)
      {
        // Focus event in Opera is fired after the mousedown which
        // is not typical. Normalize this here.
        this._doWindowFocus();

        // Do both, activation and focusing of the pressed element.
        var target = e.target;
        this.setActive(target);

        var focusTarget = this.__findFocusNode(target);
        this.setFocus(focusTarget);

        // Blocks selection & dragdrop
        if (!this.__isSelectable(target)) {
          qx.bom.Event.preventDefault(e);
        }
      },

      "default" : null
    }),


    /**
     * Native event listener for <code>mouseup</code>.
     *
     * @type member
     * @param e {Event} Native event
     * @return {void}
     */
    __onNativeMouseUp : qx.core.Variant.select("qx.client",
    {
      "gecko|mshtml" : function(e) {
        delete this._fromMouseDown;
      },

      "default" : null
    }),


    /**
     * Native event listener for <code>selectstart</code>.
     *
     * @type member
     * @param e {Event} Native event
     * @return {void}
     */
    __onNativeSelectStart : qx.core.Variant.select("qx.client",
    {
      "webkit|mshtml" : function(e)
      {
        var target = e.target || e.srcElement;

        if (!this.__isSelectable(target)) {
          qx.bom.Event.preventDefault(e);
        }
      },

      "default" : null
    }),





    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the next focusable parent node of a activated DOM element.
     *
     * @type member
     * @param node {Node} Node to start lookup with
     * @return {void}
     */
    __findFocusNode : function(node)
    {
      var Attribute = qx.bom.element.Attribute;
      var body = this._body;

      while (node && node.nodeType === 1)
      {
        if (Attribute.get(node, "tabIndex") >= 1) {
          return node;
        }

        node = node.parentNode;
      }

      // This should be identical to the one which is selected when
      // clicking into an empty page area. In mshtml this must be
      // the body of the document.
      return body;
    },


    /**
     * Whether the given node (or its content) should be selectable
     * by the user.
     *
     * @type member
     * @param node {Node} Node to start lookup with
     * @return {Boolean} Whether the content is selectable.
     */
    __isSelectable : function(node)
    {
      var Attribute = qx.bom.element.Attribute;

      while(node && node.nodeType === 1)
      {
        attr = Attribute.get(node, "qxselectable");
        if (attr != null) {
          return attr === "on";
        }

        node = node.parentNode;
      }

      return false;
    },






    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // apply routine
    _applyActive : function(value, old)
    {
      // this.debug("LL-Active: " + value);

      if (old) {
        this._fireEvent(old, value, "beforedeactivate", true);
      }

      if (value) {
        this._fireEvent(value, old, "beforeactivate", true);
      }

      if (old) {
        this._fireEvent(old, value, "deactivate", true);
      }

      if (value) {
        this._fireEvent(value, old, "activate", true);
      }
    },


    // apply routine
    _applyFocus : function(value, old)
    {
      // this.debug("LL-Focus: " + value);

      if (old) {
        this._fireEvent(old, value, "focusout", true);
      }

      if (value) {
        this._fireEvent(value, old, "focusin", true);
      }

      if (old) {
        this._fireEvent(old, value, "blur", false);
      }

      if (value) {
        this._fireEvent(value, old, "focus", false);
      }
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._stopMouseObserver();
    this._stopFocusObserver();

    this._disposeFields("_manager", "_window", "_document", "_root", "_body");
  },





  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    qx.event.Registration.addHandler(statics);
  }
});
