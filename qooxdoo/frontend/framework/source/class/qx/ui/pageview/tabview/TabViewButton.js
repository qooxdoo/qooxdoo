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

#module(ui_tabview)

************************************************************************ */

/**
 * @event closetab {qx.event.type.DataEvent}
 */
qx.OO.defineClass("qx.ui.pageview.tabview.TabViewButton", qx.ui.pageview.AbstractPageViewButton,
function(vText, vIcon, vIconWidth, vIconHeight, vFlash) {
  qx.ui.pageview.AbstractPageViewButton.call(this, vText, vIcon, vIconWidth, vIconHeight, vFlash);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "tab-view-button" });



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
 */

/*!
  default Close Tab Button
 */
qx.OO.addProperty({ name : "showCloseButton", type : qx.constant.Type.BOOLEAN, defaultValue : false });

/*!
  Close Tab Icon
 */
qx.OO.addProperty({ name : "closeButtonImage", type : qx.constant.Type.STRING, defaultValue : "icon/16/cancel.png"});







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


qx.Proto._ontabclose = function(e){
  this.createDispatchDataEvent("closetab", this);
}



/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
 */

qx.Proto._modifyShowCloseButton = function(propValue, propOldValue, propData) {

  // if no image exists, then create one
  if(!this._closeButtonImage){
      this._closeButtonImage = new qx.ui.basic.Image(this.getCloseButtonImage());
  }
  if (propValue) {
    this._closeButtonImage.addEventListener(qx.constant.Event.CLICK, this._ontabclose, this);
    this.add(this._closeButtonImage);
    
  } else {
     this.remove(this._closeButtonImage);
     this._closeButtonImage.removeEventListener(qx.constant.Event.CLICK, this._ontabclose);
  }

  return true;
}

qx.Proto._modifyCloseButtonImage = function(propValue, propOldValue, propData) {

  if (qx.util.Validation.isValidString(propValue)){
    
    // cleanly remove the former closeButtonImage
    if (this._closeButtonImage) {
      var oldCloseButtonImage = this._closeButtonImage;
      oldCloseButtonImage.removeEventListener(qx.constant.Event.CLICK, this._ontabclose);
      this.remove(oldCloseButtonImage); 
      oldCloseButtonImage.dispose();
    }

    // assign the new closeButtonImage
    var newCloseButtonImage = this._closeButtonImage = new qx.ui.basic.Image(propValue);
    newCloseButtonImage.addEventListener(qx.constant.Event.CLICK, this._ontabclose, this);
    
    // if the close button is enabled, then add the new image immediatelly
    if(this.getShowCloseButton()){
      this.add(newCloseButtonImage);
    }
  }
  return true;
}



/*
---------------------------------------------------------------------------
  APPEARANCE ADDITIONS
---------------------------------------------------------------------------
*/

qx.Proto._applyStateAppearance = function()
{
  this._states.firstChild = this.isFirstVisibleChild();
  this._states.lastChild = this.isLastVisibleChild();
  this._states.alignLeft = this.getView().getAlignTabsToLeft();
  this._states.barTop = this.getView().getPlaceBarOnTop();

  qx.ui.pageview.AbstractPageViewButton.prototype._applyStateAppearance.call(this);
}




/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
 */

qx.Proto.dispose = function() {
  if (this.getDisposed()) {
    return;
  }
  
  if(this._closeButtonImage){
    this._closeButtonImage.dispose();
    this._closeButtonImage = null;
  }
  
  return qx.ui.pageview.AbstractPageViewButton.prototype.dispose.call(this);
}
