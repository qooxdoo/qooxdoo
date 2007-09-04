/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(event2)

************************************************************************ */

/**
 *
 * Notes:
 *
 * Webkit does not support tabIndex for all elements:
 * http://bugs.webkit.org/show_bug.cgi?id=7138
 *
 *
 */
qx.Class.define("qx.event.handler.FocusHandler",
{
  extend : qx.event.handler.AbstractEventHandler,

  construct : function(manager)
  {
    this.base(arguments, manager);


    // Shorthands
    this._window = manager.getWindow();
    this._document = this._window.document;
    this._root = this._document.documentElement;
    this._body = this._document.body;

    // Common native listeners
    this.__onNativeMouseDown = qx.lang.Function.bind(this._onNativeMouseDown, this);
    qx.event.Manager.addNativeListener(this._document, "mousedown", this.__onNativeMouseDown);

    // Cross browser listeners
    if (qx.core.Variant.isSet("qx.client", "gecko"))
    {
      // Bind methods
      this.__onNativeFocus = qx.lang.Function.bind(this._onNativeFocus, this);
      this.__onNativeBlur = qx.lang.Function.bind(this._onNativeBlur, this);

      // Capturing is needed for gecko to correctly
      // handle focus of input and textarea fields
      this._window.addEventListener("focus", this.__onNativeFocus, true);
      this._window.addEventListener("blur", this.__onNativeBlur, true);
    }
    else if (qx.core.Variant.isSet("qx.client", "mshtml"))
    {
      // Bind methods
      this.__onNativeFocusIn = qx.lang.Function.bind(this._onNativeFocusIn, this);
      this.__onNativeFocusOut = qx.lang.Function.bind(this._onNativeFocusOut, this);

      // MSHTML supports their own focusin and focusout events
      // To detect which elements get focus the target is useful
      // The window blur can detected using focusout and look
      // for the relatedTarget which is empty in this case.
      qx.event.Manager.addNativeListener(this._document, "focusin", this.__onNativeFocusIn);
      qx.event.Manager.addNativeListener(this._document, "focusout", this.__onNativeFocusOut);
    }
    else if (qx.core.Variant.isSet("qx.client", "opera|webkit"))
    {
      // Bind methods
      this.__onNativeFocus = qx.lang.Function.bind(this._onNativeFocus, this);
      this.__onNativeBlur = qx.lang.Function.bind(this._onNativeBlur, this);
      this.__onNativeFocusIn = qx.lang.Function.bind(this._onNativeFocusIn, this);

      // Opera 9.2 ignores the event when capturing is enabled
      this._window.addEventListener("focus", this.__onNativeFocus, false);
      this._window.addEventListener("blur", this.__onNativeBlur, false);

      // Opera 9.x supports DOMFocusOut which is needed to detect the element focus
      qx.event.Manager.addNativeListener(this._document, "DOMFocusIn", this.__onNativeFocusIn);
    }
  },

  properties :
  {
    active :
    {
      check : "Element",
      //event : "changeActive",
      apply : "_applyActive",
      nullable : true
    },

    focus :
    {
      check : "Element",
      //event : "changeFocus",
      apply : "_applyFocus",
      nullable : true
    }
  },

  members :
  {

    __focusTypes :
    {
      "focus" : 1,
      "blur" : 1,
      "focusin" : 1,
      "focusout" : 1,
      "beforedeactivate" : 1,
      "beforeactivate" : 1,
      "activate" : 1,
      "deactivate" : 1
    },


    // overridden
    canHandleEvent : function(target, type) {
      return this.__focusTypes[type];
    },


    _windowFocussed : true,

    _doWindowBlur : function()
    {
      // Omit doubled blur events
      // which is a common behavior at least for gecko based clients
      if (this._windowFocussed)
      {
        this._windowFocussed = false;

        this.resetActive();
        this.resetFocus();

        // this.debug("Window blurred");
        this.__fireCustom(this._window, "blur");
      }
    },

    _doWindowFocus : function()
    {
      // Omit doubled focus events
      // which is a common behavior at least for gecko based clients
      if (!this._windowFocussed)
      {
        this._windowFocussed = true;

        // this.debug("Window focussed");
        this.__fireCustom(this._window, "focus");
      }
    },

    _doElementFocus : function(element)
    {
      if (element === this._document) {
        element = this._root;
      }

      // If focus is already correct, don't configure both
      // This is the case for all mousedown events normally
      if (element && this.getFocus() !== element)
      {
        this.setActive(element);
        this.setFocus(element);
      }
    },






    _onNativeFocusOut : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(e)
      {
        if (!e) {
          e = window.event;
        }

        var related = e.relatedTarget || e.toElement;

        // this.debug("FocusOut: " + target + " :: " + related);

        if (!related) {
          this._doWindowBlur();
        }
      },

      "default" : null
    }),

    _onNativeFocusIn : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(e)
      {
        if (!e) {
          e = window.event;
        }

        var target = e.target || e.srcElement;
        var related = e.relatedTarget || e.toElement;

        // this.debug("FocusIn: " + target + " :: " + related);

        if (!related) {
          this._doWindowFocus();
        }

        this._doElementFocus(target);
      },

      "opera|webkit" : function(e)
      {
        if (!e) {
          e = window.event;
        }

        // this.debug("FocusIn: " + e.target);

        this._doElementFocus(e.target);
      },

      "default" : null
    }),





    _onNativeBlur : qx.core.Variant.select("qx.client",
    {
      "gecko|opera|webkit" : function(e)
      {
        switch(e.target)
        {
          case null:
          case undefined:
            return;

          case this._window:
          case this._document:
          case this._body:
          case this._root:
            this._doWindowBlur();
            break;
        }
      },

      "default" : null
    }),

    _onNativeFocus : qx.core.Variant.select("qx.client",
    {
      "gecko|opera|webkit" : function(e)
      {
        switch(e.target)
        {
          case null:
          case undefined:
            return;

          case this._window:
          case this._document:
          case this._body:
          case this._root:
            this._doWindowFocus();
            break;

          default:
            this._doElementFocus(e.target);
        }
      },

      "default" : null
    }),





    __findFocusNode : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(node)
      {
        while (node)
        {
          // The last one is needed for MSHTML, where every node
          // in document normally returns tabIndex=0 even if not set up
          // this way. The unmodified value return 32768 for unconfigured nodes
          if (node.tabIndex !== undefined && node.tabIndex >= 0 && node.getAttribute("tabIndex", 2) !== 32768) {
            return node;
          }

          node = node.parentNode;
        }

        // This should be identical to the one which is selected when
        // clicking into an empty page area. In mshtml this must be
        // the body of the document.
        return this._body;
      },

      "opera|webkit" : function(node)
      {
        var index;
        while (node && node.getAttribute)
        {
          // Manually added tabIndexes to elements which
          // do not support this are stored a way to allow
          // access to them only through getAttribute().
          //
          // Naturally behavior like default tabIndexes (like 0)
          // for input fields are only accessible using
          // the tabIndex property and are not available
          // using the getAttribute() call.
          index = node.getAttribute("tabIndex");

          if (index == null) {
            index = node.tabIndex;
          }

          if (index >= 0) {
            return node;
          }

          node = node.parentNode;
        }

        // This should be identical to the one which is selected when
        // clicking into an empty page area. In mshtml this must be
        // the body of the document.
        return this._body;
      },

      "default" : function(node)
      {
        while (node)
        {
          if (node.tabIndex !== undefined && node.tabIndex >= 0) {
            return node;
          }

          node = node.parentNode;
        }

        // This should be identical to the one which is selected when
        // clicking into an empty page area. In mshtml this must be
        // the body of the document.
        return this._body;
      }
    }),


    /**
     * onclick handler
     *
     * @type member
     * @param e {Event}
     */
    _onNativeMouseDown : function(e)
    {
      if (!e) {
        e = window.event;
      }

      var target = e.target || e.srcElement;

      // this.debug("MouseDown: " + target.tagName);

      this.setActive(target);
      this.setFocus(this.__findFocusNode(target));
    },


    _applyActive : function(value, old)
    {
      if (old) {
        this.__fireCustom(old, "beforedeactivate");
      }

      if (value) {
        this.__fireCustom(value, "beforeactivate");
      }

      if (old) {
        this.__fireCustom(old, "deactivate");
      }

      if (value) {
        this.__fireCustom(value, "activate");
      }
    },


    _applyFocus : function(value, old)
    {
      if (old) {
        this.__fireCustom(old, "focusout");
      }

      if (value) {
        this.__fireCustom(value, "focusin");
      }

      if (old) {
        this.__fireCustom(old, "blur");
      }

      if (value) {
        this.__fireCustom(value, "focus");
      }
    },

    focus : function(el)
    {
      this.setActive(el);
      this.setFocus(el);
    },

    activate : function(el) {
      this.setActive(el);
    },





    __fireCustom : function(target, type)
    {
      var event = this._eventPool.getEventInstance("qx.event.type.Event").init({});

      if (target) {
        event.setTarget(target);
      }

      if (type) {
        event.setType(type);
      }

      this._manager.dispatchEvent(event);
      this._eventPool.poolEvent(event);
    },


    removeAllListeners : qx.core.Variant.select("qx.client",
    {
      "gecko" : function()
      {
        qx.event.Manager.removeNativeListener(this._document, "mousedown", this.__onNativeMouseDown);
        this._window.removeEventListener("focus", this.__onNativeFocus, true);
        this._window.removeEventListener("blur", this.__onNativeBlur, true);
      },

      "mshtml" : function()
      {
        qx.event.Manager.removeNativeListener(this._document, "mousedown", this.__onNativeMouseDown);
        qx.event.Manager.removeNativeListener(this._document, "focusin", this.__onNativeFocusIn);
        qx.event.Manager.removeNativeListener(this._document, "focusout", this.__onNativeFocusOut);
      },

      "webkit|opera" : function()
      {
        qx.event.Manager.removeNativeListener(this._document, "mousedown", this.__onNativeMouseDown);
        this._window.removeEventListener("focus", this.__onNativeFocus, false);
        this._window.removeEventListener("blur", this.__onNativeBlur, false);
        qx.event.Manager.removeNativeListener(this._document, "DOMFocusIn", this.__onNativeFocusIn);
      }
    })

  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    var manager = qx.event.Manager;
    manager.registerEventHandler(statics, manager.PRIORITY_FIRST);
  }
});
