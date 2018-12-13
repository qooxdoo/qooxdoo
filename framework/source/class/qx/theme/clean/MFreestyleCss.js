/* ************************************************************************

   SQville Software

   http://sqville.com

   Copyright:
     None

   License:
     MIT: http://

   Authors:
     * Chris Eskew (chris.eskew@sqville.com)

************************************************************************ */
/**
 * Custom (Freestyle) CSS/CSS3 implementation
 * This mixin is used by {@link qx.ui.decoration.Decorator}.
 */
qx.Mixin.define("qx.theme.clean.MFreestyleCss",
{
  
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTY: CSS ICON NAME
    ---------------------------------------------------------------------------
    */
    
    /** name of freesytle css block*/
    freestyleCss :
    {
      nullable : true,
      check : "String",
      init : "",
      apply : "_applyFreestyleCss"
    }    
  },


  members :
  {        
    /**
     * Takes a styles map and adds CSS/CSS3 entries in place
     * to the given map. This is the needed behavior for
     * {@link qx.ui.decoration.Decorator}.
     *
     * @param styles {Map} A map to add the styles.
     */
    _styleFreestyleCss : function(styles)
    {
	  var iconname = this.getFreestyleCss();
	  if (iconname.length > 0) {
	  	
	  	var sudostylemap = qx.theme.clean.Image.CSSICONS[iconname]; 
	  	
	  	//establish env specific property names
	  	// Border Radius
	  	var borderradiuspropName = qx.core.Environment.get("css.borderradius");
			borderradiuspropName = qx.bom.Style.getCssName(borderradiuspropName);
			// Transform
			var transformpropName = qx.core.Environment.get("css.transform");
			transformpropName = qx.bom.Style.getCssName(transformpropName.name);
	  	// Animations
			var animationpropName = qx.core.Environment.get("css.animation");
			animationpropName = qx.bom.Style.getCssName(animationpropName.name);
	  	// Box Shadow
	  	var boxshadowpropName = qx.core.Environment.get("css.boxshadow");
			boxshadowpropName = qx.bom.Style.getCssName(boxshadowpropName);
	  	
	  	//variables for looping
	  	var entryval;
	  	
	  	this._includeFreestyleStyles(sudostylemap);

	  	//general loop to add content based on map
	  	for (var sudo in sudostylemap) {
		  	if (sudo == "before" || sudo == "after") {
			  	if (!styles.hasOwnProperty(":" + sudo)) {
			  		styles[":" + sudo] = {}; }		  		
			  	for (var entry in sudostylemap[sudo]) {
		  			entryval = sudostylemap[sudo][entry];
		  			entry = qx.bom.Style.getPropertyName(entry);
		  			styles[":" + sudo][entry] = entryval;
			  	}
			}
		  	else {
		  		for (var entry in sudostylemap[sudo]) {
		  			entryval = sudostylemap[sudo][entry];
		  			entry = qx.bom.Style.getPropertyName(entry);
		  			styles[entry] = entryval;
		  		}
		  	}	
	  	}	
	  }
    },
    
    
    _buildIncludeChain : function(sudostylemap, arrmaps)
    {
    	//work down include chain before updating styles
    	if (sudostylemap.hasOwnProperty("include")){
		  	var nextstylemap = qx.theme.clean.Image.CSSICONS[sudostylemap["include"]];
		  	delete sudostylemap["include"];
		  	arrmaps.unshift(sudostylemap);
		  	if (nextstylemap.hasOwnProperty("include"))
		  	{
		  		return this._buildincludeChain(nextstylemap, arrmaps);		  			
		  	}
		  	else
		  	{
		  		arrmaps.unshift(nextstylemap);
		  		return arrmaps;
		  	}
			} 
			else 
			{
				return arrmaps;
			}
    },
    
    
    _includeFreestyleStyles : function(sudostylemap)
    {
      //work down include chain before updating styles
      if (sudostylemap.hasOwnProperty("include")){
				var nextstylemap = qx.theme.clean.Image.CSSICONS[sudostylemap["include"]];
				if (nextstylemap.hasOwnProperty("include")) {
					sudostylemap["include"] = nextstylemap["include"];
					this._mergeRecursive(sudostylemap, nextstylemap);
					this._includeFreestyleStyles(sudostylemap);
				}
				else {
					delete sudostylemap["include"];
					this._mergeRecursive(sudostylemap, nextstylemap);
				}
			}
    },
    
    
    _mergeRecursive : function(obj1, obj2) {
			//iterate over all the properties in the object which is being consumed
			for (var p in obj2) {
				// Property in destination object set; update its value.
				if ( obj2.hasOwnProperty(p) && typeof obj1[p] !== "undefined" && qx.lang.Type.isObject(obj2[p]) ) {
					this._mergeRecursive(obj1[p], obj2[p]);
				} 
				else 
				{
					//if obj1 does not have that level or prop in the heirarchy add it
					if (!obj1.hasOwnProperty(p)) {
						obj1[p] = obj2[p]; }
				}
			}
    },

    _applyFreestyleCss : function()
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (this._isInitialized()) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }
    }
  }
});
