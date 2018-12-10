/* ************************************************************************

   SQville Software

   http://sqville.com

   Copyright:
     None

   License:
     MIT

   Authors:
     * Chris Eskew (chris.eskew@sqville.com)

************************************************************************ */

/**
 * A mixin that enables the font property, and thus, font handling abilities to the Image object
 * This mixin is needed to enable font icons to show up using the Font object
 */
qx.Mixin.define("qx.theme.clean.MSelectBox", {
    
  construct : function() {
    
    //***  CODE for applying popup fading in and out  ***//

    //this.getChildControl("popup").addListener("appear", function(e) {
    //  this.getChildControl("popup").fadeIn(200);
      //var domtable = this.getChildControl("popup").getContentElement().getDomElement();
      //qx.bom.element.Animation.animate(domtable, this.getChildControl("popup").hasState("placementBottom") ? qx.theme.clean.Animation.ANIMATIONS["fadegrowdown"] : qx.theme.clean.Animation.ANIMATIONS["fadegrowup"]);
    //}, this);

    //Adjust offset
    this.getChildControl("popup").setOffsetTop(-2);
    this.getChildControl("popup").setOffsetBottom(-2);
  }
});