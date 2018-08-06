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

    /** The used keys for transforms. */
    __transitionKeys : {
      "scale": true,
      "rotate" : true,
      "skew" : true,
      "translate" : true
    },
    
    /** Static map of rules */
    __rules : {},
    
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
	  	//var sudostylemap = this.getFreestyleCssClass().CSSICONS[iconname];
	  	
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
		var keyframepropName = qx.core.Environment.get("css.animation").keyframes;
		//keyframepropName = keyframepropName.keyframes;
	  	// Box Shadow
	  	var boxshadowpropName = qx.core.Environment.get("css.boxshadow");
		boxshadowpropName = qx.bom.Style.getCssName(boxshadowpropName);
	  	
	  	//variables for looping
	  	var entryval;
	  	var frentval;
	  	
	  	/*if (sudostylemap.hasOwnProperty("include")){
	  		var clonedmap = qx.module.util.Object.clone(sudostylemap, true);
	  		var incclonemap = qx.module.util.Object.clone(sqv.theme.clean.Image.CSSICONS[sudostylemap["include"]], true);
	  		qx.module.util.Object.merge(clonedmap, incclonemap);
	  	}*/
	  	
	  	this._includeFreestyleStyles(sudostylemap);

	  	
	  	//general loop to add content based on map
	  	for (var sudo in sudostylemap) {
		  	if (sudo == "before" || sudo == "after"){
			  	if (!styles.hasOwnProperty(":" + sudo))
			  		styles[":" + sudo] = {};			  		
			  	for (var entry in sudostylemap[sudo]) {
		  			entryval = sudostylemap[sudo][entry];
		  			/*switch(entry) {
			  			case "transform":
			  				styles[":" + sudo][transformpropName] = entryval;
			  				break;
			  			case "border-radius":
			  				styles[":" + sudo][borderradiuspropName] = entryval;
			  				break;
			  			case "animation":
			  				styles[":" + sudo][animationpropName] = entryval;
			  				break;
			  			case "boxshadow":
			  				styles[":" + sudo][boxshadowpropName] = entryval;
			  				break;
			  			default:
			  				styles[":" + sudo][entry] = entryval;	
		  			}*/
		  			entry = qx.bom.Style.getPropertyName(entry);
		  			styles[":" + sudo][entry] = entryval;
			  	}
			}
			/*else if (sudo == "datatype" && (sudostylemap[sudo].hasOwnProperty("equals") || sudostylemap[sudo].hasOwnProperty("startswith"))) {
				var appss = qx.ui.style.Stylesheet.getInstance();
		        var cssstr = "";
		        var classname = ".qx-" + iconname;
		        if (sudostylemap[sudo].hasOwnProperty("startswith")) {
		        	classname += "[" + "data-type^=" + sudostylemap[sudo]["startswith"] + "]";
		        	delete sudostylemap[sudo]["startswith"];
		        }
		        else {
		        	classname += "[" + "data-type=" + sudostylemap[sudo]["equals"] + "]";
		        	delete sudostylemap[sudo]["equals"];
		        }
		        if (sudostylemap[sudo].hasOwnProperty("equals"))
		        	delete sudostylemap[sudo]["equals"];
		        	
				for (var entry in sudostylemap[sudo]) {
		  			entryval = sudostylemap[sudo][entry];
		  			switch(entry) {
			  			case "transform":
			  				cssstr += [transformpropName] + " : " + entryval + ";";
			  				break;
			  			case "border-radius":
			  				cssstr += [borderradiuspropName] + " : " + entryval + ";";
			  				break;
			  			case "animation":
			  				cssstr += [animationpropName] + " : " + entryval + ";";
			  				break;
			  			case "boxshadow":
			  				cssstr += [boxshadowpropName] + " : " + entryval + ";";
			  				break;
			  			default:
			  				cssstr += [entry] + " : " + entryval + ";";	
		  			}
			  	}

		        appss.addRule(classname,cssstr); 
			}*/
		  	else {
		  		for (var entry in sudostylemap[sudo]) {
		  			entryval = sudostylemap[sudo][entry];
		  			/*switch(entry) {
			  			case "transform":
			  				styles[transformpropName] = entryval;
			  				break;
			  			case "border-radius":
			  				styles[borderradiuspropName] = entryval;
			  				break;
			  			case "animation":
			  				styles[animationpropName] = entryval;
			  				break;
			  			case "boxshadow":
			  				styles[boxshadowpropName] = entryval;
			  				break;
			  			default:
			  				styles[entry] = entryval;
		  			}*/
		  			
		  			/*if (entry == "animation-name") {
		  				if (sqv.theme.clean.Image.KEYFRAMES.hasOwnProperty(entryval)) {
		  					var keyframemap = sqv.theme.clean.Image.KEYFRAMES[entryval];
		  					var keyframename = keyframepropName + " " + entryval;
		  					this._addKeyFrames(keyframename, entryval, keyframemap, false);
		  				}	
		  			}*/
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
		} else {
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
      
                } else {
                  //if obj1 does not have that level or prop in the heirarchy add it
                  if (!obj1.hasOwnProperty(p))
                        obj1[p] = obj2[p];
                }
           }
      },
      
      /**
     * Helper to add the given frames to an internal CSS stylesheet. It parses
     * the description and adds the key frames to the sheet.
     * @param frames {Map} A map of key frames that describe the animation.
     * @param reverse {Boolean} <code>true</code>, if the key frames should
     *   be added in reverse order.
     * @return {String} The generated name of the keyframes rule.
     */
    _addKeyFrames : function(framename, rulename, frames, reverse) {
      var rule = "";

      // for each key frame
      for (var position in frames) {
        rule += (reverse ? -(position - 100) : position) + "% {";

        var frame = frames[position];
        var transforms;
        // each style
        for (var style in frame) {
          if (style in this.__transitionKeys) {
            if (!transforms) {
              transforms = {};
            }
            transforms[style] = frame[style];
          } else {
            var propName = qx.bom.Style.getPropertyName(style);
            var prefixed = (propName !== null) ?
              qx.bom.Style.getCssName(propName) : "";
            rule += (prefixed || style) + ":" + frame[style] + ";";
          }
        }

        // transform handling
        if (transforms) {
          rule += qx.bom.element.Transform.getCss(transforms);
        }

        rule += "} ";
      }

      // cached shorthand
      if (this.__rules[rule]) {
        return this.__rules[rule];
      }

      var selector = framename;
      //var selector = this.__cssAnimationKeys["keyframes"] + " " + name;
      qx.bom.Stylesheet.addRule(qx.bom.Stylesheet.createElement(), selector, rule);

      this.__rules[rule] = rulename;

      return rulename;
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
