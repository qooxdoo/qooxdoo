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

#package(menu)

************************************************************************ */

/*!
  A small helper class to create a special layout handler for QxMenus
*/
function QxMenuLayout() 
{
  QxVerticalBoxLayout.call(this);
  
  this.setAnonymous(true);
};

QxMenuLayout.extend(QxVerticalBoxLayout, "QxMenuLayout");


/*!
  Appearance of the widget
*/
QxMenuLayout.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "menu-layout" });




/*
---------------------------------------------------------------------------
  INIT LAYOUT IMPL
---------------------------------------------------------------------------
*/

/*!
  This creates an new instance of the layout impl this widget uses
*/
proto._createLayoutImpl = function() {
  return new QxMenuLayoutImpl(this);
};
