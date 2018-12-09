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
 * @require(qx.theme.clean.MPlacement)
 * @require(qx.theme.clean.Animation)
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

    //Make popups not so snappy by switching this FLAG to true 
    var smoothpopups = false;

    var smoothpopustheme = "";

    
    // MANDATORY Mixins

	  // Prep the Image widget to have font and SVG handling abilities
	  qx.Class.include(qx.ui.basic.Image, qx.theme.clean.MImage);
	  
	  // Prep Atoms to have image property handling abilities
	  qx.Class.include(qx.ui.basic.Atom, qx.theme.clean.MAtom);
	  
	  // Prep tables Header Cell to have image property handling abilities
	  qx.Class.include(qx.ui.table.headerrenderer.HeaderCell, qx.theme.clean.MHeaderCell);
	  
	  // Add the beforeContent property to the Decorator class
    qx.Class.include(qx.ui.decoration.Decorator, qx.theme.clean.MFreestyleCss);
    
    // patch the _place method of the MPlacement Mixin for Popups class
    qx.Class.patch(qx.ui.popup.Popup, qx.theme.clean.MPlacement);

    qx.Mixin.define("qx.theme.clean.MSelectBox",
    {
      construct : function() {
        this.getChildControl("popup").addListener("appear", function(e) {
          this.getChildControl("popup").fadeIn(200);
          //var domtable = this.getChildControl("popup").getContentElement().getDomElement();
          //qx.bom.element.Animation.animate(domtable, this.getChildControl("popup").hasState("placementBottom") ? qx.theme.clean.Animation.ANIMATIONS["fadegrowdown"] : qx.theme.clean.Animation.ANIMATIONS["fadegrowup"]);
        }, this);

        //Adjust offset
        this.getChildControl("popup").setOffsetTop(-2);
        this.getChildControl("popup").setOffsetBottom(-2);
      }
    });

    qx.Class.include(qx.ui.form.SelectBox, qx.theme.clean.MSelectBox);

  }
});