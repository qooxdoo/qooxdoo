/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by Schlund + Partner AG, Germany
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sw at schlund dot de>
     * Andreas Ecker (ecker)
       <ae at schlund dot de>

************************************************************************ */

/* ************************************************************************

#module(menu)

************************************************************************ */

/*!
  A small helper class to create a special layout handler for qx.ui.menu.Menus
*/
qx.OO.defineClass("qx.ui.menu.MenuLayout", qx.ui.layout.VerticalBoxLayout, 
function()
{
  qx.ui.layout.VerticalBoxLayout.call(this);

  this.setAnonymous(true);
});


/*!
  Appearance of the widget
*/
qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "menu-layout" });




/*
---------------------------------------------------------------------------
  INIT LAYOUT IMPL
---------------------------------------------------------------------------
*/

/*!
  This creates an new instance of the layout impl this widget uses
*/
qx.Proto._createLayoutImpl = function() {
  return new qx.renderer.layout.MenuLayoutImpl(this);
};
