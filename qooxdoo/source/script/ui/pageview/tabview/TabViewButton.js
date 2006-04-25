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

qx.OO.defineClass("qx.ui.pageview.tabview.TabViewButton", qx.ui.pageview.AbstractPageViewButton, 
function(vText, vIcon, vIconWidth, vIconHeight, vFlash) {
  qx.ui.pageview.AbstractPageViewButton.call(this, vText, vIcon, vIconWidth, vIconHeight, vFlash);
});

qx.ui.pageview.tabview.TabViewButton.changeProperty({ name : "appearance", type : qx.Const.TYPEOF_STRING, defaultValue : "tab-view-button" });






/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onkeydown = function(e)
{
  switch(e.getKeyCode())
  {
    case qx.event.types.KeyEvent.keys.enter:
    case qx.event.types.KeyEvent.keys.space:
      // there is no toggeling, just make it checked
      this.setChecked(true);
      break;

    case qx.event.types.KeyEvent.keys.left:
      var vPrev = this.getPreviousSibling() || this.getParent().getLastChild();
      if (vPrev && vPrev != this)
      {
        // we want to enable the outline border, because
        // the user used the keyboard for activation
        delete qx.event.handler.FocusHandler.mouseFocus;

        // focus previous tab
        vPrev.setFocused(true);

        // and naturally make it also checked
        vPrev.setChecked(true);
      };
      break;

    case qx.event.types.KeyEvent.keys.right:
      var vNext = this.getNextSibling() || this.getParent().getFirstVisibleChild();
      if (vNext && vNext != this)
      {
        // we want to enable the outline border, because
        // the user used the keyboard for activation
        delete qx.event.handler.FocusHandler.mouseFocus;

        // focus next tab
        vNext.setFocused(true);

        // and naturally make it also checked
        vNext.setChecked(true);
      };
      break;
  };
};
