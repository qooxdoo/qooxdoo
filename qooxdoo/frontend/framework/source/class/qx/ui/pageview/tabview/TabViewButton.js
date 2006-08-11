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

************************************************************************ */

/* ************************************************************************

#module(tabview)

************************************************************************ */

qx.OO.defineClass("qx.ui.pageview.tabview.TabViewButton", qx.ui.pageview.AbstractPageViewButton,
function(vText, vIcon, vIconWidth, vIconHeight, vFlash) {
  qx.ui.pageview.AbstractPageViewButton.call(this, vText, vIcon, vIconWidth, vIconHeight, vFlash);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "tab-view-button" });






/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onkeydown = function(e)
{
  switch(e.getKeyCode())
  {
    case qx.event.type.KeyEvent.keys.enter:
    case qx.event.type.KeyEvent.keys.space:
      // there is no toggeling, just make it checked
      this.setChecked(true);
      break;

    case qx.event.type.KeyEvent.keys.left:
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
      }
      break;

    case qx.event.type.KeyEvent.keys.right:
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
      }
      break;
  }
}
