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

#package(toolbar)

************************************************************************ */

function QxToolBarButton(vText, vIcon, vIconWidth, vIconHeight, vFlash) 
{
  QxButton.call(this, vText, vIcon, vIconWidth, vIconHeight, vFlash);
  
  // Omit focus
  this.setTabIndex(-1);
};

QxToolBarButton.extend(QxButton, "QxToolBarButton");

QxToolBarButton.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "toolbar-button" });





/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

proto._onkeydown = QxUtil.returnTrue;
proto._onkeyup = QxUtil.returnTrue;
