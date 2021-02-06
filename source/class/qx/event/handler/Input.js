/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

// Original behavior:
// ================================================================
// Normally a "change" event should occur on blur of the element
// (http://www.w3.org/TR/DOM-Level-2-Events/events.html)

// However this is not true for "file" upload fields

// And this is also not true for checkboxes and radiofields (all non mshtml)
// And this is also not true for select boxes where the selections
// happens in the opened popup (Gecko + Webkit)

// Normalized behavior:
// ================================================================
// Change on blur for textfields, textareas and file
// Instant change event on checkboxes, radiobuttons

// Select field fires on select (when using popup or size>1)
// but differs when using keyboard:
// mshtml+opera=keypress; mozilla+safari=blur

// Input event for textareas does not work in Safari 3 beta (WIN)
// Safari 3 beta (WIN) repeats change event for select box on blur when selected using popup

// Opera fires "change" on radio buttons two times for each change

/**
 * This handler provides an "change" event for all form fields and an
 * "input" event for form fields of type "text" and "textarea".
 *
 * To let these events work it is needed to create the elements using
 * {@link qx.bom.Input}
 */
qx.Class.define("qx.event.handler.Input",
{
  extend : qx.core.Object,
  implement : qx.event.IEventHandler,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._onChangeCheckedWrapper = qx.lang.Function.listener(this._onChangeChecked, this);
    this._onChangeValueWrapper = qx.lang.Function.listener(this._onChangeValue, this);
    this._onInputWrapper = qx.lang.Function.listener(this._onInput, this);
    this._onPropertyWrapper = qx.lang.Function.listener(this._onProperty, this);

    // special event handler for opera
    if ((qx.core.Environment.get("engine.name") == "opera")) {
      this._onKeyDownWrapper = qx.lang.Function.listener(this._onKeyDown, this);
      this._onKeyUpWrapper = qx.lang.Function.listener(this._onKeyUp, this);
    }
  },






  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** @type {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL,

    /** @type {Map} Supported event types */
    SUPPORTED_TYPES :
    {
      input : 1,
      change : 1
    },

    /** @type {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_DOMNODE,

    /** @type {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : false
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // special handling for opera
    __enter : false,
    __onInputTimeoutId : null,

    // stores the former set value for opera and IE
    __oldValue : null,

    // stores the former set value for IE
    __oldInputValue : null,

    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canHandleEvent : function(target, type)
    {
      var lower = target.tagName.toLowerCase();

      if (type === "input" && (lower === "input" || lower === "textarea")) {
        return true;
      }

      if (type === "change" && (lower === "input" || lower === "textarea" || lower === "select")) {
        return true;
      }

      return false;
    },


    // interface implementation
    registerEvent : function(target, type, capture)
    {
      if (
        qx.core.Environment.get("engine.name") == "mshtml" &&
        (qx.core.Environment.get("engine.version") < 9 ||
        (qx.core.Environment.get("engine.version") >= 9 && qx.core.Environment.get("browser.documentmode") < 9))
      )
      {
        if (!target.__inputHandlerAttached)
        {
          var tag = target.tagName.toLowerCase();
          var elementType = target.type;

          if (elementType === "text" || elementType === "password" || tag === "textarea" || elementType === "checkbox" || elementType === "radio") {
            qx.bom.Event.addNativeListener(target, "propertychange", this._onPropertyWrapper);
          }

          if (elementType !== "checkbox" && elementType !== "radio") {
            qx.bom.Event.addNativeListener(target, "change", this._onChangeValueWrapper);
          }

          if (elementType === "text" || elementType === "password") {
            this._onKeyPressWrapped = qx.lang.Function.listener(this._onKeyPress, this, target);
            qx.bom.Event.addNativeListener(target, "keypress", this._onKeyPressWrapped);
          }

          target.__inputHandlerAttached = true;
        }
      }
      else
      {
        if (type === "input")
        {
          this.__registerInputListener(target);
        }
        else if (type === "change")
        {
          if (target.type === "radio" || target.type === "checkbox") {
            qx.bom.Event.addNativeListener(target, "change", this._onChangeCheckedWrapper);
          } else {
            qx.bom.Event.addNativeListener(target, "change", this._onChangeValueWrapper);
          }

          // special enter bugfix for opera
          if ((qx.core.Environment.get("engine.name") == "opera") || (qx.core.Environment.get("engine.name") == "mshtml")) {
            if (target.type === "text" || target.type === "password") {
              this._onKeyPressWrapped = qx.lang.Function.listener(this._onKeyPress, this, target);
              qx.bom.Event.addNativeListener(target, "keypress", this._onKeyPressWrapped);
            }
          }
        }
      }
    },


    __registerInputListener : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function(target)
      {
        if (
          qx.core.Environment.get("engine.version") >= 9 &&
          qx.core.Environment.get("browser.documentmode") >= 9
        ) {
          qx.bom.Event.addNativeListener(target, "input", this._onInputWrapper);

          if (target.type === "text" || target.type === "password" || target.type === "textarea")
          {
            // Fixed input for delete and backspace key
            this._inputFixWrapper = qx.lang.Function.listener(this._inputFix, this, target);
            qx.bom.Event.addNativeListener(target, "keyup", this._inputFixWrapper);
          }
        }
      },

      "webkit" : function(target)
      {
        var tag = target.tagName.toLowerCase();

        // the change event is not fired while typing
        // this has been fixed in the latest nightlies
        if (parseFloat(qx.core.Environment.get("engine.version")) < 532 && tag == "textarea") {
          qx.bom.Event.addNativeListener(target, "keypress", this._onInputWrapper);
        }
        qx.bom.Event.addNativeListener(target, "input", this._onInputWrapper);
      },

      "opera" : function(target) {
        // register key events for filtering "enter" on input events
        qx.bom.Event.addNativeListener(target, "keyup", this._onKeyUpWrapper);
        qx.bom.Event.addNativeListener(target, "keydown", this._onKeyDownWrapper);
        // register an blur event for preventing the input event on blur

        qx.bom.Event.addNativeListener(target, "input", this._onInputWrapper);
      },

      "default" : function(target) {
        qx.bom.Event.addNativeListener(target, "input", this._onInputWrapper);
      }
    }),


    // interface implementation
    unregisterEvent : function(target, type)
    {
      if (
        qx.core.Environment.get("engine.name") == "mshtml" &&
        qx.core.Environment.get("engine.version") < 9 &&
        qx.core.Environment.get("browser.documentmode") < 9
      )
      {
        if (target.__inputHandlerAttached)
        {
          var tag = target.tagName.toLowerCase();
          var elementType = target.type;

          if (elementType === "text" || elementType === "password" || tag === "textarea" || elementType === "checkbox" || elementType === "radio") {
            qx.bom.Event.removeNativeListener(target, "propertychange", this._onPropertyWrapper);
          }

          if (elementType !== "checkbox" && elementType !== "radio") {
            qx.bom.Event.removeNativeListener(target, "change", this._onChangeValueWrapper);
          }

          if (elementType === "text" || elementType === "password") {
            qx.bom.Event.removeNativeListener(target, "keypress", this._onKeyPressWrapped);
          }

          try {
            delete target.__inputHandlerAttached;
          } catch(ex) {
            target.__inputHandlerAttached = null;
          }
        }
      }
      else
      {
        if (type === "input")
        {
          this.__unregisterInputListener(target);
        }
        else if (type === "change")
        {
          if (target.type === "radio" || target.type === "checkbox")
          {
            qx.bom.Event.removeNativeListener(target, "change", this._onChangeCheckedWrapper);
          }
          else
          {
            qx.bom.Event.removeNativeListener(target, "change", this._onChangeValueWrapper);
          }
        }

        if ((qx.core.Environment.get("engine.name") == "opera") || (qx.core.Environment.get("engine.name") == "mshtml")) {
          if (target.type === "text" || target.type === "password") {
            qx.bom.Event.removeNativeListener(target, "keypress", this._onKeyPressWrapped);
          }
        }
      }
    },


    __unregisterInputListener : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function(target)
      {
        if (
          qx.core.Environment.get("engine.version") >= 9 &&
          qx.core.Environment.get("browser.documentmode") >= 9
        ) {
          qx.bom.Event.removeNativeListener(target, "input", this._onInputWrapper);

          if (target.type === "text" || target.type === "password" || target.type === "textarea") {
            // Fixed input for delete and backspace key
            qx.bom.Event.removeNativeListener(target, "keyup", this._inputFixWrapper);
          }
        }
      },

      "webkit" : function(target)
      {
        var tag = target.tagName.toLowerCase();

        // the change event is not fired while typing
        // this has been fixed in the latest nightlies
        if (parseFloat(qx.core.Environment.get("engine.version")) < 532 && tag == "textarea") {
          qx.bom.Event.removeNativeListener(target, "keypress", this._onInputWrapper);
        }
        qx.bom.Event.removeNativeListener(target, "input", this._onInputWrapper);
      },

      "opera" : function(target) {
        // unregister key events for filtering "enter" on input events
        qx.bom.Event.removeNativeListener(target, "keyup", this._onKeyUpWrapper);
        qx.bom.Event.removeNativeListener(target, "keydown", this._onKeyDownWrapper);
        qx.bom.Event.removeNativeListener(target, "input", this._onInputWrapper);
      },

      "default" : function(target) {
        qx.bom.Event.removeNativeListener(target, "input", this._onInputWrapper);
      }
    }),


    /*
    ---------------------------------------------------------------------------
      FOR OPERA AND IE (KEYPRESS TO SIMULATE CHANGE EVENT)
    ---------------------------------------------------------------------------
    */
    /**
     * Handler for fixing the different behavior when pressing the enter key.
     *
     * FF and Safari fire a "change" event if the user presses the enter key.
     * IE and Opera fire the event only if the focus is changed.
     *
     * @signature function(e, target)
     * @param e {Event} DOM event object
     * @param target {Element} The event target
     */
    _onKeyPress : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function(e, target)
      {
        if (e.keyCode === 13) {
          if (target.value !== this.__oldValue) {
            this.__oldValue = target.value;
            qx.event.Registration.fireEvent(target, "change", qx.event.type.Data, [target.value]);
          }
        }
      },

      "opera" : function(e, target)
      {
        if (e.keyCode === 13) {
          if (target.value !== this.__oldValue) {
            this.__oldValue = target.value;
            qx.event.Registration.fireEvent(target, "change", qx.event.type.Data, [target.value]);
          }
        }
      },

      "default" : null
    }),


    /*
    ---------------------------------------------------------------------------
      FOR IE (KEYUP TO SIMULATE INPUT EVENT)
    ---------------------------------------------------------------------------
    */
    /**
     * Handler for fixing the different behavior when pressing the backspace or
     * delete key.
     *
     * The other browsers fire a "input" event if the user presses the backspace
     * or delete key.
     * IE fire the event only for other keys.
     *
     * @signature function(e, target)
     * @param e {Event} DOM event object
     * @param target {Element} The event target
     */
    _inputFix : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function(e, target)
      {
        if (e.keyCode === 46 || e.keyCode === 8)
        {
          if (target.value !== this.__oldInputValue)
          {
            this.__oldInputValue = target.value;
            qx.event.Registration.fireEvent(target, "input", qx.event.type.Data, [target.value]);
          }
        }
      },

      "default" : null
    }),


    /*
    ---------------------------------------------------------------------------
      FOR OPERA ONLY LISTENER (KEY AND BLUR)
    ---------------------------------------------------------------------------
    */
    /**
     * Key event listener for opera which recognizes if the enter key has been
     * pressed.
     *
     * @signature function(e)
     * @param e {Event} DOM event object
     */
    _onKeyDown : qx.core.Environment.select("engine.name",
    {
      "opera" : function(e)
      {
        // enter is pressed
        if (e.keyCode === 13) {
          this.__enter = true;
        }
      },

      "default" : null
    }),


    /**
     * Key event listener for opera which recognizes if the enter key has been
     * pressed.
     *
     * @signature function(e)
     * @param e {Event} DOM event object
     */
    _onKeyUp : qx.core.Environment.select("engine.name",
    {
      "opera" : function(e)
      {
        // enter is pressed
        if (e.keyCode === 13) {
          this.__enter = false;
        }
      },

      "default" : null
    }),


    /*
    ---------------------------------------------------------------------------
      NATIVE EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    /**
     * Internal function called by input elements created using {@link qx.bom.Input}.
     *
     * @signature function(e)
     * @param e {Event} Native DOM event
     */
    _onInput : qx.event.GlobalError.observeMethod(function(e)
    {
      var target = qx.bom.Event.getTarget(e);
      var tag = target.tagName.toLowerCase();
      // ignore native input event when triggered by return in input element
      if (!this.__enter || tag !== "input") {
        // opera lower 10.6 needs a special treatment for input events because
        // they are also fired on blur
        if ((qx.core.Environment.get("engine.name") == "opera") &&
            qx.core.Environment.get("browser.version") < 10.6) {
          this.__onInputTimeoutId = window.setTimeout(function() {
            qx.event.Registration.fireEvent(target, "input", qx.event.type.Data, [target.value]);
          }, 0);
        } else {
          qx.event.Registration.fireEvent(target, "input", qx.event.type.Data, [target.value]);
        }
      }
    }),


    /**
     * Internal function called by input elements created using {@link qx.bom.Input}.
     *
     * @signature function(e)
     * @param e {Event} Native DOM event
     */
    _onChangeValue : qx.event.GlobalError.observeMethod(function(e)
    {
      var target = qx.bom.Event.getTarget(e);
      var data = target.value;

      if (target.type === "select-multiple")
      {
        var data = [];
        for (var i=0, o=target.options, l=o.length; i<l; i++)
        {
          if (o[i].selected) {
            data.push(o[i].value);
          }
        }
      }

      qx.event.Registration.fireEvent(target, "change", qx.event.type.Data, [data]);
    }),


    /**
     * Internal function called by input elements created using {@link qx.bom.Input}.
     *
     * @signature function(e)
     * @param e {Event} Native DOM event
     */
    _onChangeChecked : qx.event.GlobalError.observeMethod(function(e)
    {
      var target = qx.bom.Event.getTarget(e);

      if (target.type === "radio")
      {
        if (target.checked) {
          qx.event.Registration.fireEvent(target, "change", qx.event.type.Data, [target.value]);
        }
      }
      else
      {
        qx.event.Registration.fireEvent(target, "change", qx.event.type.Data, [target.checked]);
      }
    }),


    /**
     * Internal function called by input elements created using {@link qx.bom.Input}.
     *
     * @signature function(e)
     * @param e {Event} Native DOM event
     */
    _onProperty : qx.core.Environment.select("engine.name",
    {
      "mshtml" : qx.event.GlobalError.observeMethod(function(e)
      {
        var target = qx.bom.Event.getTarget(e);
        var prop = e.propertyName;

        if (prop === "value" && (target.type === "text" || target.type === "password" || target.tagName.toLowerCase() === "textarea"))
        {
          if (!target.$$inValueSet) {
            qx.event.Registration.fireEvent(target, "input", qx.event.type.Data, [target.value]);
          }
        }
        else if (prop === "checked")
        {
          if (target.type === "checkbox") {
            qx.event.Registration.fireEvent(target, "change", qx.event.type.Data, [target.checked]);
          } else if (target.checked) {
            qx.event.Registration.fireEvent(target, "change", qx.event.type.Data, [target.value]);
          }
        }
      }),

      "default" : function() {}
    })
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
