/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Create a new instance of qx.nls.Date
 */
qx.OO.defineClass("qx.locale.Key");


/**
 * Return localized name of a key identifier
 * @see(qx.event.handler.KeyEventHandler)
 *
 * @param size {string} format of the key identifier.
 *     Possible values: "short", "full"
 * @param keyIdentifier {string} key identifier to translate @see(qx.event.handler.KeyEventHandler)
 * @param locale {string} optional locale to be used
 * @return {qx.locale.manager.LocalizedString} localized key name
 */
qx.Class.getKeyName = function(size, keyIdentifier, locale) {
  if (
    size != "short" &&
    size != "full"
  ) {
    throw new Error('format must be one of: "short", "full"');
  }

  var key = "key_" + size + "_" + keyIdentifier;
  var localizedKey = new qx.locale.manager.LocalizedString(key, [], locale);
  if (localizedKey == key) {
    return qx.locale.Key._keyNames[key] || keyIdentifier;
  } else {
    return localizedKey;
  }
};


( function() {
  var keyNames = {};
  var Manager = qx.locale.manager.Manager;

  keyNames[Manager.marktr("key_short_Backspace")] = "Backspace";
  keyNames[Manager.marktr("key_short_Tab")] = "Tab";
  keyNames[Manager.marktr("key_short_Space")] = "Space";
  keyNames[Manager.marktr("key_short_Enter")] = "Enter";
  keyNames[Manager.marktr("key_short_Shift")] = "Shift";
  keyNames[Manager.marktr("key_short_Control")] = "Ctrl";
  keyNames[Manager.marktr("key_short_Alt")] = "Alt";
  keyNames[Manager.marktr("key_short_CapsLock")] = "Caps";
  keyNames[Manager.marktr("key_short_Meta")] = "Meta";
  keyNames[Manager.marktr("key_short_Escape")] = "Esc";
  keyNames[Manager.marktr("key_short_Left")] = "Left";
  keyNames[Manager.marktr("key_short_Up")] = "Up";
  keyNames[Manager.marktr("key_short_Right")] = "Right";
  keyNames[Manager.marktr("key_short_Down")] = "Down";
  keyNames[Manager.marktr("key_short_PageUp")] = "PgUp";
  keyNames[Manager.marktr("key_short_PageDown")] = "PgDn";
  keyNames[Manager.marktr("key_short_End")] = "End";
  keyNames[Manager.marktr("key_short_Home")] = "Home";
  keyNames[Manager.marktr("key_short_Insert")] = "Ins";
  keyNames[Manager.marktr("key_short_Delete")] = "Del";
  keyNames[Manager.marktr("key_short_NumLock")] = "Num";
  keyNames[Manager.marktr("key_short_PrintScreen")] = "Print";
  keyNames[Manager.marktr("key_short_Scroll")] = "Scroll";
  keyNames[Manager.marktr("key_short_Pause")] = "Pause";
  keyNames[Manager.marktr("key_short_Win")] = "Win";
  keyNames[Manager.marktr("key_short_Apps")] = "Apps";

  keyNames[Manager.marktr("key_full_Backspace")] = "Backspace";
  keyNames[Manager.marktr("key_full_Tab")] = "Tabulator";
  keyNames[Manager.marktr("key_full_Space")] = "Space";
  keyNames[Manager.marktr("key_full_Enter")] = "Enter";
  keyNames[Manager.marktr("key_full_Shift")] = "Shift";
  keyNames[Manager.marktr("key_full_Control")] = "Control";
  keyNames[Manager.marktr("key_full_Alt")] = "Alt";
  keyNames[Manager.marktr("key_full_CapsLock")] = "CapsLock";
  keyNames[Manager.marktr("key_full_Meta")] = "Meta";
  keyNames[Manager.marktr("key_full_Escape")] = "Escape";
  keyNames[Manager.marktr("key_full_Left")] = "Left";
  keyNames[Manager.marktr("key_full_Up")] = "Up";
  keyNames[Manager.marktr("key_full_Right")] = "Right";
  keyNames[Manager.marktr("key_full_Down")] = "Down";
  keyNames[Manager.marktr("key_full_PageUp")] = "PageUp";
  keyNames[Manager.marktr("key_full_PageDown")] = "PageDown";
  keyNames[Manager.marktr("key_full_End")] = "End";
  keyNames[Manager.marktr("key_full_Home")] = "Home";
  keyNames[Manager.marktr("key_full_Insert")] = "Insert";
  keyNames[Manager.marktr("key_full_Delete")] = "Delete";
  keyNames[Manager.marktr("key_full_NumLock")] = "NumLock";
  keyNames[Manager.marktr("key_full_PrintScreen")] = "PrintScreen";
  keyNames[Manager.marktr("key_full_Scroll")] = "Scroll";
  keyNames[Manager.marktr("key_full_Pause")] = "Pause";
  keyNames[Manager.marktr("key_full_Win")] = "Win";
  keyNames[Manager.marktr("key_full_Apps")] = "Apps";
  qx.Class._keyNames = keyNames;
}) ();