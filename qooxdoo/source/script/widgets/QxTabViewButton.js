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

#package(tabview)

************************************************************************ */

function QxTabViewButton(vText, vIcon, vIconWidth, vIconHeight, vFlash) {
  QxCommonViewButton.call(this, vText, vIcon, vIconWidth, vIconHeight, vFlash);
};

QxTabViewButton.extend(QxCommonViewButton, "QxTabViewButton");

QxTabViewButton.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "tab-view-button" });






/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

proto._onkeydown = function(e)
{
  switch(e.getKeyCode())
  {
    case QxKeyEvent.keys.enter:
    case QxKeyEvent.keys.space:
      // there is no toggeling, just make it checked
      this.setChecked(true);
      break;

    case QxKeyEvent.keys.left:
      var vPrev = this.getPreviousSibling() || this.getParent().getLastChild();
      if (vPrev && vPrev != this)
      {
        // we want to enable the outline border, because
        // the user used the keyboard for activation
        delete QxFocusManager.mouseFocus;

        // focus previous tab
        vPrev.setFocused(true);

        // and naturally make it also checked
        vPrev.setChecked(true);
      };
      break;

    case QxKeyEvent.keys.right:
      var vNext = this.getNextSibling() || this.getParent().getFirstVisibleChild();
      if (vNext && vNext != this)
      {
        // we want to enable the outline border, because
        // the user used the keyboard for activation
        delete QxFocusManager.mouseFocus;

        // focus next tab
        vNext.setFocused(true);

        // and naturally make it also checked
        vNext.setChecked(true);
      };
      break;
  };
};
