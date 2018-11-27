/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/**
 * @require(qx.theme.clean.MImage) 
 * @require(qx.theme.clean.MAtom)
 * @require(qx.theme.clean.MHeaderCell)
 * @require(qx.theme.clean.MFreestyleCss)
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
    
	  // Prep the Image widget to have font and SVG handling abilities
	  qx.Class.include(qx.ui.basic.Image, qx.theme.clean.MImage);
	  
	  // Prep Atoms to have image property handling abilities
	  qx.Class.include(qx.ui.basic.Atom, qx.theme.clean.MAtom);
	  
	  // Prep tables Header Cell to have image property handling abilities
	  qx.Class.include(qx.ui.table.headerrenderer.HeaderCell, qx.theme.clean.MHeaderCell);
	  
	  // Add the beforeContent property to the Decorator class
    qx.Class.include(qx.ui.decoration.Decorator, qx.theme.clean.MFreestyleCss);
    
    // patch the _place method of the MPlacement Mixin for Popups class
	  qx.Class.include(qx.ui.popup.Popup, qx.theme.clean.MPlacement);
  }
});