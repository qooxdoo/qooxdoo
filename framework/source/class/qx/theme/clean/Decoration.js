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
 * The simple qooxdoo decoration theme.
 * 
 */
qx.Theme.define("qx.theme.clean.Decoration",
{
 
  aliases : {
    decoration : "qx/decoration/Clean"
  },
   

  decorations :
  {
    
    /*
    ---------------------------------------------------------------------------
      ROOT
    ---------------------------------------------------------------------------
    */
    
    
    
    /*
    ---------------------------------------------------------------------------
      CORE
    ---------------------------------------------------------------------------
    */

    "border-blue" :
    {
      style :
      {
        width : 4,
        color : "background-selected"
      }
    },


    "main" :
    {
      style :
      {
        width : 1,
        radius : 3,
        color : "white-box-border"
      }
    },

    "main-dark" :
    {
      style :
      {
        width : 1,
        color : "button-border"
      }
    },


    "popup" :
    {
      style :
      {
        width: 1,
        //color: "window-border",
        color : "border-light",
        shadowLength : 1,
        shadowBlurRadius : 5,
        shadowColor : "shadow-light"
      }
    },
    

    "dragover" :
    {
      style : {
        bottom: [2, "solid", "dark-blue"]
      }
    },
    
    /*
    ---------------------------------------------------------------------------
      SQv
      
      IMAGES
    ---------------------------------------------------------------------------
    */
    "sqv-image-tree-minus" :
    {
      style :
      {
        //backgroundImage : qx.theme.clean.Image.URLS["tree-minus"]
        //backgroundImage : qx.theme.simple.Image.URLS["tree-minus"]  
      }
    },
    
    "sqv-image-tree-plus" :
    {
      style :
      {
        backgroundImage  : "decoration/toolbar/toolbar-part.gif",
        backgroundRepeat : "repeat-y"
      }
    },
    
    "icss-bars" : 
    {
      style :
      {
        freestyleCss : "icss-bars"
      }
    },
    
    "icss-file-image" :
    {
      style :
      {
        freestyleCss : "icss-file-image"
      }
    },
    
    "icss-test" :
    {
      style :
      {
        freestyleCss : "icss-test"
      }
    },
    
    "icss-folder-o" :
    {
      style :
      {
        freestyleCss : "icss-folder-o",
        radius : 2,
        backgroundColor : "transparent",
        color : "yellow",
        width : 2,
        style : "solid",
        colorTop: "transparent",
        widthTop: 0
      }
    },
    
    "icss-file" :
    {
      style :
      {
        freestyleCss : "icss-file",
        radius : [2,8,2,2],
        backgroundColor : "transparent",
        color : "black",
        width : 3
      }
    },
    
    "icss-credit-card" :
    {
      style :
      {
        freestyleCss : "icss-credit-card"
      }
    },
    
    "fileicon-dy" :
    {
      
      style :
      {
        freestyleCss : "fileicon-dy"
      }
    }, 
    
    "fileicon-lg" :
    {
      
      style :
      {
        freestyleCss : "fileicon-lg",
        radius : 3
      }
    },
    
    "fileicon-sm" :
    {
      
      style :
      {
        freestyleCss : "fileicon-sm",
        radius : 2
      }
    },
    
    /*
    ---------------------------------------------------------------------------
      SQv
      
      SVG ICON
    ---------------------------------------------------------------------------
    */
   
   "svg-icon" :
    {},
    
    
    /*
    ---------------------------------------------------------------------------
      SQv
      
      DIAGRAM
    ---------------------------------------------------------------------------
    */
   
   "diagram" :
   {
   		width : 1,
   		color : "black"
   },
    
    
    /*
    ---------------------------------------------------------------------------
      SQv
      
      PRIMARY, SECONDARY and TERTIARY BUTTONS 
    ---------------------------------------------------------------------------
    */
    "primary-button-box" :
    {
      style :
      {
        radius : 3,
        width : 0,
        backgroundColor : "primary"
      }
    },

    "primary-button-box-pressed" :
    {
      include : "primary-button-box",

      style :
      {
        backgroundColor : "primary-button-box-pressed"
      }
    },

    "primary-button-box-hovered" :
    {
      include : "primary-button-box",

      style :
      {
        backgroundColor : "primary-button-box-hovered"
      }
    },
    
    "secondary-button-box" :
    {
      style :
      {
        radius : 3,
        width : 0,
        backgroundColor : "secondary-button-box",
        inset : true,
        shadowColor : "secondary-button-inset-shadow",
        shadowLength : [0, 0],
        shadowBlurRadius : 0,
        shadowSpreadRadius : 0
      }
    },

    "secondary-button-box-pressed" :
    {
      include : "secondary-button-box",

      style :
      {
        backgroundColor : "secondary-button-box-pressed"
      }
    },

    "secondary-button-box-hovered" :
    {
      include : "secondary-button-box",

      style :
      {
        backgroundColor : "secondary-button-box-hovered"
      }
    },
    
    "tertiary-button-box" :
    {
      include : "secondary-button-box",
      
      style :
      {
        backgroundColor : "tertiary-button-box",
        shadowColor : "tertiary-button-inset-shadow"
      }
    },

    "tertiary-button-box-pressed" :
    {
      include : "primary-button-box",

      style :
      {
        backgroundColor : "tertiary-button-box-pressed"
      }
    },

    "tertiary-button-box-hovered" :
    {
      include : "primary-button-box",

      style :
      {
        backgroundColor : "tertiary-button-box-hovered"
      }
    },
    

	/*
    ---------------------------------------------------------------------------
      SQv
      
      ICONS
    ---------------------------------------------------------------------------
    */
   "sqv-css-icon-arrow-up" :
   {
   	  style :
      {
        color : [null,"transparent","sqv-black","transparent"],
        style : [null, "solid","solid","solid"],
        width : [0,4.5,4,4.5]
      }
   },
   
   "sqv-css-icon-arrow-up-med-gray" :
   {
   	  include : "sqv-css-icon-arrow-up",
   	  
   	  style :
      {
        color : [null,"transparent","sqv-arrow-med-gray","transparent"]
      }
   },
   
   "sqv-css-icon-arrow-up-invert" :
   {
   	  include : "sqv-css-icon-arrow-up",
   	  
   	  style :
      {
        color : [null,"transparent","white","transparent"]
      }
   },
   
   "sqv-css-icon-arrow-up-small" :
   {
   	  style :
      {
        color : [null,"transparent","sqv-black","transparent"],
        style : [null, "solid","solid","solid"],
        width : [0,3.5,3,3.5]
      }
   },
   
   "sqv-css-icon-arrow-down" :
   {
   	  style :
      {
        color : ["sqv-black","transparent",null,"transparent"],
        style : ["solid", "solid",null,"solid"],
        width : [4,4.5,0,4.5]
      }
   },
   
   "sqv-css-icon-arrow-down-med-gray" :
   {
   	  include : "sqv-css-icon-arrow-down",
   	  
   	  style :
      {
        color : ["sqv-arrow-med-gray","transparent",null,"transparent"]
      }
   },
   
   "sqv-css-icon-arrow-down-invert" :
   {
   	  include : "sqv-css-icon-arrow-down",
   	  
   	  style :
      {
        color : ["white","transparent",null,"transparent"]
      }
   },
   
   "sqv-css-icon-arrow-down-small" :
   {
   	  style :
      {
        color : ["sqv-black","transparent",null,"transparent"],
        style : ["solid", "solid",null,"solid"],
        width : [3,3.5,0,3.5]
      }
   },
   
   "sqv-css-art" :
   {
   	  style :
      {
        color : ["transparent","transparent","sqv-black","transparent"],
        style : [null, "solid","solid","solid"],
        width : [0,20,14,20],
        innerColor : ["transparent","transparent","red","transparent"],
        innerWidth : [0,6,16,6]
      }
   },
   
   "sqv-css-icon-arrow-right" :
   {
   	  style :
      {
        color : ["transparent",null,"transparent","sqv-arrow-gray"],
        style : ["solid",null,"solid","solid"],
        width : [4.5,0,4.5,4]
      }
   },
   
   "sqv-css-icon-arrow-right-invert" :
   {
   	  include : "sqv-css-icon-arrow-right",
   	  
   	  style :
      {
        color : ["transparent",null,"transparent","white"]
      }
   },
   
   "sqv-css-icon-arrow-right-small" :
   {
   	  style :
      {
        color : ["transparent",null,"transparent","sqv-black"],
        style : ["solid",null,"solid","solid"],
        width : [3.5,0,3.5,4]
      }
   },
   
   "sqv-css-icon-arrow-forward" :
   {
   	  style :
      {
        color : ["transparent",null,"transparent","sqv-black"],
        style : ["solid",null,"solid","solid"],
        width : [3.5,0,3.5,4],
        //innerWidth : [0,4,0,0],
        //innerColor : "red"
        shadowColor : "sqv-black",
        shadowLength : [0, 2],
        shadowBlurRadius : 0,
        shadowSpreadRadius : 0
      }
   },

   "sqv-css-icon-arrow-rewind" :
   {
    include : "sqv-css-icon-arrow-left-small",   
    
    style :
   	  {
        shadowColor : "sqv-black",
        shadowLength : [0, 2],
        shadowBlurRadius : 0,
        shadowSpreadRadius : 0
   	  }
   },
   
   "sqv-css-icon-arrow-left" :
   {
   	  style :
   	  {
   	  	color : ["transparent","sqv-arrow-gray","transparent",null],
        style : ["solid","solid","solid",null],
        width : [4.5,4,4.5,0]
   	  }
   },
   
   "sqv-css-icon-arrow-left-small" :
   {
   	  style :
      {
        color : ["transparent","sqv-black","transparent",null],
        style : ["solid", "solid","solid",null],
        width : [3.5,4,3.5,0]
      }
   },
   
   "sqv-css-icon-triangle-bottom-right" :
   {
   	style :
      {
        color : [null,null,"sqv-arrow-gray","transparent"],
        style : [null,null,"solid","solid"],
        width : [0,0,6,6]
      }
   },
   
   "sqv-css-icon-dot-black" :
    {
      style :
      {
        radius : 10,
        width : 1,
        color : "sqv-black",
        innerColor: "white",
        innerWidth: 3
      }
    },
   
   "fa-search-na" :
   {
   	  style :
      {
        beforeContent : '"\\f002"'
      }
   },
   
   "fa-search-old" :
   {
   	  style :
      {
        //sqviconName : "search"
      }
   },
   
   
    "lb-search" :
    {
      style :
      {
        //sqviconName : "search"
      }
    },
    
    "lb-search-green" :
    {
      style :
      {
        //sqviconName : "search-green"
      }
    },
    
    "lb-check" : 
    {
    	style :
    	{
    		//sqviconName : "check",
    		radius : 3,
    		backgroundColor : "sqv-black",
    		width: [0, 0, 3, 0],
    		color : "sqv-black"
    	}
    },
    
    "lb-soundbar" : 
    {
    	style :
    	{
    		//sqviconName : "soundbar"
    	}
    },
    
    "od-star" :
    {
      style :
      {
        //sqviconName : "star"
      }
    },
    
    "icono-calendar" :
    {
      style :
      {
        //sqviconName : "calendar"
        //radius : 3,
        //color : "#656565"
      }
    },
    
    "sqvicon-area" :
    {
    	style :
    	{
    		width : 1,
    		color : "#000000"
    	}
    },

    /*
    ---------------------------------------------------------------------------
      BUTTON
    ---------------------------------------------------------------------------
    */
    "button-box" :
    {
      style :
      {
        radius : 3,
        width : 0,
        color : "button-border",
        backgroundColor : "button-box-bright"
      }
    },

    "button-box-blank" :
    {
      include : "button-box",

      style :
      {
        backgroundColor : "white"
      }
    },

    "button-box-pressed" :
    {
      include : "button-box",

      style :
      {
        backgroundColor : "button-box-bright-pressed"
      }
    },

    "button-box-pressed-hovered" :
    {
      include : "button-box-pressed",

      style :
      {
        color : "button-border-hovered"
      }
    },

    "button-box-hovered" :
    {
      include : "button-box",

      style :
      {
        //color : "button-border-hovered",
        //SQ New
        backgroundColor : "button-box-bright-hovered"
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON INVALID
    ---------------------------------------------------------------------------
    */
    "button-box-invalid" :
    {
      include : "button-box",

      style :
      {
        color : "invalid"
      }
    },

    "button-box-pressed-invalid" :
    {
      include : "button-box-pressed",

      style :
      {
        color : "invalid"
      }
    },

    "button-box-hovered-invalid" : {include: "button-box-invalid"},

    "button-box-pressed-hovered-invalid" : {include: "button-box-pressed-invalid"},


    /*
    ---------------------------------------------------------------------------
      BUTTON FOCUSED
    ---------------------------------------------------------------------------
    */
    "button-box-focused" :
    {
      include : "button-box-pressed"
    },

    "button-box-pressed-focused" :
    {
      include : "button-box-pressed",

      style :
      {
        color : "background-selected"
      }
    },

    "button-box-hovered-focused" : {include: "button-box-focused"},

    "button-box-pressed-hovered-focused" : {include: "button-box-pressed-focused"},


    /*
    ---------------------------------------------------------------------------
      BUTTON RIGHT
    ---------------------------------------------------------------------------
    */
    "button-box-right" :
    {
      include : "button-box",

      style :
      {
        radius : [0, 3, 3, 0]
      }
    },

    "button-box-pressed-right" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : [0, 3, 3, 0]
      }
    },

    "button-box-pressed-hovered-right" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : [0, 3, 3, 0]
      }
    },

    "button-box-hovered-right" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : [0, 3, 3, 0]
      }
    },

    "button-box-focused-right" :
    {
      include : "button-box-focused",

      style :
      {
        radius : [0, 3, 3, 0]
      }
    },

    "button-box-hovered-focused-right" :
    {
      include : "button-box-hovered-focused",

      style :
      {
        radius : [0, 3, 3, 0]
      }
    },

    "button-box-pressed-focused-right" :
    {
      include : "button-box-pressed-focused",

      style :
      {
        radius : [0, 3, 3, 0]
      }
    },

    "button-box-pressed-hovered-focused-right" :
    {
      include : "button-box-pressed-hovered-focused",

      style :
      {
        radius : [0, 3, 3, 0]
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON BORDERLESS RIGHT
    ---------------------------------------------------------------------------
    */
    
    "button-box-right-borderless" :
    {
      include : "button-box",

      style :
      {
        radius : [0, 3, 3, 0],
        width: 1,
        color : [ "border-light-shadow", "border-light", "border-light", "border-light" ]
      }
    },

    "button-box-pressed-right-borderless" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : [0, 3, 3, 0],
        width: 1
      }
    },

    "button-box-pressed-hovered-right-borderless" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : [0, 3, 3, 0],
        width: 1
      }
    },

    "button-box-hovered-right-borderless" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : [0, 3, 3, 0],
        width: 1,
        color: "textfield-selected"
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON TOP RIGHT
    ---------------------------------------------------------------------------
    */
    "button-box-top-right" :
    {
      include : "button-box",

      style :
      {
        radius : [0, 3, 0, 0],
        width: [1, 1, 1, 1],
        color: "border-light"
      }
    },
    
    "button-box-hovered-top-right" : 
    {
      include : "button-box-top-right",

      style :
      {
        color: "textfield-selected"
      }
    },

    /*
    ---------------------------------------------------------------------------
      BUTTON BOTTOM RIGHT
    ---------------------------------------------------------------------------
    */
    "button-box-bottom-right" :
    {
      include : "button-box",

      style :
      {
        radius : [0, 0, 3, 0],
        width : [0, 1, 1, 1],
        color: "border-light"
      }
    },

    "button-box-hovered-bottom-right" :
    {
      include : "button-box-bottom-right",

      style :
      {
        color : "textfield-selected"
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON BOTTOM LEFT
    ---------------------------------------------------------------------------
    */
    "button-box-bottom-left" :
    {
      include : "button-box",

      style :
      {
        radius : [0, 0, 0, 3],
        width : [0, 0, 1, 1]
      }
    },

    "button-box-pressed-bottom-left" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : [0, 0, 0, 3],
        width : [0, 0, 1, 1]
      }
    },

    "button-box-pressed-hovered-bottom-left" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : [0, 0, 0, 3],
        width : [0, 0, 1, 1]
      }
    },

    "button-box-hovered-bottom-left" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : [0, 0, 0, 3],
        width : [0, 0, 1, 1]
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON TOP LEFT
    ---------------------------------------------------------------------------
    */
    "button-box-top-left" :
    {
      include : "button-box",

      style :
      {
        radius : [3, 0, 0, 0],
        width : [1, 0, 0, 1]
      }
    },

    "button-box-pressed-top-left" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : [3, 0, 0, 0],
        width : [1, 0, 0, 1]
      }
    },

    "button-box-pressed-hovered-top-left" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : [3, 0, 0, 0],
        width : [1, 0, 0, 1]
      }
    },

    "button-box-hovered-top-left" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : [3, 0, 0, 0],
        width : [1, 0, 0, 1]
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON MIDDLE
    ---------------------------------------------------------------------------
    */
    "button-box-middle" :
    {
      include : "button-box",

      style :
      {
        radius : 0
        //width : [1, 0, 1, 1]
      }
    },

    "button-box-pressed-middle" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : 0
        //width : [1, 0, 1, 1]
      }
    },

    "button-box-pressed-hovered-middle" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : 0
        //width : [1, 0, 1, 1]
      }
    },

    "button-box-hovered-middle" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : 0
        //width : [1, 0, 1, 1]
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON LEFT
    ---------------------------------------------------------------------------
    */
    "button-box-left" :
    {
      include : "button-box",

      style :
      {
        radius : [3, 0, 0, 3]
      }
    },

    "button-box-pressed-left" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : [3, 0, 0, 3]
      }
    },

    "button-box-pressed-hovered-left" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : [3, 0, 0, 3]
      }
    },

    "button-box-hovered-left" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : [3, 0, 0, 3]
      }
    },

    "button-box-focused-left" :
    {
      include : "button-box-focused",

      style :
      {
        radius : [3, 0, 0, 3]
      }
    },

    "button-box-hovered-focused-left" :
    {
      include : "button-box-hovered-focused",

      style :
      {
        radius : [3, 0, 0, 3]
      }
    },

    "button-box-pressed-hovered-focused-left" :
    {
      include : "button-box-pressed-hovered-focused",

      style :
      {
        radius : [3, 0, 0, 3]
      }
    },

    "button-box-pressed-focused-left" :
    {
      include : "button-box-pressed-focused",

      style :
      {
        radius : [3, 0, 0, 3]
      }
    },

        /*
    ---------------------------------------------------------------------------
      BUTTON LEFT BORDER
    ---------------------------------------------------------------------------
    */
   "button-box-left-border" :
   {
     include : "button-box-left",

     style :
     {
       width : [1,0,1,1]
     }
   },

   "button-box-pressed-left-border" :
   {
     include : "button-box-pressed-left",

     style :
     {
      width : 1
     }
   },

   "button-box-pressed-hovered-left" :
   {
     include : "button-box-pressed-hovered",

     style :
     {
       radius : [3, 0, 0, 3]
     }
   },

   "button-box-hovered-left" :
   {
     include : "button-box-hovered",

     style :
     {
       radius : [3, 0, 0, 3]
     }
   },

   "button-box-focused-left" :
   {
     include : "button-box-focused",

     style :
     {
       radius : [3, 0, 0, 3]
     }
   },

   "button-box-hovered-focused-left" :
   {
     include : "button-box-hovered-focused",

     style :
     {
       radius : [3, 0, 0, 3]
     }
   },

   "button-box-pressed-hovered-focused-left" :
   {
     include : "button-box-pressed-hovered-focused",

     style :
     {
       radius : [3, 0, 0, 3]
     }
   },

   "button-box-pressed-focused-left" :
   {
     include : "button-box-pressed-focused",

     style :
     {
       radius : [3, 0, 0, 3]
     }
   },
    
    
    /*
    ---------------------------------------------------------------------------
      SPLITBUTTON
    ---------------------------------------------------------------------------
    */
    
    "splitbutton" :
    {
    	style :
    	{
    		radius : 3
    	}
    },
    
    "splitbutton-box-left" :
    {
      inclue : "button-box",
      
      style :
      {
        radius : [3,0,0,3],
        backgroundColor : "button-box-bright"
      }
    },
    
    "splitbutton-box-pressed-left" :
    {
      include : "splitbutton-box-left",

      style :
      {
        backgroundColor : "button-box-bright-pressed"
      }
    },

    "splitbutton-box-pressed-hovered-left" :
    {
      include : "splitbutton-box-pressed-left",

      style :
      {
        color : "button-border-hovered"
      }
    },

    "splitbutton-box-hovered-left" :
    {
      include : "splitbutton-box-left",

      style :
      {
        backgroundColor : "button-box-bright-hovered"
      }
    },


    /*
    ---------------------------------------------------------------------------
      SEPARATOR
    ---------------------------------------------------------------------------
    */

    "separator-horizontal" :
    {
      style :
      {
        widthLeft : 1,
        colorLeft : "border-separator"
      }
    },

    "separator-vertical" :
    {
      style :
      {
        widthTop : 1,
        colorTop : "border-separator"
      }
    },


    /*
    ---------------------------------------------------------------------------
      SCROLL KNOB
    ---------------------------------------------------------------------------
    */
    "scroll-knob" :
    {
      style :
      {
        radius : 3,
        width : 1,
        color : "button-border",
        backgroundColor : "scrollbar-bright"
      }
    },

    "scroll-knob-pressed" :
    {
      include : "scroll-knob",

      style :
      {
        backgroundColor : "scrollbar-dark"
      }
    },

    "scroll-knob-hovered" :
    {
      include: "scroll-knob",

      style :
      {
        color : "button-border-hovered"
      }
    },

    "scroll-knob-pressed-hovered" :
    {
      include: "scroll-knob-pressed",

      style :
      {
        color : "button-border-hovered"
      }
    },

    /*
    ---------------------------------------------------------------------------
      SPLITPANE KNOB
    ---------------------------------------------------------------------------
    */
    "splitpane-knob" :
    {
      style : 
      {
        width : [0,2,0,0],
        color : "gray",
        style : "dotted"
      }
    },

    /*
    ---------------------------------------------------------------------------
      HOVER BUTTON
    ---------------------------------------------------------------------------
    */
    "button-hover" :
    {
      style :
      {
        backgroundColor : "button",
        radius : 3
      }
    },
    
    /*
    ---------------------------------------------------------------------------
      UPLOAD
    ---------------------------------------------------------------------------
    */
    "upload-area" :
    {
      style :
      {
        width : 1,
        radius : 3,
        style : "dashed",
        color : "gray"
      }
    },
    
    "upload-area-dragover" :
    {
     include: "upload-area",
      
      style :
      {
        style : "solid",
        color : "orange"
      }
    },
    
    /*
    ---------------------------------------------------------------------------
      DIAGRAM
    ---------------------------------------------------------------------------
    */
   
   "connector-active" :
   {
   	style :
   	{
   		width : 1,
        color : "textfield-selected",
        radius : 0
   	}
   },


    /*
    ---------------------------------------------------------------------------
      WINDOW
    ---------------------------------------------------------------------------
    */
    "window" :
    {
      style :
      {
        width : 1,
        color : "border-light",
        innerWidth : 4,
        innerColor: "window-border-inner",
        shadowLength : 0,
        shadowBlurRadius : 0,
        shadowColor : "shadow",
        backgroundColor : "background",
        radius : 3
      }
    },

    "window-active" :
    {
      include : "window",

      style :
      {
        shadowLength : [1,2],
        shadowBlurRadius : 2
        //shadowColor : "#FFF8DD"
      }
    },


    "window-caption" : {
      style :
      {
        width : [0, 0, 2, 0],
        //color : "window-border-inner"
        color : "background"
      }
    },

    "window-statusbar" :
    {
      include : "statusbar",

      style :
      {
        width : 0
      }
    },
    
    "window-button-minimize-icon" :
    {
      style :
      {
        width : [0,10,4,0],
        color : "gray"
      }
    },
    
    "window-button-minimize-icon-hover" :
    {
      include : "window-button-minimize-icon",
      
      style :
      {
        color : "black"
      }
    },
    
    "window-button-maximize-icon" :
    {
      style :
      {
        width : [4,2,2,2],
        color : "gray"
      }
    },
    
    "window-button-maximize-icon-hover" :
    {
      include : "window-button-maximize-icon",
      
      style :
      {
        color : "black"
      }
    },
    
    "window-button-close-icon" :
    {
      style :
      {
        freestyleCss : "window-button-close-icon",
        color : "gray"
      }
    },
    
    "window-button-close-icon-hover" :
    {     
      style :
      {
        freestyleCss : "window-button-close-icon-hover",
        color : "black"
      }
    },
   
   "window-button-restore-icon" :
    {
      style :
      {
        width : [4,2,2,2],
        color : "gray",
        shadowColor : "gray",
        shadowLength : [2, 2],
        shadowBlurRadius : 0,
        shadowSpreadRadius : 0
      }
    },
    
    "window-button-restore-icon-hover" :
    {
      include : "window-button-restore-icon",
      
      style :
      {
        color : "black"
      }
    },


    /*
    ---------------------------------------------------------------------------
      GROUP BOX
    ---------------------------------------------------------------------------
    */
    
    "white-box" :
    {
      style :
      {
        width: 1,
        color: "white-box-border",
        shadowBlurRadius : 0,
        shadowColor : "#999999",
        radius: 3,
        backgroundColor : "white",
        shadowLength: 0
      }
    },
    
    "connected-top-legend" :
    {
    	include : "white-box",
    	
    	style :
	    {
	      width: [1,1,0,1],
	      radius: [ 3, 3, 0, 0 ]
	    }
    },
    
    "connected-top-box" :
    {
    	include : "white-box",
    	
    	style :
	    {
	      width: [1,0,0,0],
	      radius: [ 0, 0, 0, 0 ]
	    }
    },
    
    "blue-top-box" :
    {
      include : "white-box",
      
      style :
      {
        width: [2,1,1,1],
        color: [ "box-border-blue", "white-box-border", "white-box-border", "white-box-border" ],
        radius: [ 4, 4, 3, 3 ]
      }
    },
    
    "orange-top-box" :
    {
      include : "blue-top-box",
      
      style :
      {
        color: [ "box-border-orange", "white-box-border", "white-box-border", "white-box-border" ]
      }
    },
    
    "green-top-box" :
    {
      include : "blue-top-box",
      
      style :
      {
        color: [ "box-border-green", "white-box-border", "white-box-border", "white-box-border" ]
      }
    },


    /*
    ---------------------------------------------------------------------------
      TEXT FIELD
    ---------------------------------------------------------------------------
    */
    "inset" :
    {
      style :
      {
        width : 1,
        color : [ "border-light-shadow", "border-light", "border-light", "border-light" ],
        radius : 3
      }
    },

    "focused-inset" :
    {
      style :
      {
        width : 1,
        color : "textfield-selected",
        radius : 3
      }
    },
    
    "form-focused-inset" :
    {
      style :
      {
        width : [1,1,1,2],
        //color : [ "textfield-selected", "textfield-selected", "textfield-selected", "textfield-selected-darker" ],
        //color : "textfield-selected",
        //radius : 1
        //width: [2,1,1,1],
        color: [ "textfield-selected", "textfield-selected", "textfield-selected", "box-border-blue" ],
        radius: [ 3, 2, 2, 3 ]
      }
    },

    "border-invalid" :
    {
      style :
      {
        width : 1,
        color : "#dbb1b1"
      }
    },
    
    "combobox-inset" :
    {
      include : "inset",
      
      style :
      {
        width : [1,0,1,1],
        radius : [3,0,0,3]
      }
    },

    "combobox-focused-inset" :
    {
      include : "focused-inset",
      
      style :
      {
        width : [1,0,1,1],
        radius : [3,0,0,3]
      }
    },
    
    "selectbox-popup-bottom" :
    {
    	include : "popup",
    	
    	style :
    	{
    	  width : [0,1,1,1],
        color : ["transparent","textfield-selected","textfield-selected","textfield-selected"],
        radius : [0,0,3,3],
        shadowLength : [0,2],
        shadowBlurRadius : 3
    	}
    },
    
    "selectbox-popup-top" :
    {
    	include : "popup",
    	
    	style :
    	{
        width : [1,1,0,1],  
        color : ["textfield-selected","textfield-selected","transparent","textfield-selected"],
        radius : [3,3,0,0],
        shadowLength : [0,-2],
        shadowBlurRadius : 3
    	}
    },
    
    "combobox-listitem" :
    {
    	
    	style :
    	{
    	  width : [0,0,0,0],
        color : "border-super-light"
    	}
    },


    /*
    ---------------------------------------------------------------------------
      LIST ITEM
    ---------------------------------------------------------------------------
    */

    "lead-item" :
    {
      style :
      {
        width : 1,
        style : "dotted",
        color : "border-lead"
      }
    },




    /*
    ---------------------------------------------------------------------------
      TOOL TIP
    ---------------------------------------------------------------------------
    */

    "tooltip" :
    {
      style :
      {
        width : 1,
        color : "tooltip-text",
        shadowLength : 1,
        shadowBlurRadius : 2,
        shadowColor : "shadow"
      }
    },


    "tooltip-error" :
    {
      style : {
        radius: 5,
        backgroundColor: "invalid"
      }
    },




    /*
    ---------------------------------------------------------------------------
      TOOLBAR
    ---------------------------------------------------------------------------
    */

    "toolbar-separator" :
    {
      style :
      {
        //widthLeft : 1,
        colorLeft : "button-border"
      }
    },


    /*
    ---------------------------------------------------------------------------
      MENU
    ---------------------------------------------------------------------------
    */
    "menu-separator" :
    {
      style :
      {
        widthTop: 1,
        colorTop : "border-light"
      }
    },

    "menu-radiobutton" :
    {
      style :
      {
        radius : 10,
        width : 0,
        color : "transparent",
        innerColor: "text",
        innerWidth: 0
      }
    },

    "menu-checkbox-checked" :
    {
      include: "checkbox-checked",
      style :
      {
        radius : 0,
        width : 0,
        color : "transparent",
        innerColor: "transparent",
        innerWidth: 0
      }
    },


    /*
    ---------------------------------------------------------------------------
      MENU BAR
    ---------------------------------------------------------------------------
    */
    "menubar-button-hovered" :
    {
      style :
      {
        width : 1,
        color : "border-main",
        radius : 3,
        backgroundColor : "white"
      }
    },


    "menubar-button-pressed" :
    {
      include : "menubar-button-hovered",

      style :
      {
        radius : [3, 3, 0, 0],
        width : [1, 1, 0, 1]
      }
    },


    /*
    ---------------------------------------------------------------------------
      DATE CHOOSER
    ---------------------------------------------------------------------------
    */
   
    "datechooser-button" :
    {},

    "datechooser-date-pane" :
    {
      style :
      {
        widthTop: 1,
        colorTop : "border-light",
        style : "solid"
      }
    },


    "datechooser-weekday" :
    {
      style :
      {
        widthBottom: 1,
        colorBottom : "border-light",
        style : "solid"
      }
    },

    "datechooser-week" :
    {
      style :
      {
        widthRight: 1,
        colorRight : "border-light",
        style : "solid"
      }
    },

    "datechooser-week-header" :
    {
      style :
      {
        widthBottom : 1,
        colorBottom : "border-light",
        widthRight: 1,
        colorRight : "border-light",
        style : "solid"
      }
    },





    /*
    ---------------------------------------------------------------------------
      TAB VIEW
    ---------------------------------------------------------------------------
    */
   

    "tabview-page-button-top" :
    {
      style :
      {
        width : [1, 1, 0, 1],
        //width : 1,
        backgroundColor: "background",
        color : "white-box-border",
        //color : ["white-box-border", "white-box-border", "white", "white-box-border"],
        radius : [3, 3, 0, 0]
      }
    },

    "tabview-page-button-bottom" : {
      include : "tabview-page-button-top",

      style :
      {
        radius : [0, 0, 3, 3],
        width : [0, 1, 1, 1]
        //color : ["white", "white-box-border", "white-box-border", "white-box-border"]
      }
    },

    "tabview-page-button-left" : {
      include : "tabview-page-button-top",

      style :
      {
        radius : [3, 0, 0, 3],
        width : [1, 0, 1, 1]
        //color : ["white-box-border", "white", "white-box-border", "white-box-border"]
      }
    },

    "tabview-page-button-right" : {
      include : "tabview-page-button-top",

      style :
      {
        radius : [0, 3, 3, 0],
        width : [1, 1, 1, 0]
      }
    },
    
    
    /*
    ---------------------------------------------------------------------------
      SQV
      
      TAB VIEW SPACEBAR
    ---------------------------------------------------------------------------
    */

    "tabviewspacebar-page-button-top" :
    {
      style :
      {
        width : [0, 0, 3, 0],
        backgroundColor: "background",
        //color : "white-box-border"
        color : "tabviewspacebar-bar-selected"
      }
    },

    "tabviewspacebar-page-button-bottom" : {
      include : "tabviewspacebar-page-button-top",

      style :
      {
        width : [3, 0, 0, 0]
      }
    },

    "tabviewspacebar-page-button-left" : {
      include : "tabviewspacebar-page-button-top",

      style :
      {
        width : [0, 3, 0, 0]
      }
    },
    "tabviewspacebar-page-button-right" : {
      include : "tabviewspacebar-page-button-top",

      style :
      {
        width : [0, 0, 0, 3]
      }
    },
    
    "tabviewspacebar-bar-top" : "tabview-bar-top",
    
    "tabviewspacebar-bar-bottom" : "tabviewspacebar-bar-top",
    
    "tabviewspacebar-bar-right" : "tabviewspacebar-bar-top",
    
    "tabviewspacebar-bar-left" : "tabviewspacebar-bar-top",
    
    /*
    ---------------------------------------------------------------------------
      SQV
      
      TAB VIEW SPOT
    ---------------------------------------------------------------------------
    */

    "tabviewspot-page-button-top" :
    {
      include : "button-box",
      
      style :
      {
        backgroundColor: "tabviewspot-button-checked"
      }
    },
    
    "tabviewspot-page-button-top-hovered" :
    {
      include : "button-box",
      
      style :
      {
        backgroundColor: "tabviewspot-button-hovered"
      }
    },
    
    "tabviewspot-bar-top" : "tabview-bar-top",
    
    "tabviewspot-bar-bottom" : "tabviewspacebar-bar-top",
    
    "tabviewspot-bar-right" : "tabviewspacebar-bar-top",
    
    "tabviewspot-bar-left" : "tabviewspacebar-bar-top",


    /*
    ---------------------------------------------------------------------------
      TABLE
    ---------------------------------------------------------------------------
    */
   
   "table-standard" :
   {
      style :
      {
        radius : 3,
        width : 10,
        color : "green",
        style : "solid"
      }
    },

    "table-pane" :
    {
      width : [0,1,0,1],
      color : "table-border"
    },

    "statusbar" :
    {
      style :
      {
        width : 1,
        color : "table-border",
        style : "solid",
        radius : [0,0,3,3]
      }
    },

    "table-scroller-focus-indicator" :
    {
      style :
      {
        width : 2,
        color : "table-focus-indicator",
        style : "solid"
      }
    },

    "table-header" :
    {
      //include : "button-box",

      style :
      {
        radius : [3,0,0,0],
        width : [1,1,1,1],
        color : "table-border"
        
      }
    },

    "table-header-column-button" :
    {
      include : "table-header",
      style : {
        radius : [0,3,0,0],
        width : [1,1,1,0],
        color : "table-border"
      }
    },
    
    "select-column-order" :
    {
    	//include: "sqv-css-icon-arrow-down",
    	style : {
    		freestyleCss : "select-column-order",
    		radius : 1,
	        width : 1,
	        widthTop : 2,
	        innerWidthTop: 1,
	        innerWidthLeft: 1,
	        innerWidthRight: 1,
	        innerWidthBottom: 1,
	        color : "gray",
	        innerColor: "gray"
    	}
    },
    
    "select-column-order-hover" :
    {
    	include: "select-column-order",
    	style : {
	        freestyleCss : "select-column-order-hover",
	        color : "black",
	        innerColor: "black"
    	}
    },

    "table-header-cell" :
    {
      style :
      {
        widthRight : 1,
        widthBottom : 0,
        color : "table-border"
      }
    },

    "table-header-cell-first" :
    {
      include : "table-header-cell",
      style : {
        radius : [0,0,0,0]
      }
    },

    "progressive-table-header" :
    {
      include : "button-box",

      style :
      {
        radius : 0,
        width : [1, 0, 1, 1]
      }
    },

    "progressive-table-header-cell" :
    {
      style :
      {
        widthRight: 1,
        color : "button-border"
      }
    },


    /*
    ---------------------------------------------------------------------------
      PROGRESSBAR
    ---------------------------------------------------------------------------
    */

    "progressbar" :
    {
      style:
      {
        backgroundColor: "#FFF",
        radius : 3,
        width: 1,
        color: "border-separator"
      }
    },
    
    "progressbar-trans" :
    {
        radius : 3,
        width: 0
    },



    /*
    ---------------------------------------------------------------------------
      RADIO BUTTON
    ---------------------------------------------------------------------------
    */
    /*"radiobutton" :
    {
      style :
      {
        radius : 10,
        width : 1,
        color : "button-border",
        innerColor: "background",
        innerWidth: 2
      }
    },*/
    "radiobutton" :
    {
      style :
      {
        radius : 10,
        width : 1,
        color : "border-light-darker",
        innerColor: "white",
        innerWidth: 3
      }
    },

    // Not used any more
    /*"radiobutton-focused" :
    {
      include : "radiobutton",
      style :
      {
        //color : "textfield-selected"
      }
    },*/

    "radiobutton-invalid" :
    {
      include : "radiobutton",
      style :
      {
        color : "invalid"
      }
    },


    /*
    ---------------------------------------------------------------------------
      CHECK BOX
    ---------------------------------------------------------------------------
    */

    /*"checkbox" :
    {
      style :
      {
        width : 1,
        color : "button-border"
      }
    },*/
   "checkbox" :
    {
      include : "radiobutton",
      
      style :
      {
        radius : 3,
        innerWidth: 0
      }
    },
    
    "checkbox-checked" :
    {
    	include : "checkbox",
    	
    	style :
    	{
    		freestyleCss : "checkbox-checked",
    		innerWidth : [0,0,4,0]
    	}
    },

    "checkbox-checked-disabled" :
    {
    	include : "checkbox-checked",
    	
    	style :
    	{
    		freestyleCss : "checkbox-checked-disabled",
    		innerWidth : [0,0,4,0]
    	}
    },
   

    "checkbox-focused" :
    {
      include : "checkbox",
      style :
      {
        color : "textfield-selected"
      }
    },

    "checkbox-checked-focused" :
    {
    	include : "checkbox-checked",
    	
    	style :
    	{
    		color : "textfield-selected"
    	}
    },

    "checkbox-invalid" :
    {
      include : "checkbox",
      style :
      {
        color : "invalid"
      }
    },

    "checkbox-checked-invalid" :
    {
      include : "checkbox-checked",
      style :
      {
        color : "invalid"
      }
    },

    "checkbox-undetermined" :
    {
      include : "checkbox",
      style :
      {
        innerWidth : [6,3],
        innerColor: "white"
      }
    },

    "checkbox-undetermined-focused" :
    {
    	include : "checkbox-undetermined",
    	
    	style :
    	{
    		color : "textfield-selected"
    	}
    },

    "checkbox-undetermined-disabled" :
    {
      include : "checkbox-undetermined",
      style :
      {
        color : "text-disabled"
      }
    },

    "checkbox-undetermined-invalid" :
    {
      include : "checkbox-undetermined",
      style :
      {
        color : "invalid"
      }
    }
  }
});
