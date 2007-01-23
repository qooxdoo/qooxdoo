/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(ui_core)

************************************************************************ */

/**
 * A key event instance contains all data for each occured key event
 *
 * @param vType {String} event type (keydown, keypress, keyinput, keyup)
 * @param vDomEvent {Element} DOM event object
 * @param vDomTarget {Element} target element of the DOM event
 * @param vTarget
 * @param vOriginalTarget
 * @param vKeyCode {Integer}
 * @param vCharCode {Integer}
 * @param vKeyIdentifier {String}
 */
qx.OO.defineClass("qx.event.type.KeyEvent", qx.event.type.DomEvent,
function(vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget, vKeyCode, vCharCode, vKeyIdentifier)
{
  qx.event.type.DomEvent.call(this, vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget);

  this.setKeyCode(vKeyCode);
  this.setCharCode(vCharCode);
  this.setKeyIdentifier(vKeyIdentifier);
});

/**
 * Legacy keycode
 * @deprecated Will be removed with qooxdoo 0.7
 */
qx.OO.addFastProperty({ name : "keyCode", setOnlyOnce : true, noCompute : true });

/**
 * Unicode number of the pressed character.
 * Only valid in "keyinput" events
 */
qx.OO.addFastProperty({ name : "charCode", setOnlyOnce : true, noCompute : true });

/**
 * Identifier of the pressed key. This property is modeled after the <em>KeyboardEvent.keyIdentifier</em> property
 * of the W3C DOM 3 event specification (http://www.w3.org/TR/2003/NOTE-DOM-Level-3-Events-20031107/events.html#Events-KeyboardEvent-keyIdentifier).
 *
 * It is not valid in "keyinput" events"
 *
 * Printable keys are represented by a unicode string, non-printable keys have one of the following
 * values:
 * <br>
 * <table>
 * <tr><td>Backspace</td><td>The Backspace (Back) key.</td></tr>
 * <tr><td>Tab</td><td>The Horizontal Tabulation (Tab) key.</td></tr>
 * <tr><td>Space</td><td>The Space (Spacebar) key.</td></tr>
 * <tr><td>Enter</td><td>The Enter key. Note: This key identifier is also used for the Return (Macintosh numpad) key.</td></tr>
 * <tr><td>Shift</td><td>The Shift key.</td></tr>
 * <tr><td>Control</td><td>The Control (Ctrl) key.</td></tr>
 * <tr><td>Alt</td><td>The Alt (Menu) key.</td></tr>
 * <tr><td>CapsLock</td><td>The CapsLock key</td></tr>
 * <tr><td>Meta</td><td>The Meta key. (Apple Meta and Windows key)</td></tr>
 * <tr><td>Escape</td><td>The Escape (Esc) key.</td></tr>
 * <tr><td>Left</td><td>The Left Arrow key.</td></tr>
 * <tr><td>Up</td><td>The Up Arrow key.</td></tr>
 * <tr><td>Right</td><td>The Right Arrow key.</td></tr>
 * <tr><td>Down</td><td>The Down Arrow key.</td></tr>
 * <tr><td>PageUp</td><td>The Page Up key.</td></tr>
 * <tr><td>PageDown</td><td>The Page Down (Next) key.</td></tr>
 * <tr><td>End</td><td>The End key.</td></tr>
 * <tr><td>Home</td><td>The Home key.</td></tr>
 * <tr><td>Insert</td><td>The Insert (Ins) key. (Does not fire in Opera/Win)</td></tr>
 * <tr><td>Delete</td><td>The Delete (Del) Key.</td></tr>
 * <tr><td>F1</td><td>The F1 key.</td></tr>
 * <tr><td>F2</td><td>The F2 key.</td></tr>
 * <tr><td>F3</td><td>The F3 key.</td></tr>
 * <tr><td>F4</td><td>The F4 key.</td></tr>
 * <tr><td>F5</td><td>The F5 key.</td></tr>
 * <tr><td>F6</td><td>The F6 key.</td></tr>
 * <tr><td>F7</td><td>The F7 key.</td></tr>
 * <tr><td>F8</td><td>The F8 key.</td></tr>
 * <tr><td>F9</td><td>The F9 key.</td></tr>
 * <tr><td>F10</td><td>The F10 key.</td></tr>
 * <tr><td>F11</td><td>The F11 key.</td></tr>
 * <tr><td>F12</td><td>The F12 key.</td></tr>
 * <tr><td>NumLock</td><td>The Num Lock key.</td></tr>
 * <tr><td>PrintScreen</td><td>The Print Screen (PrintScrn, SnapShot) key.</td></tr>
 * <tr><td>Scroll</td><td>The scroll lock key</td></tr>
 * <tr><td>Pause</td><td>The pause/break key</td></tr>
 * <tr><td>Win</td><td>The Windows Logo key</td></tr>
 * <tr><td>Apps</td><td>The Application key (Windows Context Menu)</td></tr>
 * </table>
 */
qx.OO.addFastProperty({ name : "keyIdentifier", setOnlyOnce : true, noCompute : true });








/* ************************************************************************
   Class data, properties and methods
************************************************************************ */

/*
---------------------------------------------------------------------------
  CLASS PROPERTIES AND METHODS
---------------------------------------------------------------------------
*/

/**
 * Mapping of the old key identifiers to the key codes
 * @deprecated
 */
qx.event.type.KeyEvent.keys =
{
  esc : 27,
  enter : 13,
  tab : 9,
  space : 32,

  up : 38,
  down : 40,
  left : 37,
  right : 39,

  shift : 16,
  ctrl : 17,
  alt : 18,

  f1 : 112,
  f2 : 113,
  f3 : 114,
  f4 : 115,
  f5 : 116,
  f6 : 117,
  f7 : 118,
  f8 : 119,
  f9 : 120,
  f10 : 121,
  f11 : 122,
  f12 : 123,

  print : 124,

  del : 46,
  backspace : 8,
  insert : 45,
  home : 36,
  end : 35,

  pageup : 33,
  pagedown : 34,

  numlock : 144,

  numpad_0 : 96,
  numpad_1 : 97,
  numpad_2 : 98,
  numpad_3 : 99,
  numpad_4 : 100,
  numpad_5 : 101,
  numpad_6 : 102,
  numpad_7 : 103,
  numpad_8 : 104,
  numpad_9 : 105,

  numpad_divide : 111,
  numpad_multiply : 106,
  numpad_minus : 109,
  numpad_plus : 107
};

// create dynamic codes copy
(function() {
  qx.event.type.KeyEvent.codes = {};
  for (var i in qx.event.type.KeyEvent.keys) {
    qx.event.type.KeyEvent.codes[qx.event.type.KeyEvent.keys[i]] = i;
  }
})();
