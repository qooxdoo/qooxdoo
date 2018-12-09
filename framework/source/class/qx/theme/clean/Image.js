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
/* ************************************************************************


************************************************************************* */
/**
 * Mapping class for all images used in the clean theme.
 *
 * @asset(qx/decoration/Clean/*)
 * @asset(qx/static/blank.png)
 * 
 */
qx.Class.define("qx.theme.clean.Image",
{
  extend : qx.core.Object,

  statics :
  {
    // Embeded SVG alternative implementation using qx.bom.Template only 
    SVGTEMPLATES :
    {
    	"fontawesome" : '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {{vbw}} {{vbh}}"><path d="{{pathd}}"></path></svg>'
    },
    
    SVGCONTENT :
    {
    	"fa-bath" : {vbw : "512", vbh : "512", pathd : "M488 256H80V112c0-17.645 14.355-32 32-32 11.351 0 21.332 5.945 27.015 14.88-16.492 25.207-14.687 59.576 6.838 83.035-4.176 4.713-4.021 11.916.491 16.428l11.314 11.314c4.686 4.686 12.284 4.686 16.971 0l95.03-95.029c4.686-4.686 4.686-12.284 0-16.971l-11.314-11.314c-4.512-4.512-11.715-4.666-16.428-.491-17.949-16.469-42.294-21.429-64.178-15.365C163.281 45.667 139.212 32 112 32c-44.112 0-80 35.888-80 80v144h-8c-13.255 0-24 10.745-24 24v16c0 13.255 10.745 24 24 24h8v32c0 28.43 12.362 53.969 32 71.547V456c0 13.255 10.745 24 24 24h16c13.255 0 24-10.745 24-24v-8h256v8c0 13.255 10.745 24 24 24h16c13.255 0 24-10.745 24-24v-32.453c19.638-17.578 32-43.117 32-71.547v-32h8c13.255 0 24-10.745 24-24v-16c0-13.255-10.745-24-24-24z"},
    	"calendar-alt" : {vbw : "448", vbh : "512", pathd : "M148 288h-40c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12zm108-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm96 0v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm-96 96v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm-96 0v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm192 0v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm96-260v352c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V112c0-26.5 21.5-48 48-48h48V12c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v52h128V12c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v52h48c26.5 0 48 21.5 48 48zm-48 346V160H48v298c0 3.3 2.7 6 6 6h340c3.3 0 6-2.7 6-6z"},
    	"calendar-alt-1" : {vbw : "448", vbh : "512", pathd : "M 352 276 L 352 236 C 352 229.4 346.6 224 340 224 L 300 224 C 293.4 224 288 229.4 288 236 L 288 276 C 288 282.6 293.4 288 300 288 L 340 288 C 346.6 288 352 282.6 352 276 Z  M 448 112 L 448 464 C 448 490.5 426.5 512 400 512 L 48 512 C 21.5 512 0 490.5 0 464 L 0 112 C 0 85.5 21.5 64 48 64 L 96 64 L 96 12 C 96 5.4 101.4 0 108 0 L 148 0 C 154.6 0 160 5.4 160 12 L 160 64 L 288 64 L 288 12 C 288 5.4 293.4 0 300 0 L 340 0 C 346.6 0 352 5.4 352 12 L 352 64 L 400 64 C 426.5 64 448 85.5 448 112 Z  M 400 458 L 400 160 L 48 160 L 48 458 C 48 461.3 50.7 464 54 464 L 394 464 C 397.3 464 400 461.3 400 458 Z"}
    },
    
    // EXPERIMENTAL - div tag per array entry - EXPERIMENTAL
    // Guide - [width, height, left, top, red, green, blue, alpha] 
    DRAWINGS :
    {
      "insert-invitation" : [
      	[2,2,3,0,0,0,0,1],
	    [2,2,13,0,0,0,0,1],
	    [1,1,1,2,0,0,0,.3],
	    [1,1,16,2,0,0,0,.3],
	    [1,1,1,16,0,0,0,.3],
	    [1,1,16,16,0,0,0,.3],
	    [14,1,2,2,0,0,0,1],
	    [16,3,1,3,0,0,0,1],
	    [2,10,1,6,0,0,0,1],
	    [2,10,15,6,0,0,0,1],
	    [16,1,1,15,0,0,0,1],
	    [14,1,2,16,0,0,0,1],
	    [4,4,9,9,0,0,0,1]
      ],
      
      "insert-invitation-hover" : [
      	[2,2,3,0,117,117,117,1],
	    [2,2,13,0,117,117,117,1],
	    [1,1,1,2,117,117,117,.3],
	    [1,1,16,2,117,117,117,.3],
	    [1,1,1,16,117,117,117,.3],
	    [1,1,16,16,117,117,117,.3],
	    [14,1,2,2,117,117,117,1],
	    [16,3,1,3,117,117,117,1],
	    [2,10,1,6,117,117,117,1],
	    [2,10,15,6,117,117,117,1],
	    [16,1,1,15,117,117,117,1],
	    [14,1,2,16,117,117,117,1],
	    [4,4,9,9,117,117,117,1]
      ],
      
      "select-column-order" : [
	      [9,1,0,0,0,0,0,1],
	      [1,8,0,0,0,0,0,1],
	      [1,5,4,0,0,0,0,1],
	      [1,5,8,0,0,0,0,1],
	      [9,1,0,2,0,0,0,1],
	      [4,1,0,7,0,0,0,1],
	      [5,1,5,6,0,0,0,1],
	      [3,1,6,7,0,0,0,1],
	      [1,1,7,8,0,0,0,1]
      ],
      
      "select-column-order-hover" : [
	      [9,1,0,0,0,0,0,1],
	      [1,8,0,0,0,0,0,1],
	      [1,5,4,0,0,0,0,1],
	      [1,5,8,0,0,0,0,1],
	      [9,1,0,2,0,0,0,1],
	      [4,1,0,7,0,0,0,1],
	      [5,1,5,6,255,0,0,1],
	      [3,1,6,7,255,0,0,1],
	      [1,1,7,8,255,0,0,1]
      ]
    },
    
    KEYFRAMES :
    {
    	"example" :
    	{
    		"0" : { "background-color" : "red" },
    		"25" : { "background-color" : "yellow" },
    		"50" : { "background-color" : "blue" },
    		"100" : { "background-color" : "green" }
    	}
    },
    
    DATATYPE :
    {
    	"file-icon[data-type^=doc]" : 
    	{
    		"background": "green"
    	}
    },
    
    CSSICONS :
    {
		// ACTIVE
    	"fast-forward" :
    	{
    		"html" : {},
    		"before" : 
    		{
    			"width" : "6px",
    			"height" : "11px",
    			"top" : "1px",
    			"left" : "5px",
    			"position" : "absolute",
    			"border-top" : "0px solid",
				"border-right" : "2px solid",
				"border-bottom" : "2px solid",
				"border-left" : "0px solid",
    			"color" : "black",
    			"content" : "''"
			},
			"after" :
			{

			}
		},
		
		// ACTIVE
    	"checkbox-checked" :
    	{
    		"html" : {},
    		"before" : 
    		{
    			"width" : "6px",
    			"height" : "11px",
    			"top" : "1px",
    			"left" : "5px",
    			"transform" : "rotate(45deg)",
    			"border-radius" : "2px",
    			"position" : "absolute",
    			"border-top" : "0px solid",
				"border-right" : "2px solid",
				"border-bottom" : "2px solid",
				"border-left" : "0px solid",
    			"color" : "black",
    			"content" : "''"
    		}
		},
		
		// ACTIVE
    	"checkbox-checked-disabled" :
    	{
    		"include" : "checkbox-checked",
    		"before" : {
    			"color" : "#A7A6AA"
    		}
    	},
    	
    	// ACTIVE
    	"select-column-order" :
    	{
    		"html" : {},
    		"before" : {
    			"left" : "4px",
    			"width" : "6px",
    			"position" : "absolute",
    			"content" : "''"
    		},
    		"after" : {
    			"border-top" : "4px solid darkgray",
				"border-right" : "4.5px solid transparent",
				"border-left" : "4.5px solid transparent",
				"right" : "0px",
				"bottom" : "1px",
    			"position" : "absolute",
    			"content" : "''"
    			
    		}
    	},
    	
    	// ACTIVE
    	"select-column-order-hover" :
    	{
    		"include" : "select-column-order",
    		"after" : {
    			"border-top" : "4px solid black"
    		}
    	},
    	
    	// ACTIVE
    	"window-button-close-icon" :
    	{ 		
    		"before" : 
    		{
    			"width" : "3px",
    			"height" : "13px",
    			"left" : "5px",
    			"transform" : "rotate(45deg)",
    			"transition" : "background-color .8s ease",
    			"position" : "absolute",
    			"top" : "0px",
    			"background-color" : "gray",
    			"content" : "''"
    		},
    		"after" :
    		{
    			"width" : "3px",
    			"height" : "13px",
    			"left" : "5px",
    			"transform" : "rotate(-45deg)",
    			"transition" : "background-color .8s ease",
    			"position" : "absolute",
    			"top" : "0px",
    			"background-color" : "gray",
    			"content" : "''"
    		}
    	},
    	
    	// ACTIVE
    	"window-button-close-icon-hover" :
    	{ 		
    		"include" : "window-button-close-icon",
    		"before" : 
    		{
    			"background-color" : "red"
    		},
    		"after" :
    		{
    			"background-color" : "red"
    		}
		},

		// ACTIVE
		"cursor-nodrop-slash" : 
		{
			"before" : 
    		{
    			"width" : "2px",
    			"height" : "13px",
    			"left" : "6px",
    			"transform" : "rotate(-45deg)",
    			"position" : "absolute",
    			"top" : "0px",
    			"background-color" : "red",
    			"content" : "''"
    		}
		},

		"slider-line" :
		{
			"after" :
			{
				"border-top": "1px solid #D8D8D8",
    			"width": "100%",
    			"height": "50%",
    			"position": "absolute",
    			"bottom": "0",
    			"left": "0",
				"content": "''"			
			}
		},

		"slider-line-focused" :
		{
			"include" : "slider-line",
			"after" :
			{
				"border-top": "1px solid #85b7d9",
			} 
		},

		"slider-line-invalid" :
		{
			"include" : "slider-line",
			"after" :
			{
				"border-top": "1px solid red",
			} 
		},

		"cursor-box" : 
		{
			"before" : 
    		{
    			"width" : "6px",
    			"height" : "6px",
				"right" : "0px",
				"bottom" : "0px",
				"overflow" : "visible",
    			"position" : "absolute",
				"background-color" : "gray",
    			"content" : "''"
    		}
		},

    	
    	"icss-bars" : 
    	{
    		"html" : {
    			"display": "inline-block",
    			"margin": ".41em  0"
    		},
    		"before" : {
    			"position" : "absolute",
  				"box-sizing": "border-box",
    			"width": "1em",
    			"height": ".18em",
    			"border-radius": ".06em",
    			"background-color": "black",
    			"top": "-0.36em",
    			"left": 0,
    			"content":"''"
    		},
			"after" : {
    			"position" : "absolute",
  				"box-sizing": "border-box",
    			"width": "1em",
    			"height": ".18em",
    			"border-radius": ".06em",
    			"background-color": "black",
    			"top": "0.36em",
    			"left": 0,
    			"content":"''"
			}
		},

		
    	
    	"icss-file-image" :
    	{
    		"html" : {
			    "display": "inline-block",
			    "border-width": ".065em",
			    "border-style": "solid",
			    "border-radius": ".05em .34em .05em .05em"
    		},
    		"before" : 
    		{
    			"position" : "absolute",
  				"box-sizing": "border-box",
    			"border-style": "solid",
    			"border-width": ".2em",
    			"border-radius": ".3em",
    			"border-color": "transparent",
    			"border-right-color": "inherit",
    			"box-shadow": "-.21em -.21em 0 -.1em",
    			"transform": "rotate(-45deg)",
    			"top": ".01em",
    			"left": ".28em",
    			"content" : "''"
    		},
    		"after" :
    		{
    			"position" : "absolute",
  				"box-sizing": "border-box",
    			"border": ".25em solid black",
    			"transform": "rotate(45deg)",
    			"box-shadow": ".18em -.32em",
    			"top": ".6em",
    			"left": "-.08em",
    			"content" : "''"
    		}
    	},
    	
    	"icss-test" :
    	{
    		"html" :
    		{
    			"width": ".22em",
    			"height": ".1em",
    			"margin": ".75em .63em .1em .15em",
    			"box-shadow": ".49em 0"
    		},
    		"before" : 
    		{
			    "width": ".35em",
			    "height": ".35em",
			    "border-radius": "50%",
			    "clip": "rect(-1em 1em .28em 0)",
			    "transform": "rotate(-48deg)",
			    "top": "-.25em",
			    "left": "-.15em",
			    "box-shadow": "inset 0 0 0 1em, .253em .03em 0 .06em",
			    "content" : "''"
			},
			"after" : 
			{
				"width": ".3em",
    			"height": ".3em",
    			"border-radius": "50%",
    			"clip": "rect(-1em 1em .26em -1em)",
    			"transform": "rotate(48deg)",
    			"top": "-.2em",
    			"left": ".55em",
    			"box-shadow": "inset 0 0 0 1em, -.32em .02em 0 .12em",
    			"content" : "''"
			}
    	},
    	
    	"icss-folder-o" :
    	{
    	
	    	"html" : {
			  "display": "inline-block"
			},
			"before" : {
			  "border": "0 solid red",
			  "border-right-width": "10px",
			  "border-right-height": "1px",
			  "top": "0",
			  "right": 0,
			  "content": "''"
			},
			"after" : {
			  "width": "15px",
			  "height": "8px",
			  "border-radius": "2 2 0 0",
			  "border": "2px solid green",
			  "border-bottom": "0 solid transparent",
			  "top": 0,
			  "left": 0,
			  "content": "''"
			}
		},
		
		"icss-file" :
    	{
    	
	    	"html" : {
			  "display": "inline-block"
			},
			"before" : {
			  	"border-style": "solid",
			    "border-width": ".2em",
			    "left": ".275em",
			    "border-radius": ".1em",
			    "border-color": "transparent",
			    "border-right-color": "currentColor",
			    "transform": "rotate(-45deg)",
			    "top": ".02em",
			    "content" : "''"
			}
		},
		
		"icss-credit-card" :
		{
			"html" :
			{
			    "border-radius": ".1em",
			    "border": "solid .065em currentColor",
			    "background-color": "transparent"
			},
			"before" : 
			{
  				"position" : "absolute",
  				"box-sizing": "border-box",
  				"width": ".95em",
  				"height": ".17em",
  				"left": "-.05em",
  				"top": ".1em",
  				"background-color": "currentColor",
  				"content" : "''"
  			},
  			"after" : 
  			{
  				"position" : "absolute",
  				"box-sizing": "border-box",
  				"right": ".1em",
  				"bottom": ".1em",
  				"width": ".35em",
  				"height": ".063em",
  				"background-color": "currentColor",
  				"content" : "''"
  			}
		},
		
		"fileicon" :
    	{   	
	    	"html" : {
			  "display": "inline-block",
			  "-webkit-font-smoothing": "antialiased"
			},
			"before" : {
			  "display" : "block",
			  "position" : "absolute",
			  "top": 0,
			  "right": 0,
			  "width": 0,
			  "height": 0,
			  "border-style": "solid",
			  "border-color": "#fff #fff rgba(255,255,255,.35) rgba(255,255,255,.35)",
			  "content": "''"
			},
			"after" : {
			  "display" : "block",
			  "position" : "absolute",
			  "bottom": 0,
			  "left": 0,
			  "text-transform": "lowercase",
  			  "width": "100%",
  			  "white-space": "nowrap",
  			  "overflow": "hidden",
			  "content": "attr(data-type)"
			}
		},
		
		//"padding": "0 0 .1667em .2083em"
		"fileicon-dy" :
    	{
    		"include" : "fileicon",
			"html" : {
			  "border-radius": ".0625em"
			},
			"before" : {
  			  "border-width": ".1667em"
			},
			"after" : {
			  "font-size": ".375em",
  			  "padding": "0 0 .25em .29em"
			}
		},
		
		/***
		// Add the code below to add a global class based on data-type values 
		"datatype" : {
    		  "equals" : "pdf",
    		  "background": "green"
    		},
		**/
		"fileicon-lg" :
    	{
    		"include" : "fileicon",
			"before" : {
  			  "border-width": "8px"
			},
			"after" : {
			  "font-size": "18px",
  			  "padding": "4px 6px"
			}
		},
		
		"fileicon-sm" :
    	{
    		"include" : "fileicon",
			"before" : {
			  "border-bottom-left-radius": "2px",
			  "border-width": "4px"
			},
			"after" : {
			  "font-size": "7px",
  			  "padding": "2px"
			}
		}
    },
    
    /**
     * Holds a map containig all the URL to the images.
     * @internal
     */
    URLS :
    {
      "blank" : "qx/static/blank.png",

      // checkbox
      "checkbox-checked" : "decoration/checkbox/checked.svg", //Replaced with Qx + CSS
      "checkbox-undetermined" : "decoration/checkbox/undetermined.png",  //Replaced by Decoration entry:: checkbox-undetermined
      "checkbox-checked-disabled" : "decoration/checkbox/checked-disabled.svg", //Replaced with SVG file - needs to be replaced with CSS

      // window
      "window-minimize" : "decoration/window/minimize.gif", //Replaced with Decoration entry:: window-button-minimize-icon - pure Qx
      "window-maximize" : "decoration/window/maximize.gif", //Replaced with Decoration entry:: window-button-maximize-icon - pure Qx
      "window-restore" : "decoration/window/restore.gif", //Replaced with Decoration entry:: window-button-restore - icon pure Qx
      "window-close" : "decoration/window/close.gif", //Replaced with Decoration entries:: window-button-close-icon and window-button-close-icon-hover - Qx + CSS

      // cursor
      "cursor-copy" : "decoration/cursors/copy.gif", //Replaced with pure Qx
      "cursor-move" : "decoration/cursors/move.gif", //Replaced with pure Qx
      "cursor-alias" : "decoration/cursors/alias.gif", //Replaced with pure Qx
      "cursor-nodrop" : "decoration/cursors/nodrop.gif", //Replaced with Qx + CSS

      // arrows
      "arrow-right" : "decoration/arrows/right.gif", //Replaced by Decoration entry:: sqv-css-icon-arrow-right
      "arrow-left" : "decoration/arrows/left.gif", //Replaced by Decoration entry:: sqv-css-icon-arrow-left
      "arrow-up" : "decoration/arrows/up.gif", //Replaced by Decoration entry:: sqv-css-icon-arrow-up
      "arrow-down" : "decoration/arrows/down.gif",  //Replaced by Decoration entry:: sqv-css-icon-arrow-down
      //"arrow-forward" : "decoration/arrows/forward.gif", //Replaced by Qx code
      //"arrow-rewind" : "decoration/arrows/rewind.gif", //Replaced by Qx code
      "arrow-down-small" : "decoration/arrows/down-small.gif", //Replaced by Decoration entry:: sqv-css-icon-arrow-down-small
      "arrow-up-small" : "decoration/arrows/up-small.gif",  //Replaced by Decoration entry:: sqv-css-icon-arrow-up-small
      "arrow-up-invert" : "decoration/arrows/up-invert.gif", //Replaced by Decoration entry:: sqv-css-icon-arrow-up-invert
      "arrow-down-invert" : "decoration/arrows/down-invert.gif", //Replaced by Decoration entry:: sqv-css-icon-arrow-down-invert
      "arrow-right-invert" : "decoration/arrows/right-invert.gif", //Replaced by Decoration entry:: sqv-css-icon-arrow-right-invert

      // split pane
      "knob-horizontal" : "decoration/splitpane/knob-horizontal.png", //Replaced by pure Qx
      "knob-vertical" : "decoration/splitpane/knob-vertical.png", // Replaced by pure Qx

      // tree
      //"tree-minus" : "decoration/tree/minus.gif", //Replaced
      //"tree-plus" : "decoration/tree/plus.gif", //Replaced

      // table
      "select-column-order" : "decoration/table/select-column-order.png", //Replaced by Decoration entries:: select-column-order and select-column-order-hover - Qx + CSS
      "table-ascending" : "decoration/table/ascending.png",  //Replaced by Decoration:: sqv-css-icon-arrow-up-dark-gray
      "table-descending" : "decoration/table/descending.png", //Replaced by Decoration:: sqv-css-icon-arrow-down-dark-gray

	  // tree virtual
	  "tree-minus" : "decoration/treevirtual/minus.gif",
      "tree-plus" : "decoration/treevirtual/plus.gif",
      "treevirtual-line" : "decoration/treevirtual/line.gif",
      "treevirtual-minus-only" : "decoration/treevirtual/only_minus.gif",
      "treevirtual-plus-only" : "decoration/treevirtual/only_plus.gif",
      "treevirtual-minus-start" : "decoration/treevirtual/start_minus.gif",
      "treevirtual-plus-start" : "decoration/treevirtual/start_plus.gif",
      "treevirtual-minus-end" : "decoration/treevirtual/end_minus.gif",
      "treevirtual-plus-end" : "decoration/treevirtual/end_plus.gif",
      "treevirtual-minus-cross" : "decoration/treevirtual/cross_minus.gif",
      "treevirtual-plus-cross" : "decoration/treevirtual/cross_plus.gif",
      "treevirtual-end" : "decoration/treevirtual/end.gif",
      "treevirtual-cross" : "decoration/treevirtual/cross.gif",

      // menu
      "menu-checkbox" : "decoration/menu/checkbox.gif", //Replaced with Qx + CSS
      "menu-checkbox-invert" : "decoration/menu/checkbox-invert.gif", //Replaced with Qx + CSS
      "menu-radiobutton-invert" : "decoration/menu/radiobutton-invert.gif", //Replaced with Qx + CSS
      "menu-radiobutton" : "decoration/menu/radiobutton.gif", //Replaced with Qx + CSS

      // tabview
      "tabview-close" : "decoration/tabview/close.gif" // Replaced by qx+css using freeStyleCss class and "window-button-close-icon"
    },
    
    paint : function(drawing)
    {
  		return qx.theme.clean.Image.DRAWINGS[drawing].map(this._convertstroke).join("");
    },
    
    /*
     * vA = [width, height, left, top, red, green, blue, alpha]
     */
    _convertstroke : function(vA)
    {
  		return "<div style='width:" + vA[0] + "px;height:" + vA[1] + "px;position:absolute;overflow:hidden;left:" + vA[2] + "px;top:" + vA[3] + "px;background-color:" + "rgba(" + vA[4] + "," + vA[5] + "," + vA[6] + "," + vA[7] + ")'></div>";
    }
  }
});
