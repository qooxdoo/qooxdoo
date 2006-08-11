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


************************************************************************ */

qx.OO.defineClass("qx.ui.pageview.buttonview.ButtonViewButton", qx.ui.pageview.AbstractPageViewButton, 
function(vText, vIcon, vIconWidth, vIconHeight, vFlash) {
  qx.ui.pageview.AbstractPageViewButton.call(this, vText, vIcon, vIconWidth, vIconHeight, vFlash);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "bar-view-button" });






/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onkeydown = function(e)
{
  switch(this.getView().getBarPosition())
  {
    case qx.constant.Layout.ALIGN_TOP:
    case qx.constant.Layout.ALIGN_BOTTOM:
      switch(e.getKeyCode())
      {
        case qx.event.type.KeyEvent.keys.left:
          var vPrevious = true;
          break;

        case qx.event.type.KeyEvent.keys.right:
          var vPrevious = false;
          break;

        default:
          return;
      }

      break;

    case qx.constant.Layout.ALIGN_LEFT:
    case qx.constant.Layout.ALIGN_RIGHT:
      switch(e.getKeyCode())
      {
        case qx.event.type.KeyEvent.keys.up:
          var vPrevious = true;
          break;

        case qx.event.type.KeyEvent.keys.down:
          var vPrevious = false;
          break;

        default:
          return;
      }

      break;

    default:
      return;
  }

  var vChild = vPrevious ? this.isFirstChild() ? this.getParent().getLastChild() : this.getPreviousSibling() : this.isLastChild() ? this.getParent().getFirstChild() : this.getNextSibling();

  // focus next/previous button
  vChild.setFocused(true);

  // and naturally also check it
  vChild.setChecked(true);
}
