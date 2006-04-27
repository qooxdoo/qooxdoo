/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(eventcore)

************************************************************************ */

/*!
  A key event instance contains all data for each occured key event
*/
qx.OO.defineClass("qx.event.types.KeyEvent", qx.event.types.DomEvent, 
function(vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget, vKeyCode)
{
  qx.event.types.DomEvent.call(this, vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget);

  this.setKeyCode(vKeyCode);
});

qx.OO.addFastProperty({ name : "keyCode", setOnlyOnce : true, noCompute : true });






/* ************************************************************************
   Class data, properties and methods
************************************************************************ */

/*
---------------------------------------------------------------------------
  CLASS PROPERTIES AND METHODS
---------------------------------------------------------------------------
*/

qx.event.types.KeyEvent.keys =
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
qx.event.types.KeyEvent.codes = {};
for (var i in qx.event.types.KeyEvent.keys) {
  qx.event.types.KeyEvent.codes[qx.event.types.KeyEvent.keys[i]] = i;
};
