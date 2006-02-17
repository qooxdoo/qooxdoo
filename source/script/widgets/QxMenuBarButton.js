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

function QxMenuBarButton(vText, vMenu, vIcon, vIconWidth, vIconHeight, vFlash) {
  QxToolBarMenuButton.call(this, vText, vMenu, vIcon, vIconWidth, vIconHeight, vFlash);
};

QxMenuBarButton.extend(QxToolBarMenuButton, "QxMenuBarButton");
