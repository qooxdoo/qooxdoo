/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Normalization for native keyboard events.
 *
 * NOTE: Some browsers won't fire the <code>keypress</code> event for all keys.
 * It's generally better to listen for <code>keyup</code> or <code>keydown</code>
 * instead.
 *
 * @require(qx.module.Event)
 * @require(qx.module.Environment)
 *
 * @group (Event_Normalization)
 */
qx.Bootstrap.define("qx.module.event.Keyboard", {
  statics :
  {
    /**
     * List of event types to be normalized
     */
    TYPES : ["keydown", "keypress", "keyup"],


    /**
     * List qx.module.event.Keyboard methods to be attached to native mouse event
     * objects
     * @internal
     */
    BIND_METHODS : ["getKeyIdentifier"],


    /**
     * Identifier of the pressed key. This property is modeled after the <em>KeyboardEvent.keyIdentifier</em> property
     * of the W3C DOM 3 event specification
     * (http://www.w3.org/TR/2003/NOTE-DOM-Level-3-Events-20031107/events.html#Events-KeyboardEvent-keyIdentifier).
     *
     * Printable keys are represented by an unicode string, non-printable keys
     * have one of the following values:
     *
     * <table>
     * <tr><th>Backspace</th><td>The Backspace (Back) key.</td></tr>
     * <tr><th>Tab</th><td>The Horizontal Tabulation (Tab) key.</td></tr>
     * <tr><th>Space</th><td>The Space (Spacebar) key.</td></tr>
     * <tr><th>Enter</th><td>The Enter key. Note: This key identifier is also used for the Return (Macintosh numpad) key.</td></tr>
     * <tr><th>Shift</th><td>The Shift key.</td></tr>
     * <tr><th>Control</th><td>The Control (Ctrl) key.</td></tr>
     * <tr><th>Alt</th><td>The Alt (Menu) key.</td></tr>
     * <tr><th>CapsLock</th><td>The CapsLock key</td></tr>
     * <tr><th>Meta</th><td>The Meta key. (Apple Meta and Windows key)</td></tr>
     * <tr><th>Escape</th><td>The Escape (Esc) key.</td></tr>
     * <tr><th>Left</th><td>The Left Arrow key.</td></tr>
     * <tr><th>Up</th><td>The Up Arrow key.</td></tr>
     * <tr><th>Right</th><td>The Right Arrow key.</td></tr>
     * <tr><th>Down</th><td>The Down Arrow key.</td></tr>
     * <tr><th>PageUp</th><td>The Page Up key.</td></tr>
     * <tr><th>PageDown</th><td>The Page Down (Next) key.</td></tr>
     * <tr><th>End</th><td>The End key.</td></tr>
     * <tr><th>Home</th><td>The Home key.</td></tr>
     * <tr><th>Insert</th><td>The Insert (Ins) key. (Does not fire in Opera/Win)</td></tr>
     * <tr><th>Delete</th><td>The Delete (Del) Key.</td></tr>
     * <tr><th>F1</th><td>The F1 key.</td></tr>
     * <tr><th>F2</th><td>The F2 key.</td></tr>
     * <tr><th>F3</th><td>The F3 key.</td></tr>
     * <tr><th>F4</th><td>The F4 key.</td></tr>
     * <tr><th>F5</th><td>The F5 key.</td></tr>
     * <tr><th>F6</th><td>The F6 key.</td></tr>
     * <tr><th>F7</th><td>The F7 key.</td></tr>
     * <tr><th>F8</th><td>The F8 key.</td></tr>
     * <tr><th>F9</th><td>The F9 key.</td></tr>
     * <tr><th>F10</th><td>The F10 key.</td></tr>
     * <tr><th>F11</th><td>The F11 key.</td></tr>
     * <tr><th>F12</th><td>The F12 key.</td></tr>
     * <tr><th>NumLock</th><td>The Num Lock key.</td></tr>
     * <tr><th>PrintScreen</th><td>The Print Screen (PrintScrn, SnapShot) key.</td></tr>
     * <tr><th>Scroll</th><td>The scroll lock key</td></tr>
     * <tr><th>Pause</th><td>The pause/break key</td></tr>
     * <tr><th>Win</th><td>The Windows Logo key</td></tr>
     * <tr><th>Apps</th><td>The Application key (Windows Context Menu)</td></tr>
     * </table>
     *
     * @return {String} The key identifier
     */
    getKeyIdentifier : function()
    {
      if (this.type == "keypress" &&
      (qxWeb.env.get("engine.name") != "gecko" || this.charCode !== 0))
      {
        return qx.event.util.Keyboard.charCodeToIdentifier(this.charCode || this.keyCode);
      }
      return qx.event.util.Keyboard.keyCodeToIdentifier(this.keyCode);
    },


    /**
     * Manipulates the native event object, adding methods if they're not
     * already present
     *
     * @param event {Event} Native event object
     * @param element {Element} DOM element the listener was attached to
     * @return {Event} Normalized event object
     * @internal
     */
    normalize : function(event, element) {
      if (!event) {
        return event;
      }
      var bindMethods = qx.module.event.Keyboard.BIND_METHODS;
      for (var i=0, l=bindMethods.length; i<l; i++) {
        if (typeof event[bindMethods[i]] != "function") {
          event[bindMethods[i]] = qx.module.event.Keyboard[bindMethods[i]].bind(event);
        }
      }

      return event;
    },


    /**
     * IE9 will not fire an "input" event on text input elements if the user changes
     * the field's value by pressing the Backspace key. We fix this by listening
     * for the "keyup" event and emitting the missing event if necessary
     *
     * @param element {Element} Target element
     * @internal
     */
    registerInputFix : function(element) {
      if (element.type === "text" || element.type === "password" || element.type === "textarea")
      {
        if (!element.__inputFix) {
          element.__inputFix = qxWeb(element).on("keyup", qx.module.event.Keyboard._inputFix);
        }
      }
    },


    /**
     * Removes the IE9 input event fix
     *
     * @param element {Element} target element
     * @internal
     */
    unregisterInputFix : function(element) {
      if (element.__inputFix && !qxWeb(element).hasListener("input")) {
        qxWeb(element).off("keyup", qx.module.event.Keyboard._inputFix);
        element.__inputFix = null;
      }
    },


    /**
     * IE9 fix: Emits an "input" event if a text input element's value was changed
     * using the Backspace key
     * @param ev {Event} Keyup event
     */
    _inputFix : function(ev) {
      if (ev.getKeyIdentifier() !== "Backspace") {
        return;
      }
      var target = ev.getTarget();
      var newValue = qxWeb(target).getValue();

      if (!target.__oldInputValue || target.__oldInputValue !== newValue) {
        target.__oldInputValue = newValue;
        ev.type = ev._type = "input";
        target.$$emitter.emit("input", ev);
      }
    }
  },

  defer : function(statics) {
    qxWeb.$registerEventNormalization(qx.module.event.Keyboard.TYPES, statics.normalize);

    if (qxWeb.env.get("engine.name") === "mshtml" && qxWeb.env.get("browser.documentmode") === 9)
    {
      qxWeb.$registerEventHook("input", statics.registerInputFix, statics.unregisterInputFix);
    }
  }
});
