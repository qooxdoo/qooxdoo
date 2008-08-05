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

************************************************************************ */

// Original behavior:
// ================================================================
// Normally a "change" event should occour on blur of the element
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
  },






  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL,

    /** {Map} Supported event types */
    SUPPORTED_TYPES :
    {
      input : 1,
      change : 1
    },

    /** {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_DOMNODE,

    /** {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : false
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
    /**
     * @signature function(target, type)
     */
    registerEvent : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(target, type, capture)
      {
        if (!target.__inputHandlerAttached)
        {
          var tag = target.tagName.toLowerCase();
          var type = target.type;

          if (type === "text" || tag === "textarea" || type === "checkbox" || type === "radio") {
            qx.bom.Event.addNativeListener(target, "propertychange", this._onPropertyWrapper);
          }

          if (type !== "checkbox" && type !== "radio") {
            qx.bom.Event.addNativeListener(target, "change", this._onChangeValueWrapper);
          }

          target.__inputHandlerAttached = true;
        }
      },

      "default" : function(target, type, capture)
      {
        if (type === "input")
        {
          qx.bom.Event.addNativeListener(target, "input", this._onInputWrapper);
        }
        else if (type === "change")
        {
          if (target.type === "radio" || target.type === "checkbox")
          {
            qx.bom.Event.addNativeListener(target, "change", this._onChangeCheckedWrapper);
          }
          else
          {
            qx.bom.Event.addNativeListener(target, "change", this._onChangeValueWrapper);
          }
        }
      }
    }),


    // interface implementation
    /**
     * @signature function(target, type)
     */
    unregisterEvent : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(target, type)
      {
        if (!target.__inputHandlerAttached)
        {
          var tag = target.tagName.toLowerCase();
          var type = target.type;

          if (type === "text" || tag === "textarea" || type === "checkbox" || type === "radio") {
            qx.bom.Event.removeNativeListener(target, "propertychange", this._onPropertyWrapper);
          }

          if (type !== "checkbox" && type !== "radio") {
            qx.bom.Event.removeNativeListener(target, "change", this._onChangeValueWrapper);
          }

          delete target.__inputHandlerAttached;
        }
      },

      "default" : function(target, type)
      {
        if (type === "input")
        {
          qx.bom.Event.removeNativeListener(target, "input", this._onInputWrapper);
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
      }
    }),



    /*
    ---------------------------------------------------------------------------
      NATIVE EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    /**
     * Internal function called by input elements created using {@link qx.bom.Input}.
     *
     * @param e {Event} Native DOM event
     * @return {void}
     */
    _onInput : function(e)
    {
      var target = e.target;
      qx.event.Registration.fireEvent(target, "input", qx.event.type.Data, [target.value]);
    },


    /**
     * Internal function called by input elements created using {@link qx.bom.Input}.
     *
     * @param e {Event} Native DOM event
     * @return {void}
     */
    _onChangeValue : function(e)
    {
      var target = e.target || e.srcElement;
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
    },


    /**
     * Internal function called by input elements created using {@link qx.bom.Input}.
     *
     * @param e {Event} Native DOM event
     * @return {void}
     */
    _onChangeChecked : function(e)
    {
      var target = e.target;

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
    },


    /**
     * Internal function called by input elements created using {@link qx.bom.Input}.
     *
     * @signature function(e)
     * @param e {Event} Native DOM event
     * @return {void}
     */
    _onProperty : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(e)
      {
        var target = e.target || e.srcElement;
        var prop = e.propertyName;

        if (prop === "value" && (target.type === "text" || target.tagName.toLowerCase() === "textarea"))
        {
          if (!target.__inValueSet) {
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
      },

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
