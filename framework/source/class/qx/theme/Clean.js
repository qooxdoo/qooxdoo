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
 * 
 * ========================================
 * ==== Require new Clean theme Mixins ====
 * ========================================
 * @require(qx.theme.clean.MImage) 
 * @require(qx.theme.clean.MAtom)
 * @require(qx.theme.clean.MHeaderCell)
 * @require(qx.theme.clean.MFreestyleCss)
 * @require(qx.theme.clean.MPlacement)
 * @require(qx.theme.clean.MSelectBox)
 * 
 * ========================================
 * ==== Require new Clean theme Class =====
 * ========================================
 * @require(qx.theme.clean.Animation)
 * 
 * ========================================
 * ==== Require existing Qx classes =======
 * ========================================
 * @require(qx.ui.basic.Image)
 * @require(qx.ui.basic.Atom)
 * @require(qx.ui.table.headerrenderer.HeaderCell)
 * @require(qx.ui.popup.Popup)
 * @require(qx.ui.form.SelectBox)
 * @require(qx.ui.tree.core.AbstractItem)
 * 
 */

qx.Theme.define("qx.theme.Clean",
{
  meta :
  {
    color : qx.theme.clean.Color,
    decoration : qx.theme.clean.Decoration,
    font : qx.theme.clean.Font,
    icon : qx.theme.icon.Material,
    appearance : qx.theme.clean.Appearance
  },
  
  boot : function(){
  	/****************************************
       *  Mixin new clean-theme features 
       ****************************************/

    //*** FLAGS to turn on/off theme features ****

    // Make popups not so snappy by switching this FLAG to true
    // PURPOSE = Make popups fade in and out by default, and to control the speed in which they show and hide
    // STATUS = NOT STARTED - future feature 
    //var smoothpopups = false;
    //var smoothpopustheme = "";

    
    // MANDATORY Mixins

	  // Prep the Image widget to have font and SVG handling abilities
	  qx.Class.include(qx.ui.basic.Image, qx.theme.clean.MImage);
	  
	  // Prep Atoms to have image property handling abilities
	  qx.Class.include(qx.ui.basic.Atom, qx.theme.clean.MAtom);
	  
	  // Prep tables Header Cell to have image property handling abilities
	  qx.Class.include(qx.ui.table.headerrenderer.HeaderCell, qx.theme.clean.MHeaderCell);
	  
	  // Enables adding CSS to tag and psudo classes (after and before) to the Decorator class
    qx.Class.include(qx.ui.decoration.Decorator, qx.theme.clean.MFreestyleCss);
    
    // patch the _place method of the MPlacement Mixin for Popups class
    qx.Class.patch(qx.ui.popup.Popup, qx.theme.clean.MPlacement);

    // Adjusts popup offset to allow for smoother transitions for SelectBox
    qx.Class.include(qx.ui.form.SelectBox, qx.theme.clean.MSelectBox);

    // Prep Tree Items to have image property handling abilities
    qx.Class.include(qx.ui.tree.core.AbstractItem, qx.theme.clean.MAtom);

  }
});