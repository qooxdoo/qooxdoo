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
 * The Clean appearance theme.
 *
 * @asset(qx/icon/Tango/16/mimetypes/text-plain.png)
 * @asset(qx/icon/Tango/16/actions/view-refresh.png)
 * @asset(qx/icon/Tango/16/actions/window-close.png)
 * @asset(qx/icon/Tango/16/actions/dialog-cancel.png)
 * @asset(qx/icon/Tango/16/actions/dialog-ok.png)
 * 
 */
qx.Theme.define("qx.theme.clean.Appearance",
{
  appearances :
  {
    
    
    
    /*
    ---------------------------------------------------------------------------
      SQV
      
      CSS ICON
    ---------------------------------------------------------------------------
    */
    "sqvcssicontest" :
    {
    	include : "image",
    	
    	style : function(states)
    	{
    		return {
    			decorator : "sqv-css-icon-arrow-down",
    			width : 0,
    			height : 0
    		};
    	}
    },
    
    "sqvcssarttest" :
    {
    	include : "image",
    	
    	style : function(states)
    	{
    		return {
    			decorator : "sqv-css-art",
    			width : 0,
    			height : 0
    		};
    	}
    },
    
    "icss-common" :
    {
    	include : "image",
    	
    	style : function(states)
    	{
    		return {
    			font : "icssicon"
    		};
    	}
    },
    
    "icss-bars" :
    {
    	include : "icss-common",
    	
    	style : function(states)
    	{
    		return {
    			decorator : "icss-bars"
    		};
    	}
    },
    
    "icss-file-image" :
    {
    	include : "icss-common",
    	
    	style : function(states)
    	{
    		return {
    			decorator : "icss-file-image",
    			backgroundColor: "transparent"
    		};
    	}
    },
    
    "icss-test" :
    {
    	include : "icss-common",
    	
    	style : function(states)
    	{
    		return {
    			decorator : "icss-test",
    			width : 36,
    			height : 36
    		};
    	}
    },
    
    "icss-folder-o" :
    {
    	include : "icss-common",
    	
    	style : function(states)
    	{
    		return {
    			decorator : "icss-folder-o",
    			width : 46,
    			height : 36,
    			margin : [4,0,0,0]
    		};
    	}
    },
    
    "icss-file" :
    {
    	include : "icss-common",
    	
    	style : function(states)
    	{
    		return {
    			decorator : "icss-file",
    			width : 28,
    			height : 36
    		};
    	}
    },
    
    "icss-credit-card" :
    {
    	include : "icss-common",
    	
    	style : function(states)
    	{
    		return {
    			decorator : "icss-credit-card"
    		};
    	}
    },
    
    "fileicon" :
    {
    	include : "image",
    	
    	style : function(states)
    	{
    		return {
    			textColor : "white",
    			backgroundColor: "#a9a9a9"
    		};
    	}
    },
    
    "fileicon-dy" :
    {
    	include : "fileicon",
    	
    	style : function(states)
    	{
    		return {
    			decorator : "fileicon-dy"
    		};
    	}
    },
    
    "fileicon-lg" :
    {
    	include : "fileicon",
    	
    	style : function(states)
    	{
    		return {
    			decorator : "fileicon-lg",
    			width : 48,
    			height : 64
    		};
    	}
    },
    
    "fileicon-sm" :
    {
    	include : "fileicon",
    	
    	style : function(states)
    	{
    		return {
    			decorator : "fileicon-sm",
    			width : 18,
    			height : 24,
    			backgroundColor: "#307cf1"
    		};
    	}
    },
    
    /*
    ---------------------------------------------------------------------------
      CORE
    ---------------------------------------------------------------------------
    */

    "widget" : {},

    "label" :
    {
      style : function(states)
      {
        return {
          textColor : states.disabled ? "text-disabled" : undefined
        };
      }
    },

    "image" :
    {
      style : function(states)
      {
        return {
          opacity : !states.replacement && states.disabled ? 0.3 : undefined
        };
      }
    },
    
    "svg-icon" : 
    {
      include : "image",

      style : function(states)
      {
        
        var appss = qx.ui.style.Stylesheet.getInstance();
        var cssstr = "fill: gray;";
        
        var classname = ".qx-svg-icon svg";
        
        //appss.addRule(classname,cssstr);
        
        // Prep the Image widget to have font handling abilities
	    //qx.Class.include(qx.ui.basic.Image, sqv.ui.basic.MImage);
        
        return {
          decorator : "svg-icon"
        };
      }
    },

    "atom" : {},
    "atom/label" : "label",
    "atom/icon" : "image",

    "root" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background",
          textColor : "text",
          font : "default"
        };
      }
    },

    "popup" :
    {
      style : function(states)
      {
        return {
          decorator : "popup",
          backgroundColor : "background-pane"
        };
      }
    },

    "tooltip" :
    {
      include : "popup",

      style : function(states)
      {
        return {
          backgroundColor : "tooltip",
          textColor : "tooltip-text",
          decorator : "tooltip",
          padding : [ 1, 3, 2, 3 ],
          offset : [ 10, 5, 5, 5 ]
        };
      }
    },

    "tooltip/atom" : "atom",

    "tooltip-error" :
    {
      include : "tooltip",

      style : function(states)
      {
        return {
          textColor: "text-selected",
          showTimeout: 100,
          hideTimeout: 10000,
          decorator: "tooltip-error",
          font: "bold",
          backgroundColor: undefined
        };
      }
    },

    "tooltip-error/atom" : "atom",

    "iframe" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "white",
          decorator : "main-dark"
        };
      }
    },

    "move-frame" :
    {
      style : function(states)
      {
        return {
          decorator : "main-dark"
        };
      }
    },

    "resize-frame" : "move-frame",

    "dragdrop-cursor" :
    {
      style : function(states)
      {
        var icon = "nodrop";

        if (states.copy) {
          icon = "copy";
        } else if (states.move) {
          icon = "move";
        } else if (states.alias) {
          icon = "alias";
        }

        return {
          source : qx.theme.clean.Image.URLS["cursor-" + icon],
          position : "right-top",
          offset : [ 2, 16, 2, 6 ]
        };
      }
    },
    
    /*
    ---------------------------------------------------------------------------
      SVG ICONS
    ---------------------------------------------------------------------------
    */
    
    "fa-bath" :
    {
      include : "svg-icon",

      style : function(states)
      {
        return {
          padding : 2,	
          //html : sqv.ui.embed.Svg.mapfasvg("bath")
          html : qx.bom.Template.render(qx.theme.clean.Image.SVGTEMPLATES["fontawesome"], qx.theme.clean.Image.SVGCONTENT["fa-bath"])
        };
      }
    },
    
    /*
    ---------------------------------------------------------------------------
      UPLOAD
    ---------------------------------------------------------------------------
    */
   
   "upload" : {
   	style : function(states)
      {
        return {
          decorator : "upload-area"
        };
      }
   },
   
   "upload/progressbar" : "progressbar-trans",
   
   "upload/progressbar/progress":
    {
      style: function(states) {
        return {
          backgroundColor: "progressbar-gray"
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      SLIDEBAR
    ---------------------------------------------------------------------------
    */

    "slidebar" : {},
    "slidebar/scrollpane" : {},
    "slidebar/content" : {},

    "slidebar/button-forward" :
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          //icon : qx.theme.clean.Image.URLS["arrow-" + (states.vertical ? "down" : "right")]
          icon : "",
          iconProps : states.vertical ? { decorator : "sqv-css-icon-arrow-down" } : { decorator : "sqv-css-icon-arrow-right" },
          padding : [10, 12] 
        };
      }
    },

    "slidebar/button-backward" :
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          //icon : qx.theme.clean.Image.URLS["arrow-" + (states.vertical ? "up" : "left")]
          icon : "",
          iconProps : states.vertical ? { decorator : "sqv-css-icon-arrow-up" } : { decorator : "sqv-css-icon-arrow-left" },
          padding : [10, 12] 
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      TABLE
    ---------------------------------------------------------------------------
    */

    "table" : 
    {
      include : "widget",
    	
      style : function(states)
      {
        return {
          decorator : "table-standard"
        };
      }
    },

    "table/statusbar" :
    {
      style : function(states)
      {
        return {
          decorator : "statusbar",
          padding : [14, 10],
          backgroundColor : "#F9FAFB"
        };
      }
    },

    "table/column-button" :
    {
      alias : "button",

      style : function(states)
      {
        return {
          decorator : "table-header-column-button",
          padding : [14, 8],
          backgroundColor : "#F9FAFB",
          icon : "",
          iconProps : states.hovered ? {decorator : "select-column-order-hover"} : {decorator : "select-column-order"}
        };
      }
    },
    
    "table/column-button/icon" :
    {
      alias : "image",

      style : function(states)
      {
        return {
          width: 16,
          height : 18,
          decorator : "select-column-order"
          //html: sqv.theme.clean.Image.paint("select-column-order")
        };
      }
    },

    "table-column-reset-button" :
    {
      include : "menu-button",
      alias : "menu-button",

      style : function()
      {
        return {
          icon : "icon/16/actions/view-refresh.png"
        };
      }
    },

    "table-scroller/scrollbar-x": "scrollbar",
    "table-scroller/scrollbar-y": "scrollbar",

    "table-scroller" : "widget",

    "table-scroller/header": {
      style : function() {
        return {
          decorator : "table-header",
          backgroundColor : "#F9FAFB"
        };
      }
    },

    "table-scroller/pane" : 
    {   
        style : function(states)
        {
          return {
            decorator : "table-pane"
          };
        }
      },

    "table-scroller/focus-indicator" :
    {
      style : function(states)
      {
        return {
          decorator : "main"
        };
      }
    },

    "table-scroller/resize-line" :
    {
      style : function(states)
      {
        return {
          backgroundColor: "button-border",
          width: 3
        };
      }
    },

    "table-header-cell" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          decorator : states.first ? "table-header-cell-first" : "table-header-cell",
          minWidth: 13,
          font : "bold",
          alignY : "middle",
          padding : [14, 10],
          cursor : states.disabled ? undefined : "pointer",
          sortIcon : qx.theme.clean.Image.URLS["blank"], // Blank image must be present in order for the HeaderCell class to include the image object
          sortIconProps : states.sorted ? (states.sortedAscending ? {decorator : "sqv-css-icon-arrow-up-med-gray"} : {decorator : "sqv-css-icon-arrow-down-med-gray"}) : {decorator : null}
          /*sortIcon : states.sorted ?
              (qx.theme.clean.Image.URLS["table-" +
                 (states.sortedAscending ? "ascending" : "descending")
              ]) : undefined*/
        };
      }
    },

    "table-header-cell/icon" :
    {
      include : "atom/icon",

      style : function(states) {
        return {
          paddingRight : 5
        };
      }
    },

    "table-header-cell/sort-icon" :
    {
      style : function(states)
      {
       return {
          alignY : "middle",
          alignX : "right",
          source : "",
          width : 0,
          height : 0
        };
      }
    },

    "table-editor-textfield" :
    {
      include : "textfield",

      style : function(states)
      {
        return {
          decorator : undefined,
          padding : [ 2, 2 ]
        };
      }
    },

    "table-editor-selectbox" :
    {
      include : "selectbox",
      alias : "selectbox",

      style : function(states)
      {
        return {
          padding : [ 0, 2 ]
        };
      }
    },

    "table-editor-combobox" :
    {
      include : "combobox",
      alias : "combobox",

      style : function(states)
      {
        return {
          decorator : undefined
        };
      }
    },

    "progressive-table-header" : {
      style : function(states) {
        return {
          decorator: "progressive-table-header"
        };
      }
    },

    "progressive-table-header-cell" : {
      style : function(states) {
        return {
          decorator: "progressive-table-header-cell",
          padding : [5, 6, 5, 6]
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      TREEVIRTUAL
    ---------------------------------------------------------------------------
    */

    "treevirtual" : {
      include : "textfield",
      alias : "table",
      style : function(states, superStyles) {
        return {
          padding : [superStyles.padding[0] + 2, superStyles.padding[1] + 1],
          rowHeight: 24
        };
      }
    },

    "treevirtual-folder" :
    {
      style : function(states)
      {
        var icon;
        if (states.opened && states.selected)
          icon = "icon/16/places/folder-open-white.png";
        else if (states.opened && !states.selected)
          icon = "icon/16/places/folder-open-black.png";
        else if (!states.opened && states.selected)
          icon = "icon/16/places/folder-white.png";
        else
          icon = "icon/16/places/folder-black.png";
        
        return {
          //icon : (states.opened ? "icon/16/places/folder-open-black.png" : "icon/16/places/folder-black.png"),
          //icon : states.opened ? "icon/folder-open.svg" : "icon/folder.svg",
          icon : icon,
          opacity : states.drag ? 0.5 : undefined
        };
      }
    },

    "treevirtual-file" :
    {
      include : "treevirtual-folder",
      alias : "treevirtual-folder",

      style : function(states)
      {
        return {
          icon : "icon/16/places/file-outline-black.png",
          //icon : "icon/insert-drive-file.svg",
          opacity : states.drag ? 0.5 : undefined
        };
      }
    },

    "treevirtual-line" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.clean.Image.URLS["treevirtual-line"]
        };
      }
    },

    "treevirtual-contract" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.clean.Image.URLS["tree-minus"]
        };
      }
    },

    "treevirtual-expand" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.clean.Image.URLS["tree-plus"]
        };
      }
    },

    "treevirtual-only-contract" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.clean.Image.URLS["treevirtual-minus-only"]
        };
      }
    },

    "treevirtual-only-expand" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.clean.Image.URLS["treevirtual-plus-only"]
        };
      }
    },

    "treevirtual-start-contract" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.clean.Image.URLS["treevirtual-minus-start"]
        };
      }
    },

    "treevirtual-start-expand" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.clean.Image.URLS["treevirtual-plus-start"]
        };
      }
    },

    "treevirtual-end-contract" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.clean.Image.URLS["treevirtual-minus-end"]
        };
      }
    },

    "treevirtual-end-expand" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.clean.Image.URLS["treevirtual-plus-end"]
        };
      }
    },

    "treevirtual-cross-contract" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.clean.Image.URLS["treevirtual-minus-cross"]
        };
      }
    },

    "treevirtual-cross-expand" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.clean.Image.URLS["treevirtual-plus-cross"]
        };
      }
    },


    "treevirtual-end" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.clean.Image.URLS["treevirtual-end"]
        };
      }
    },

    "treevirtual-cross" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.clean.Image.URLS["treevirtual-cross"]
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      RESIZER
    ---------------------------------------------------------------------------
    */

    "resizer" :
    {
      style : function(states)
      {
        return {
          decorator : "main-dark"
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      SPLITPANE
    ---------------------------------------------------------------------------
    */

    "splitpane" : {},

    "splitpane/splitter" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "light-background"
        };
      }
    },

    "splitpane/splitter/knob" :
    {
      style : function(states)
      {
        return {
          source : qx.theme.clean.Image.URLS[
            "knob-" + (states.horizontal ? "horizontal" : "vertical")
          ],
          padding : 2
        };
      }
    },

    "splitpane/slider" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "border-light-shadow",
          opacity : 0.3
        };
      }
    },



    /*
    ---------------------------------------------------------------------------
      MENU
    ---------------------------------------------------------------------------
    */

    "menu" :
    {
      style : function(states)
      {
        var result =
        {
          backgroundColor : "background",
          decorator : "popup",
          spacingX : 12,
          spacingY : 0,
          iconColumnWidth : 16,
          arrowColumnWidth : 8,
          padding : 0,
          placementModeY : states.submenu || states.contextmenu ? "best-fit" : "keep-align",
          offset : [8,0,0,0]
        };

        if (states.submenu)
        {
          result.position = "right-top";
          result.offset = [-2, -3];
        }

        if (states.contextmenu) {
          result.offset = 4;
        }

        return result;
      }
    },

    "menu/slidebar" : "menu-slidebar",

    "menu-slidebar" : "widget",

    "menu-slidebar-button" :
    {
      style : function(states)
      {
        return {
          backgroundColor : states.hovered  ? "button-box-bright-hovered" : undefined,
          padding : 6,
          center : true
        };
      }
    },

    "menu-slidebar/button-backward" :
    {
      include : "menu-slidebar-button",

      style : function(states)
      {
        return {
          icon : "",
          iconProps : { source : "", decorator : "sqv-css-icon-arrow-up" }
        };
      }
    },

    "menu-slidebar/button-forward" :
    {
      include : "menu-slidebar-button",

      style : function(states)
      {
        return {
          icon : "",
          iconProps : { source : "", decorator : "sqv-css-icon-arrow-down" }
        };
      }
    },

    "menu-separator" :
    {
      style : function(states)
      {
        return {
          height : 0,
          decorator : "menu-separator",
          marginTop : 4,
          marginBottom: 4,
          marginLeft : 2,
          marginRight : 2
        };
      }
    },

    "menu-button" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          backgroundColor : states.selected ? "combobox-item-selected" : undefined,
          textColor : states.selected ? "black" : "text",
          padding : [ 6, 6 ]
        };
      }
    },
    
    "menu-button-header" :
    {
    	include : "menu-button",
    	
    	style : function(states)
    	{
    		return {
	          textColor : states.disabled ? "black" : "text",
	          font : "bold",
	          padding : [ 8, 6 ]
        	};
    	}
    },

    "menu-button/icon" :
    {
      include : "image",

      style : function(states)
      {
        return {
          alignY : "middle",
          marginLeft : 14
          //scale : true
         // width : 18,
          //height : 18
        };
      }
    },
    
    "menu-button-header/icon" :
    {
      include : "menu-button/icon",

      style : function(states)
      {
        return {
          marginLeft : 6
        };
      }
    },

    "menu-button/label" :
    {
      include : "label",

      style : function(states)
      {
        return {
          alignY : "middle",
          padding : 1
        };
      }
    },
    
    "menu-button-header/label" :
    {
      include : "menu-button/label",

      style : function(states)
      {
        return {
          alignY : "middle",
          padding : [1,1,1,0],
          marginLeft: -10
        };
      }
    },

    "menu-button/shortcut" :
    {
      include : "label",

      style : function(states)
      {
        return {
          alignY : "middle",
          marginLeft : 14,
          padding : 1
        };
      }
    },

    "menu-button/arrow" :
    {
      include : "image",

      style : function(states)
      {
        return {
          //source : qx.theme.clean.Image.URLS["arrow-right" + (states.selected ? "-invert" : "")],
          source : "",
          //decorator : states.selected ? "sqv-css-icon-arrow-right-invert" : "sqv-css-icon-arrow-right",
          decorator : "sqv-css-icon-arrow-right",
          alignY : "middle",
          marginLeft : 6,
          width : 0,
          height : 0
        };
      }
    },

    "menu-checkbox" :
    {
      alias : "menu-button",
      include : "menu-button",

      style : function(states)
      {
        return {
          //icon : !states.checked ? undefined : qx.theme.clean.Image.URLS["menu-checkbox"]
          //icon : qx.theme.clean.Image.URLS["blank"]
          icon : !states.checked ? undefined : qx.theme.clean.Image.URLS["blank"]
        };
      }
    },
    
    "menu-checkbox/icon" : {
      
      include : "image",
      
      style : function(states)
      {
        
        return {
          decorator : "menu-checkbox-checked",
          width: 17,
          height: 17,
          marginLeft : 14,
          padding: 0
          //backgroundColor : "text"
        };
      }
    },
    

    "menu-radiobutton" :
    {
      include : "menu-button",

      style : function(states)
      {
        return {
          //icon : !states.checked ? undefined : qx.theme.clean.Image.URLS["menu-radiobutton"] 
          icon : !states.checked ? undefined : qx.theme.clean.Image.URLS["blank"]
          //icon : qx.theme.clean.Image.URLS["blank"]
          //icon : undefined  
        };
      }
    },


    "menu-radiobutton/icon" : {
      
      include : "image",
      
      style : function(states)
      {
        var decorator = "menu-radiobutton";

        decorator += states.invalid && !states.disabled ? "-invalid" : "";

        return {
          decorator : decorator,
          width: 10,
          height: 10,
          backgroundColor : "text",
          marginLeft : 17
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      MENU BAR
    ---------------------------------------------------------------------------
    */

    "menubar" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "white",
          padding: [4, 2]
        };
      }
    },

    //"menubar-button" : "menubutton",

    "menubar-button" :
    {
      include : "menubutton",

      style : function(states)
      {
        var decorator = "button-box-blank";

        if (!states.disabled) {
          if (states.hovered && !states.pressed && !states.checked) {
            decorator = "button-box-hovered";
          } else if (states.hovered && (states.pressed || states.checked)) {
            decorator = "button-box-pressed-hovered";
          } else if (states.pressed || states.checked) {
            decorator = "button-box-pressed";
          }
        }

        if (states.invalid && !states.disabled) {
          decorator += "-invalid";
        } else if (states.focused) {
          decorator += "-focused";
        }

        return {
          decorator : decorator
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      VIRTUAL WIDGETS
    ---------------------------------------------------------------------------
    */
    "virtual-list" : "list",
    
    "virtual-list/row-layer" : "row-layer",

    "row-layer" : "widget",
    
    "column-layer" : "widget",

    "group-item" :
    {
      include : "label",
      alias : "label",

      style : function(states)
      {
        return {
          padding : 4,
          backgroundColor : "#BABABA",
          textColor : "white",
          font: "bold"
        };
      }
    },

    "virtual-selectbox" : "selectbox",
    "virtual-selectbox/dropdown" : "selectbox/popup",
    "virtual-selectbox/dropdown/list" : {
      alias : "virtual-list"
    },

    "virtual-combobox" : "combobox",
    "virtual-combobox/dropdown" : "combobox/popup",
    "virtual-combobox/dropdown/list" : {
      alias : "virtual-list"
    },
    

    "virtual-tree" : "tree",
    /*"virtual-tree" :
    {
      include : "tree",
      alias : "tree",

      style : function(states)
      {
        return {
          itemHeight : 21
        };
      }
    },*/

    "virtual-tree-folder" : "tree-folder",
    "virtual-tree-file" : "tree-file",

    "cell" :
    {
      style : function(states)
      {
        return {
          backgroundColor: states.selected ?
            "table-row-background-selected" :
            "table-row-background-even",
          textColor: states.selected ? "text-selected" : "text",
          padding: [3, 6]
        };
     }   
    },

    "cell-string" : "cell",
    "cell-number" :
    {
      include : "cell",
      style : function(states)
      {
        return {
          textAlign : "right"
        };
      }
    },
    "cell-image" : "cell",
    "cell-boolean" : "cell",
    "cell-atom" : "cell",
    "cell-date" : "cell",
    "cell-html" : "cell",


    /*
    ---------------------------------------------------------------------------
      SCROLLBAR
    ---------------------------------------------------------------------------
    */ 

    "scrollbar" : 
    {
      style : function(states)
      {

        return {
          backgroundColor: "scrollbar-bright"
        };
      }
    },
    
    "scrollbar/slider" : {},

    "scrollbar/slider/knob" :
    {
      style : function(states)
      {
        var decorator = "scroll-knob";

        if (!states.disabled) {
          if (states.hovered && !states.pressed && !states.checked) {
            decorator = "scroll-knob-hovered";
          } else if (states.hovered && (states.pressed || states.checked)) {
            decorator = "scroll-knob-pressed-hovered";
          } else if (states.pressed || states.checked) {
            decorator = "scroll-knob-pressed";
          }
        }

        return {
          height : 14,
          width : 14,
          cursor : states.disabled ? undefined : "pointer",
          decorator : decorator,
          minHeight : states.horizontal ? undefined : 20,
          minWidth : states.horizontal ? 20 : undefined
        };
      }
    },


    "scrollbar/button" :
    {
      style : function(states)
      {
        var styles = {};
        styles.padding = 4;

        var icon = "";
        if (states.left) {
          icon = "left";
          styles.marginRight = 2;
        } else if (states.right) {
          icon += "right";
          styles.marginLeft = 2;
        } else if (states.up) {
          icon += "up";
          styles.marginBottom = 2;
        } else {
          icon += "down";
          styles.marginTop = 2;
        }

        styles.icon = qx.theme.clean.Image.URLS["arrow-" + icon];

        styles.cursor = "pointer";
        styles.decorator = "button-box";
        return styles;
      }
    },

    "scrollbar/button-begin" : "scrollbar/button",
    "scrollbar/button-end" : "scrollbar/button",


    /*
    ---------------------------------------------------------------------------
      SCROLLAREA
    ---------------------------------------------------------------------------
    */

    "scrollarea/corner" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background"
        };
      }
    },

    "scrollarea" : "widget",
    "scrollarea/pane" : "widget",
    "scrollarea/scrollbar-x" : "scrollbar",
    "scrollarea/scrollbar-y" : "scrollbar",


    /*
    ---------------------------------------------------------------------------
      TEXT FIELD
    ---------------------------------------------------------------------------
    */

    "textfield" :
    {
      style : function(states)
      {
        var textColor;
        if (states.disabled) {
          textColor = "text-disabled";
        } else if (states.showingPlaceholder) {
          textColor = "text-placeholder";
        } else {
          textColor = undefined;
        }

        var decorator;
        var backgroundcolor = "white";
        if (states.disabled) {
          decorator = "inset";
          backgroundcolor = "background-disabled";
        } else if (states.invalid) {
          decorator = "border-invalid";
          backgroundcolor = "background-invalid";
        } else if (states.focused) {
          decorator = "focused-inset";
        } else {
          decorator = "inset";
        }

        return {
          decorator : decorator,
          padding   : [9, 14],
          textColor : textColor,
          backgroundColor : backgroundcolor
        };
      }
    },

    "textarea" : "textfield",
    
    "textfield-form" :
    {
    	include : "textfield",
    	 
    	style : function(states)
	    {
	      return {
	        decorator : states.focused ? "form-focused-inset" : "inset",
	        padding   : states.focused ? [9, 14, 9, 13] : [9, 14, 9, 14]
	      };
	    }
    },



    /*
    ---------------------------------------------------------------------------
      RADIO BUTTON
    ---------------------------------------------------------------------------
    */
    "radiobutton/icon" : {
      style : function(states)
      {
        var decorator = "radiobutton";

        /*if (states.focused && !states.invalid) {
          decorator = "radiobutton-focused";
        }*/

        decorator += states.invalid && !states.disabled ? "-invalid" : "";

        var backgroundColor;
        if (states.disabled && states.checked) {
          backgroundColor = "background-disabled-checked";
        } else if (states.disabled) {
          backgroundColor = "background-disabled";
        } else if (states.checked) {
          backgroundColor = "text";
        }

        return {
          decorator : decorator,
          width: 14,
          height: 14,
          backgroundColor : backgroundColor
        };
      }
    },

    "radiobutton":
    {
      style : function(states)
      {
        // set an empty icon to be sure that the icon image is rendered
        return {
          //icon : qx.theme.clean.Image.URLS["blank"]
          icon : "",
          gap : 10
        };
      }
    },

    /*
    ---------------------------------------------------------------------------
      FORM
    ---------------------------------------------------------------------------
    */
    "form-renderer-label" : {
      include : "label",
      style : function() {
        return {
          paddingTop: 3
        };
      }
    },

    /*
    ---------------------------------------------------------------------------
      CHECK BOX
    ---------------------------------------------------------------------------
    */
    "checkbox":
    {
      alias : "atom",

      style : function(states)
      {
        // The "disabled" icon is set to an icon **without** the -disabled
        // suffix on purpose. This is because the Image widget handles this
        // already by replacing the current image with a disabled version
        // (if available). If no disabled image is found, the opacity style
        // is used.
        //qx.Class.include(qx.ui.decoration.Decorator, sqv.theme.icon.MLittlebox);
        
        var icon;

        // Checked
        if (states.checked && !states.disabled) {
          //icon = qx.theme.clean.Image.URLS["checkbox-checked"];
          icon = "";
        // Undetermined
        } else if (states.checked && states.disabled) {
          //icon = qx.theme.clean.Image.URLS["checkbox-checked-disabled"];
          icon = "";
        } else if (states.undetermined) {
          //icon = qx.theme.clean.Image.URLS["checkbox-undetermined"];
          icon = "";
        // Unchecked
        } else {
          // empty icon
          //icon = qx.theme.clean.Image.URLS["blank"];
          icon = "";
        }

        return {
          icon: icon,
          //icon : "",
          //decorator :  states.undetermined ? "checkbox-undetermined" : undefined,
          gap: 10
        };
      }
    },


    "checkbox/icon" : {
      style : function(states)
      {
        
        var decorator = "checkbox";

        if (states.focused && !states.invalid) {
          decorator = "checkbox-focused";
        }

        decorator += states.invalid && !states.disabled ? "-invalid" : "";

        var padding;
        var bckgrdcolr = "text";
        // Checked
        if (states.checked) {
          padding = 0;
          decorator = "checkbox-checked";
          if (states.focused)
            decorator = "checkbox-checked-focused"; 
          if (states.invalid)
            decorator = "checkbox-checked-invalid";  
          if (states.disabled)
            decorator = "checkbox-checked-disabled";      
          // Undetermined
        } else if (states.undetermined) {
          //padding = [4, 2];
          padding = 0;
          decorator = "checkbox-undetermined";
          if (states.focused)
            decorator = "checkbox-undetermined-focused";
          if (states.invalid)
            decorator = "checkbox-undetermined-invalid"; 
          if (states.disabled) {
            decorator = "checkbox-undetermined-disabled";
            bckgrdcolr = "text-disabled";
          }
        }

        return {
          decorator: decorator,
          width: 17,
          height: 17,
          padding: padding,
          backgroundColor : states.undetermined ? bckgrdcolr : "white",
          scale: true
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      SPINNER
    ---------------------------------------------------------------------------
    */

    "spinner" :
    {
      style : function(states)
      {
        return {
          textColor : states.disabled ? "text-disabled" : undefined
        };
      }
    },

    "spinner/textfield" : 
    {
    	include : "textfield",
    	
    	style : function(states)
    	{
    		return {
    			decorator : states.focused ? "combobox-focused-inset" : "combobox-inset"
    		};
    	}
    },

    "spinner/upbutton" :
    {

      style : function(states)
      {

        return {
          //icon : qx.theme.clean.Image.URLS["arrow-up-small"],  SQV Elim URL Call
          backgroundColor : "white",
          decorator : states.hovered ? "button-box-hovered-top-right" : "button-box-top-right",
          padding : [0,3,0,4],
          icon : "",
          width: 17
        };
      }
    },
    
    "spinner/upbutton/icon" :
    {
    	include : "image",
    	
    	style : function()
    	{
    		return {
    			decorator : "sqv-css-icon-arrow-up-small",
    			width : 0,
          		height : 0
    		};
    	}
    },

    "spinner/downbutton" :
    {

      style : function(states)
      {

        return {
          //icon : qx.theme.clean.Image.URLS["arrow-down-small"], SQV Elim URL Call
          icon : "",
          backgroundColor : "white",
          decorator : states.hovered ? "button-box-hovered-bottom-right" : "button-box-bottom-right",
          padding : [0,3,0,4],
          width: 17
        };
      }
    },
    
    "spinner/downbutton/icon" :
    {
    	include : "image",
    	
    	style : function()
    	{
    		return {
    			decorator : "sqv-css-icon-arrow-down-small",
    			width : 0,
    			height : 0
    		};
    	}
    },


    /*
    ---------------------------------------------------------------------------
      SELECTBOX
    ---------------------------------------------------------------------------
    */

    //"selectbox" : "button-frame",
    "selectbox" : "textfield",

    "selectbox/atom" : "atom",

    "selectbox/popup" : {
      
      include : "popup",
    	
    	style : function(states)
    	{
        var decorator;
        var offset;
    		return {
          decorator : states.placementBottom ? "selectbox-popup-bottom" : "selectbox-popup-top"
    			//offset : states.placementBottom ? [-2,0,0,0] : [0,0,-2,0]
    		};
    	}
    },

    "selectbox/list" : {
      alias : "list",
      include : "list",

      style : function()
      {
        return {
          decorator : undefined
        };
      }
    },

    "selectbox/arrow" :
    {
      include : "image",

      style : function(states)
      {
        return {
          //source : qx.theme.clean.Image.URLS["arrow-down"],
          source : "",
          decorator : "sqv-css-icon-arrow-down",
          //paddingRight : 4,
          //paddingLeft : 5,
          width : 0,
          height : 0
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      COMBO BOX
    ---------------------------------------------------------------------------
    */

   "combobox" :{},

    "combobox/button" :
    {
      alias : "button-frame",
      include : "button-frame",

      style : function(states)
      {
        var decorator = "button-box-right-borderless";

        if (states.hovered && !states.pressed && !states.checked) {
          decorator = "button-box-hovered-right-borderless";
        } else if (states.hovered && (states.pressed || states.checked)) {
          //decorator = "button-box-pressed-hovered-right-borderless";
          decorator = "button-box-pressed-right-borderless";
        } else if (states.pressed || states.checked) {
          decorator = "button-box-pressed-right-borderless";
        }

        return {
          //icon : qx.theme.clean.Image.URLS["arrow-down"],  SQV-ELIM-URL-CALL
          icon : "",
          backgroundColor : "white",
          decorator : decorator,
          padding : [0,5,0,6],
          width: 24
        };
      }
    },
    
    "combobox/button/icon" :
    {
    	include : "image",
    	
    	style : function()
    	{
    		return {
    			decorator : "sqv-css-icon-arrow-down",
    			width : 0,
          height : 0
    		};
    	}
    },

    "combobox/popup" : "popup",
    
    "combobox/list" :     
    {
      alias : "list"
    },

    "combobox/textfield" : 
    {
    	include : "textfield",
    	
    	style : function(states)
    	{
    		return {
    			decorator : states.focused ? "combobox-focused-inset" : "combobox-inset"
    		};
    	}
    },
   


    /*
    ---------------------------------------------------------------------------
      DATEFIELD
    ---------------------------------------------------------------------------
    */

    
    "datefield" : "textfield",	

    "datefield/button" :
    {
      //alias : "combobox/button",
      //include : "combobox/button",

      style : function(states)
      {
        
        /*var appss = qx.ui.style.Stylesheet.getInstance();
        var cssstr = "fill: black;";
        
        var classname = ".qx-datechooser-button:hover svg";
        
        appss.addRule(classname,cssstr); */
        
        return {
          //icon : states.hovered ? "icon/18/editor/insert-invitation-black.png" : "icon/18/editor/insert-invitation-gray.png",
          //iconProps : states.hovered ? {html : sqv.theme.clean.Image.paint("insert-invitation-hover")} : {html : sqv.theme.clean.Image.paint("insert-invitation")},
          iconProps : states.hovered ? {fill : "black"} : {fill : "gray"},
          icon : "",
          //padding : [2, 6, 3, 4],
          padding : 0,
          backgroundColor : undefined
          //decorator : "datechooser-button"
        };
      }
    },
    
    "datefield/button/icon" :
    {
      include : "svg-icon",

      style : function(states)
      {
        return {
          width: 22,
          height: 24,
          padding : 2,	
          html : qx.bom.Template.render(qx.theme.clean.Image.SVGTEMPLATES["fontawesome"], qx.theme.clean.Image.SVGCONTENT["calendar-alt-1"])
        };
      }
    },
   
   //"datefield/button/icon" : "fa-calendar-std",

    "datefield/textfield" : {
      alias : "textfield",
      include : "textfield",

      style : function(states)
      {
        return {
          decorator : undefined,
          padding: 0
        };
      }
    },

    "datefield/list" :
    {
      alias : "datechooser",
      include : "datechooser",

      style : function(states)
      {
        return {
          decorator : undefined
        };
      }
    },



    /*
    ---------------------------------------------------------------------------
      LIST
    ---------------------------------------------------------------------------
    */
   
   "list" : 
   {
   	  alias: "scrollarea",
   		
   	  style : function(states)
      {
        var textColor;
        if (states.disabled) {
          textColor = "text-disabled";
        } else if (states.showingPlaceholder) {
          textColor = "text-placeholder";
        } else {
          textColor = undefined;
        }

        var decorator;
        var padding = [2, 0];
        var backgroundcolor = "white";
        if (states.disabled) {
          decorator = "inset";
          backgroundcolor = "background-disabled";
        } else if (states.invalid) {
          decorator = "border-invalid";
          backgroundcolor = "background-invalid";
        } else if (states.focused) {
          decorator = "focused-inset";
        } else {
          decorator = "inset";
        }

        return {
          decorator : decorator,
          padding   : padding,
          //font : "input",
          textColor : textColor,
          backgroundColor : backgroundcolor
        };
      }
   },
    
	"listitem" :
    {
      alias : "atom",

      style : function(states)
      {
        //var padding = [3, 5, 3, 14];
        var padding = [10, 10, 10, 14];
        if (states.lead) {
          padding = [ 2, 4, 2, 13];
        }
        if (states.dragover) {
          padding[2] -= 2;
        }

        var backgroundColor;
        if (states.selected) {
          backgroundColor = "combobox-item-selected";
          if (states.disabled) {
            backgroundColor = "background-selected-disabled";
          }
        }
        return {
          gap : 4,
          padding : padding,
          backgroundColor : backgroundColor,
          textColor : states.selected ? "black" : "text",
          decorator : states.lead ? "lead-item" : states.dragover ? "dragover" : undefined,
          opacity : states.drag ? 0.5 : undefined
        };
      }
    },
    

    //SQv -added
    "combobox-listitem" :
    {
      alias : "atom",

      style : function(states)
      {
        var padding = [10, 10, 10, 14];
        var decorator;
        if (states.lead) {
          padding = [ 2, 4 , 2, 4];
          //decorator = "lead-item";
        }
        if (states.dragover) {
          padding[2] -= 2;
          //decorator = "dragover";
        }

        var backgroundColor;
        var textcolor = "text";
        if (states.selected) {
          backgroundColor = "combobox-item-selected";
          textcolor = "black";
          if (states.disabled) {
            backgroundColor = "background-selected-disabled";
          }
        }
        if (states.hovered) {
          backgroundColor = "combobox-hovered";
          textcolor = "black";
          if (states.disabled) {
            backgroundColor = "background-selected-disabled";
          }
        }
        
        return {
          gap : 4,
          padding : padding,
          backgroundColor : backgroundColor,
          textColor : textcolor, 
          decorator : states.lead ? "lead-item" : states.dragover ? "dragover" : "combobox-listitem",
          opacity : states.drag ? 0.5 : undefined
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      SLIDER
    ---------------------------------------------------------------------------
    */

    "slider" :
    {
      style : function(states)
      {
        var decorator;
        if (states.disabled) {
          decorator = "inset";
        } else if (states.invalid) {
          decorator = "border-invalid";
        } else if (states.focused) {
          decorator = "focused-inset";
        } else {
          decorator = "inset";
        }

        return {
          decorator : decorator,
          padding   : [2,3]
        };
      }
    },

    "slider/knob" : "scrollbar/slider/knob",


    /*
    ---------------------------------------------------------------------------
      BUTTON
    ---------------------------------------------------------------------------
    */
    "button-frame" :
    {
      alias : "atom",

      style : function(states)
      {
        var decorator = "button-box";
        //SQ New
        var textcolor = "button-text";

        if (!states.disabled) {
          if (states.hovered && !states.pressed && !states.checked) {
            decorator = "button-box-hovered";
            textcolor = "button-text-hovered";
          } else if (states.hovered && (states.pressed || states.checked)) {
            decorator = "button-box-pressed-hovered";
            textcolor = "button-text-hovered";
          } else if (states.pressed || states.checked) {
            decorator = "button-box-pressed";
          }
        }

        if (states.invalid && !states.disabled) {
          decorator += "-invalid";
        } else if (states.focused) {
          decorator += "-focused";
        }

        return {
          decorator : decorator,
          padding : [3, 8],
          cursor: states.disabled ? undefined : "pointer",
          minWidth: 5,
          minHeight: 5,
          textColor : textcolor,
          font : "button"
        };
      }
    },
    
    
    "button-frame/label" : {
      alias : "atom/label",

      style : function(states)
      {
        return {
          textColor : states.disabled ? "text-disabled" :  "button-text"
        };
      }
    },

    "button" :
    {
      alias : "button-frame",
      include : "button-frame",

      style : function(states)
      {
        return {
          center : true,
          padding : [10, 18],
          gap : 8
        };
      }
    },

    "hover-button" :
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          decorator : states.hovered ? "button-hover" : undefined
        };
      }
    },

    "menubutton" : {
      include : "button",
      alias : "button",

      style : function(states) {
        return {
          //icon : qx.theme.clean.Image.URLS["arrow-down"],
          icon : "",
          iconPosition : "right"
        };
      }
    },
    
    "menubutton/icon" : "combobox/button/icon",
    
    /*
    ---------------------------------------------------------------------------
      SQv
      
      PRIMARY BUTTON
    ---------------------------------------------------------------------------
    */
   
    "primary-button-frame" :
    {
	  include :"button-frame",
      style : function(states)
      {
        var decorator = "primary-button-box";

        if (!states.disabled) {
          if (states.hovered && !states.pressed && !states.checked) {
            decorator = "primary-button-box-hovered";
          } else if (states.hovered && (states.pressed || states.checked)) {
            decorator = "primary-button-box-pressed";
          } else if (states.pressed || states.checked) {
            decorator = "primary-button-box-pressed";
          }
        }

        return {
          decorator : decorator,
          textColor : "primary-button-text"
        };
      }
    },
    
    "primary-button" :
    {
      alias : "primary-button-frame",
      include : "primary-button-frame",

      style : function(states)
      {
        return {
          center : true,
          padding : [10, 18]
        };
      }
    },
    
    "primary-button/icon" :
    {
    	include : "image",
    	
    	style : function(states)
    	{
    		return {
    			scale : true,
    			width : 18,
    			height : 18
    		};
    	}
    },
    
    /*
    ---------------------------------------------------------------------------
      SQv
      
      SECONDARY BUTTON
    ---------------------------------------------------------------------------
    */
   
    "secondary-button-frame" :
    {
	  include :"button-frame",
      style : function(states)
      {
        var decorator = "secondary-button-box";

        if (!states.disabled) {
          if (states.hovered && !states.pressed && !states.checked) {
            decorator = "secondary-button-box-hovered";
          } else if (states.hovered && (states.pressed || states.checked)) {
            decorator = "secondary-button-box-pressed";
          } else if (states.pressed || states.checked) {
            decorator = "secondary-button-box-pressed";
          }
        }

        return {
          decorator : decorator,
          textColor : "secondary-button-text"
        };
      }
    },
    
    "secondary-button" :
    {
      alias : "secondary-button-frame",
      include : "secondary-button-frame",

      style : function(states)
      {
        return {
          center : true,
          padding : [10, 18]
        };
      }
    },
    
    "secondary-button/icon" : "primary-button/icon",
    
    /*
    ---------------------------------------------------------------------------
      SQv
      
      TERTIARY BUTTON
    ---------------------------------------------------------------------------
    */
   
    "tertiary-button-frame" :
    {
	  include :"button-frame",
      style : function(states)
      {
        var decorator = "tertiary-button-box";

        if (!states.disabled) {
          if (states.hovered && !states.pressed && !states.checked) {
            decorator = "tertiary-button-box-hovered";
          } else if (states.hovered && (states.pressed || states.checked)) {
            decorator = "tertiary-button-box-pressed";
          } else if (states.pressed || states.checked) {
            decorator = "tertiary-button-box-pressed";
          }
        }

        return {
          decorator : decorator,
          textColor : "tertiary-button-text"
        };
      }
    },
    
    "tertiary-button" :
    {
      alias : "tertiary-button-frame",
      include : "tertiary-button-frame",

      style : function(states)
      {
        return {
          center : true,
          padding : [10, 18]
        };
      }
    },
    
    "tertiary-button/icon" : "primary-button/icon",
    
    
    "svgbutton" :
    {
      include : "button",

      style : function(states)
      {
        return {
          /*icon : states.hovered ? sqv.ui.embed.Svg.mapsvg( 
          	{
          		id:"sqlogo",
		  		width:"130",
		  		height:"130",
		  		viewbox_width:"130",
		  		viewbox_height:"130",
		  		path1fill:"red",
		  		ellipsestroke:"yellow"
          	}) : sqv.ui.embed.Svg.mapsvg( 
          	{
				id:"sqlogo",
		  		width:"130",
		  		height:"130",
		  		viewbox_width:"130",
		  		viewbox_height:"130",
		  		path1fill:"blue",
		  		ellipsestroke:"green"
          	})*/
        };
      }
    },
    
    "svgrawbutton" :
    {
      include : "button",

      style : function(states)
      {
        return {
          icon : "",
          width : 160,
          height : 150
          /*iconProps : {width: 130, height: 130, html : sqv.ui.embed.Svg.mapsvg( 
          	{
          		id:"sqlogo",
		  		width:"130",
		  		height:"130",
		  		viewbox_width:"130",
		  		viewbox_height:"130",
		  		path1fill:"red",
		  		ellipsestroke:"yellow"
          	}, false)}*/
        };
      }
    },

    
    /*
    ---------------------------------------------------------------------------
      SQv
      
      ICONS
    ---------------------------------------------------------------------------
    */
   
   "sqv-css-icon-arrow-down" :
    {
      style : function(states)
      {
        return {
          alignY : "middle",
          width : 0,
          height : 0,	
          decorator : "sqv-css-icon-arrow-down"
        };
      }
    },
   
    "sqv-icon-arrow-down" :
    {
      style : function(states)
      {
        return {
          alignY : "top",
          width : 16,
          height : 8,	
          font: "unicode-icons-sm",
          //backgroundColor : "transparent",
          decorator : "sqv-icon-arrow-down"
        };
      }
    },
	
	"icon-button" :
    {
      include : "button-frame",

      style : function(states)
      {
        return {
          center : true,
          padding : [10, 10]
        };
      }
    },
    
    "sqv-css-icon" :
    {
    	style : function(states)
	      {
	        return {
	          alignY : "top",
	          padding : [0,0,0,0],
	          margin : [0,0,0,0],
	          height : 1
	        };
	      }
    },
    
    "lb-search" :
    {
      style : function(states)
      {
        return {
          alignY : "middle",
          width : 20,
          height : 20,
          margin : [1, 0, 0, 4],
          font: "lbicon",
          backgroundColor : "transparent",
          decorator : "lb-search"
        };
      }
    },
    
    "lb-check" :
    {
      style : function(states)
      {
        return {
          //icon : qx.theme.clean.Image.URLS["arrow-down"],
          alignY : "middle",
          margin : [0, 0, 3, 5],
          width : 18,
          height : 3,
          decorator : "lb-check"
        };
      }
    },
    
    "lb-soundbar" :
    {
      style : function(states)
      {
        return {
          alignY : "middle",
          //margin : [0, 0, 3, 5],
          font: "lbicon",
          decorator : "lb-soundbar"
        };
      }
    },
    
    "od-star" :
    {
      style : function(states)
      {
        return {
          alignY : "middle",
          margin : [0, 0, 0, 0],
          width : 0,
          height : 0,
          font : "odicon",
          decorator : "od-star"
        };
      }
    },
    
    "icono-calendar" :
    {
      style : function(states)
      {
        return {
          alignY : "middle",
          margin : [3, 0, 0, 0],
          width : 16,
          height : 14,
          font : "icono",
          decorator : "icono-calendar"
        };
      }
    },
   

    /*
    ---------------------------------------------------------------------------
      SPLIT BUTTON
    ---------------------------------------------------------------------------
    */
    "splitbutton" : {
    	style : function(states)
    	{
    		return {decorator: "splitbutton"};
    	}
    },

    "splitbutton/button" :
    {
      include : "button",
      

      style : function(states)
      {
        var decorator = "splitbutton-box";

        if (!states.disabled) {
          if (states.pressed || states.checked) {
            decorator += "-pressed";
          }
          if (states.hovered) {
            decorator += "-hovered";
          }
        }

        /*if (states.focused) {
          decorator += "-focused";
        }*/

        decorator += "-left";

        return {
          decorator : decorator,
          cursor : states.disabled ? undefined : "pointer"
        };
      }
    },

    "splitbutton/arrow" : {

      style : function(states)
      {
        var decorator = "button-box";

        if (!states.disabled) {
          if (states.pressed || states.checked) {
            decorator += "-pressed";
          }
          if (states.hovered) {
            decorator += "-hovered";
          }
        }

        if (states.focused) {
          decorator += "-focused";
        }

        decorator += "-right";

        return {
          //icon : qx.theme.clean.Image.URLS["arrow-down"],
          icon : "",
          decorator : decorator,
          cursor : states.disabled ? undefined : "pointer",
          padding: [3, 8]
        };
      }
    },
    
    "splitbutton/arrow/icon" : "combobox/button/icon",
    
    "splitbutton-menu" :
    {
    	include : "menu",
    	
    	style : function(states)
    	{
    		var result =
	        {
	    	  position : "bottom-right"
	        };
	
	        return result;
    	}
    },


    /*
    ---------------------------------------------------------------------------
      GROUP BOX
    ---------------------------------------------------------------------------
    */

    "groupbox" : {},
    
    "groupbox-connected" : {
      style : function(states)
      {
        return {
          backgroundColor : "background",
          //padding : [6, 9],
          //margin: [18, 2, 2, 2],
          decorator  : "white-box"
        };
      }
    },
    
    "groupbox-blue-top" : {},
    
    "groupbox-orange-top" : {},
    
    "groupbox-green-top" : {},

    "groupbox/legend" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          textColor : states.invalid ? "invalid" : undefined,
          padding : 5,
          margin : 4,
          font: "bold"
        };
      }
    },
    
    "groupbox-connected/legend" : "groupbox/legend",
    
    "groupbox-blue-top/legend" : "groupbox/legend",
    
    "groupbox-orange-top/legend" : "groupbox/legend",
    
    "groupbox-green-top/legend" : "groupbox/legend",

    "groupbox/frame" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background",
          padding : [6, 9],
          margin: [18, 2, 2, 2],
          decorator  : "white-box"
        };
      }
    },
    
    "groupbox-connected/frame" :
    {
      include : "groupbox/frame",
      
      style : function(states)
      {
        return {
          decorator  : "connected-top-box"
        };
      }
    },
    
    "groupbox-blue-top/frame" :
    {
      include : "groupbox/frame",
      
      style : function(states)
      {
        return {
          decorator  : "blue-top-box"
        };
      }
    },
    
    "groupbox-orange-top/frame" :
    {
      include : "groupbox/frame",
      
      style : function(states)
      {
        return {
          decorator  : "orange-top-box"
        };
      }
    },
    
    "groupbox-green-top/frame" :
    {
      include : "groupbox/frame",
      
      style : function(states)
      {
        return {
          decorator  : "green-top-box"
        };
      }
    },

    "check-groupbox" : "groupbox",

    "check-groupbox/legend" :
    {
      alias : "checkbox",
      include : "checkbox",

      style : function(states)
      {
        return {
          textColor : states.invalid ? "invalid" : undefined,
          padding : 5,
          margin : 4,
          font: "bold"
        };
      }
    },

    "radio-groupbox" : "groupbox",

    "radio-groupbox/legend" :
    {
      alias : "radiobutton",
      include : "radiobutton",

      style : function(states)
      {
        return {
          textColor : states.invalid ? "invalid" : undefined,
          padding : 5,
          margin : 4,
          font: "bold"
        };
      }
    },



    /*
    ---------------------------------------------------------------------------
      TREE
    ---------------------------------------------------------------------------
    */

    "tree-folder/open" :
    {
      include : "image",
      style : function(states)
      {
        return {
          source : "",
          decorator : states.opened ? "sqv-css-icon-triangle-bottom-right" : "sqv-css-icon-arrow-right",
          margin : states.opened ? [4,0,0,0] : [0,0,0,0],
          padding : states.opened ? [4,0,0,0] : [0,0,0,0],
          alignX: "left",
          width : 0,
          height : 0
        };
      }
    },


    "tree-folder" :
    {
      style : function(states)
      {
        var backgroundColor;
        if (states.selected) {
          backgroundColor = "combobox-item-selected";
          if (states.disabled) {
            backgroundColor = "background-selected-disabled";
          }
        }
        return {
          padding : [3, 8, 3, 5],
          icon : states.opened ? "icon/folder-open.svg" : "icon/folder.svg",
          //icon : states.opened ? "icon/folder-open.svg" : sqv.ui.embed.Svg.,
          backgroundColor : backgroundColor,
          iconOpened : "icon/folder-open.svg",
          opacity : states.drag ? 0.5 : undefined
        };
      }
    },

    "tree-folder/icon" :
    {
      include : "image",
      style : function(states)
      {
        return {
          marginLeft: 6,
          width : 18,
          height : 18,
          scale : true
        };
      }
    },

    "tree-folder/label" :
    {
      style : function(states)
      {
        return {
          padding : [ 1, 4 ],
          textColor : states.selected && !states.disabled ? "black" : "text"
        };
      }
    },

    "tree-file" :
    {
      include : "tree-folder",
      alias : "tree-folder",

      style : function(states)
      {
        return {
          icon : "icon/insert-drive-file.svg",
          opacity : states.drag ? 0.5 : undefined
        };
      }
    },
    
    "tree-file/icon" :
    {
      include : "image",
      style : function(states)
      {
        return {
          padding : [0, 4, 0, 0],
          width : 18,
          height : 18,
          scale : true
        };
      }
    },

    "tree" :
    {
      include : "list",
      alias : "list",

      style : function(states)
      {
        return {
          contentPadding : states.invalid && !states.disabled? [3, 0] : [4, 1],
          padding : states.focused ? 0 : 0
        };
      }
    },
    
    /*
    ---------------------------------------------------------------------------
      DIAGRAM
    ---------------------------------------------------------------------------
    */

    "connector" :
    {
      include : "window",
      alias : "window",
      
      style : function(states)
      {
        return {
          contentPadding : 0,
          backgroundColor : "transparent",
          decorator : states.maximized ? undefined : states.active ? "connector-active" : undefined
        };
      }
    },



    /*
    ---------------------------------------------------------------------------
      WINDOW
    ---------------------------------------------------------------------------
    */

    "window" :
    {
      style : function(states)
      {
        return {
          contentPadding : [ 10, 10, 10, 10 ],
          backgroundColor : "background",
          decorator : states.maximized ? undefined : states.active ? "window-active" : "window"
        };
      }
    },

    "window-resize-frame" : "resize-frame",

    "window/pane" : {},

    "window/captionbar" :
    {
      style : function(states)
      {
        return {
          //backgroundColor : states.active ? "background" : "background-disabled",
          backgroundColor : "background",
          padding : 8,
          font: "bold",
          decorator : "window-caption"
        };
      }
    },

    "window/icon" :
    {
      style : function(states)
      {
        return {
          marginRight : 4
        };
      }
    },

    "window/title" :
    {
      style : function(states)
      {
        return {
          cursor : "default",
          font : "window-header",
          marginRight : 20,
          alignY: "middle"
        };
      }
    },

    "window/minimize-button" :
    {
      alias : "button",

      style : function(states)
      {
        return {
          //icon : qx.theme.clean.Image.URLS["window-minimize"],
          icon : "",
          //padding : [ 1, 2 ],
          padding : [7,3,0,0],
          marginRight : 6,
          cursor : states.disabled ? undefined : "pointer"
        };
      }
    },
    
    "window/minimize-button/icon" :
    {
      include : "image",

      style : function(states)
      {
        return {
          decorator : states.hovered ? "window-button-minimize-icon-hover" : "window-button-minimize-icon"
        };
      }
    },
    
    
    "window/restore-button" :
    {
      alias : "button",

      style : function(states)
      {
        return {
          //icon : qx.theme.clean.Image.URLS["window-restore"],
          icon : "",
          padding : [ 1, 2 ],
          marginRight : 4,
          marginLeft : 4,
          cursor : states.disabled ? undefined : "pointer"
        };
      }
    },
    
    "window/restore-button/icon" :
    {
      include : "image",

      style : function(states)
      {
        return {
          width : 12,
          height : 12,
          decorator : states.hovered ? "window-button-restore-icon-hover" : "window-button-restore-icon"
        };
      }
    },

    "window/maximize-button" :
    {
      alias : "button",

      style : function(states)
      {
        return {
          //icon : qx.theme.clean.Image.URLS["window-maximize"],
          icon : "",
          padding : [ 1, 2 ],
          marginRight : 6,
          marginLeft : 6,
          cursor : states.disabled ? undefined : "pointer"
        };
      }
    },
    
    "window/maximize-button/icon" :
    {
      include : "image",

      style : function(states)
      {
        return {
          decorator : states.hovered ? "window-button-maximize-icon-hover" : "window-button-maximize-icon",
          width : 12,
          height : 12
        };
      }
    },

    "window/close-button" :
    {
      alias : "button",

      style : function(states)
      {
        return {
          //icon : qx.theme.clean.Image.URLS["window-close"],
          icon : "",
          padding : [ 1, 2 ],
          marginLeft: 6,
          cursor : states.disabled ? undefined : "pointer"
        };
      }
    },
    
    "window/close-button/icon" :
    {
      include : "image",

      style : function(states)
      {
        return {
          //decorator : states.hovered ? "window-button-close-icon-hover" : "window-button-close-icon",
          width : 14,
          height : 14,
          decorator : states.hovered ? "window-button-close-icon-hover" : "window-button-close-icon"
        };
      }
    },

    "window/statusbar" :
    {
      style : function(states)
      {
        return {
          decorator : "statusbar",
          padding : [ 2, 6 ]
        };
      }
    },

    "window/statusbar-text" : "label",



    /*
    ---------------------------------------------------------------------------
      DATE CHOOSER
    ---------------------------------------------------------------------------
    */

    "datechooser" :
    {
      style : function(states)
      {
        return {
          decorator : "main",
          minWidth: 220
        };
      }
    },

    "datechooser/navigation-bar" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background",
          textColor : states.disabled ? "text-disabled" : states.invalid ? "invalid" : undefined,
          padding : [2, 10]
        };
      }
    },

    "datechooser/last-year-button-tooltip" : "tooltip",
    "datechooser/last-month-button-tooltip" : "tooltip",
    "datechooser/next-year-button-tooltip" : "tooltip",
    "datechooser/next-month-button-tooltip" : "tooltip",

    "datechooser/last-year-button" : "datechooser/button",
    "datechooser/last-month-button" : "datechooser/button",
    "datechooser/next-year-button" : "datechooser/button",
    "datechooser/next-month-button" : "datechooser/button",
    "datechooser/button/icon" : {},
    
    "datechooser/last-month-button/icon" : 
    {
    	include : "image",
    	
    	style : function()
    	{
    		return {
    			decorator : "sqv-css-icon-arrow-left-small",
    			width : 0,
                height : 0
    		};
    	}
    },
    
    "datechooser/next-month-button/icon" : 
    {
    	include : "image",
    	
    	style : function()
    	{
    		return {
    			decorator : "sqv-css-icon-arrow-right-small",
    			width : 0,
                height : 0
    		};
    	}
    },
    
    /*"datechooser/next-year-button/icon" : 
    {
    	include : "image",
    	
    	style : function()
    	{
    		return {
    			decorator : "sqv-css-icon-arrow-forward"
    		};
    	}
    },*/

    "datechooser/button" :
    {
      style : function(states)
      {
        var result = {
          backgroundColor : "white",
          width  : 14,
          show   : "icon",
          cursor : states.disabled ? undefined : "pointer"
        };

        if (states.lastYear) {
          result.icon = qx.theme.clean.Image.URLS["arrow-rewind"];
        } else if (states.lastMonth) {
          result.paddingLeft = 4;
          result.marginLeft = 6;
          result.icon = "";
        } else if (states.nextYear) {
          result.icon = qx.theme.clean.Image.URLS["arrow-forward"];
          //result.icon = "";
        } else if (states.nextMonth) {	
          result.icon = "";
          result.paddingLeft = 4;
          result.marginRight = 6;
        }

        return result;
      }
    },

    "datechooser/month-year-label" :
    {
      style : function(states)
      {
        return {
          font          : "bold",
          textAlign     : "center"
        };
      }
    },

    "datechooser/date-pane" :
    {
      style : function(states)
      {
        return {
          decorator       : "datechooser-date-pane",
          backgroundColor : "background"
        };
      }
    },

    "datechooser/weekday" :
    {
      style : function(states)
      {
        return {
          decorator       : "datechooser-weekday",
          font            : "bold",
          textAlign       : "center",
          textColor       : states.disabled ? "text-disabled" : states.weekend ? "text" : "background",
          backgroundColor : states.weekend ? "background" : "primary",
          paddingTop: 2
        };
      }
    },

    "datechooser/day" :
    {
      style : function(states)
      {
        return {
          textAlign       : "center",
          decorator       : states.today ? "main" : undefined,
          textColor       : states.disabled ? "text-disabled" : states.selected ? "text-selected" : states.otherMonth ? "text-disabled" : undefined,
          backgroundColor : states.disabled ? undefined : states.selected ? "primary" : undefined,
          padding         : states.today ? [ 1, 3 ] : [2, 4]
        };
      }
    },

    "datechooser/week" :
    {
      style : function(states)
      {
        return {
          textAlign : "center",
          textColor : "black",
          padding   : [ 2, 4 ],
          decorator : states.header ? "datechooser-week-header" : "datechooser-week"
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      PROGRESSBAR
    ---------------------------------------------------------------------------
    */
    "progressbar":
    {
      style: function(states) {
        return {
          decorator: "progressbar",
          padding: 0,
          //backgroundColor: "white",
          width : 200,
          height : 20
        };
      }
    },
    
    "progressbar-trans":
    {
      include: "progressbar",
      style: function(states) {
        return {
          decorator: "progressbar-trans",
          backgroundColor: "transparent"
        };
      }
    },

    "progressbar/progress":
    {
      style: function(states) {
        return {
          backgroundColor: "primary"
        };
      }
    },



    /*
    ---------------------------------------------------------------------------
      TOOLBAR
    ---------------------------------------------------------------------------
    */

    "toolbar" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "white",
          padding : 0
        };
      }
    },

    "toolbar/part" : {
      style : function(states)
      {
        return {
          margin : [0 , 15]
        };
      }
    },

    "toolbar/part/container" : {},
    "toolbar/part/handle" : {},

    "toolbar-separator" :
    {
      style : function(states)
      {
        return {
          decorator : "toolbar-separator",
          margin: [7, 0],
          width: 4
        };
      }
    },

    "toolbar-button" :
    {
      alias : "atom",

      style : function(states)
      {
        var decorator = "button-box";

        if (states.disabled) {
          decorator = "button-box";
        } else if (states.hovered && !states.pressed && !states.checked) {
          decorator = "button-box-hovered";
        } else if (states.hovered && (states.pressed || states.checked)) {
          decorator = "button-box-pressed-hovered";
        } else if (states.pressed || states.checked) {
          decorator = "button-box-pressed";
        }

        // set the right left and right decoratos
        if (states.left) {
          decorator += "-left";
        } else if (states.right) {
          decorator += "-right";
        } else if (states.middle) {
          decorator += "-middle";
        }

        // set the margin
        var margin = [7, 10];
        if (states.left || states.middle || states.right) {
          margin = [7, 0];
        }

        return {
          cursor  : states.disabled ? undefined : "pointer",
          decorator : decorator,
          margin : margin,
          center : true,
          padding : [10, 18],
          gap : 8
        };
      }
    },

    "toolbar-menubutton" :
    {
      alias : "toolbar-button",
      include : "toolbar-button",

      style : function(states)
      {
        return {
          showArrow : true
        };
      }
    },

    "toolbar-menubutton/arrow" :
    {
      include : "image",

      style : function(states)
      {
        return {
          //source : qx.theme.clean.Image.URLS["arrow-down"],
          source : "",
          decorator : "sqv-css-icon-arrow-down",
          cursor : states.disabled ? undefined : "pointer",
          marginLeft: 2,
          width : 6,
          height : 0
        };
      }
    },

    "toolbar-splitbutton" : {},
    "toolbar-splitbutton/button" :
    {
      alias : "toolbar-button",
      include : "toolbar-button",

      style : function(states)
      {
        var decorator = "button-box";

        if (states.disabled) {
          decorator = "button-box";
        } else if (states.hovered && !states.pressed && !states.checked) {
          decorator = "button-box-hovered";
        } else if (states.hovered && (states.pressed || states.checked)) {
          decorator = "button-box-pressed-hovered";
        } else if (states.pressed || states.checked) {
          decorator = "button-box-pressed";
        }

        // set the right left and right decoratos
        if (states.left) {
          decorator += "-left";
        } else if (states.right) {
          decorator += "-middle";
        } else if (states.middle) {
          decorator += "-middle";
        }

        return {
          //icon : qx.theme.clean.Image.URLS["arrow-down"],
          icon : "",
          decorator : decorator
        };
      }
    },


    "toolbar-splitbutton/arrow" :
    {
      alias : "toolbar-button",
      include : "toolbar-button",

      style : function(states)
      {
        var decorator = "button-box";

        if (states.disabled) {
          decorator = "button-box";
        } else if (states.hovered && !states.pressed && !states.checked) {
          decorator = "button-box-hovered";
        } else if (states.hovered && (states.pressed || states.checked)) {
          decorator = "button-box-pressed-hovered";
        } else if (states.pressed || states.checked) {
          decorator = "button-box-pressed";
        }

        // set the right left and right decoratos
        if (states.left) {
          decorator += "-middle";
        } else if (states.right) {
          decorator += "-right";
        } else if (states.middle) {
          decorator += "-middle";
        }

        return {
          //icon : qx.theme.clean.Image.URLS["arrow-down"],
          icon : "",
          decorator : decorator,
          padding: [3, 6]
        };
      }
    },

    "toolbar-splitbutton/arrow/icon" : "combobox/button/icon",


    /*
    ---------------------------------------------------------------------------
      TABVIEW
    ---------------------------------------------------------------------------
    */

    "tabview" : {},

    "tabview/bar" :
    {
      alias : "slidebar",

      style : function(states)
      {
        var marginTop=0, marginRight=0, marginBottom=0, marginLeft=0;

        if (states.barTop) {
          marginBottom -= 1;
        } else if (states.barBottom) {
          marginTop -= 1;
        } else if (states.barRight) {
          marginLeft -= 1;
        } else {
          marginRight -= 1;
        }

        return {
          marginBottom : marginBottom,
          marginTop : marginTop,
          marginLeft : marginLeft,
          marginRight : marginRight
        };
      }
    },


    "tabview/bar/button-forward" :
    {
      include : "slidebar/button-forward",
      alias : "slidebar/button-forward",

      style : function(states)
      {
        if (states.barTop) {
          return {
            marginTop : 4,
            marginBottom: 2,
            iconProps : { decorator : "sqv-css-icon-arrow-right" }
            //decorator : null
          };
        } else if (states.barBottom) {
          return {
            marginTop : 2,
            marginBottom: 4,
            iconProps : { decorator : "sqv-css-icon-arrow-right" }
            //decorator : null
          };
        } else if (states.barLeft) {
          return {
            marginLeft : 4,
            marginRight : 2,
            iconProps : { decorator : "sqv-css-icon-arrow-down" }
           // decorator : null
          };
        } else {
          return {
            marginLeft : 2,
            marginRight : 4,
            iconProps : { decorator : "sqv-css-icon-arrow-down" }
            //decorator : null
          };
        }
      }
    },

    "tabview/bar/button-backward" :
    {
      include : "slidebar/button-backward",
      alias : "slidebar/button-backward",

      style : function(states)
      {
        if (states.barTop) {
          return {
            marginTop : 4,
            marginBottom: 2,
            iconProps : { decorator : "sqv-css-icon-arrow-left" }
            //decorator : null
          };
        } else if (states.barBottom) {
          return {
            marginTop : 2,
            marginBottom: 4,
            iconProps : { decorator : "sqv-css-icon-arrow-left" }
            //decorator : null
          };
        } else if (states.barLeft) {
          return {
            marginLeft : 4,
            marginRight : 2,
            iconProps : { decorator : "sqv-css-icon-arrow-up" }
            //decorator : null
          };
        } else {
          return {
            marginLeft : 2,
            marginRight : 4,
            iconProps : { decorator : "sqv-css-icon-arrow-up" }
            //decorator : null
          };
        }
      }
    },

    "tabview/pane" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background",
          decorator : "main",
          padding : 10
        };
      }
    },

    "tabview-page" : "widget",
    
    

    "tabview-page/button" :
    {
      style : function(states)
      {
        var decorator;

        // default padding
        if (states.barTop || states.barBottom) {
          //var padding = [8, 16, 8, 13];
          var padding = [12, 18, 12, 15];
        } else {
          //var padding = [8, 4, 8, 4];
          var padding = [12, 8, 12, 8];
        }

        // decorator
        if (states.checked) {
          if (states.barTop) {
            decorator = "tabview-page-button-top";
          } else if (states.barBottom) {
            decorator = "tabview-page-button-bottom";
          } else if (states.barRight) {
            decorator = "tabview-page-button-right";
          } else if (states.barLeft) {
            decorator = "tabview-page-button-left";
          }
        } else {
          for (var i=0; i < padding.length; i++) {
            padding[i] += 1;
          }
          // reduce the size by 1 because we have different decorator border width
          if (states.barTop) {
            padding[2] -= 1;
          } else if (states.barBottom) {
            padding[0] -= 1;
          } else if (states.barRight) {
            padding[3] -= 1;
          } else if (states.barLeft) {
            padding[1] -= 1;
          }
        }

        return {
          zIndex : states.checked ? 10 : 5,
          decorator : decorator,
          textColor : states.disabled ? "text-disabled" : states.checked ? null : "button-text",
          font : states.checked ? "bold" : "bold",
          padding : padding,
          cursor: "pointer"
        };
      }
    },

    "tabview-page/button/label" :
    {
      alias : "label",

      style : function(states)
      {
        return {
          padding : [0, 1, 0, 1]
        };
      }
    },

    "tabview-page/button/icon" : "image",
    "tabview-page/button/close-button" :
    {
      alias : "atom",
      style : function(states)
      {
        return {
          cursor : states.disabled ? undefined : "pointer",
          icon : qx.theme.clean.Image.URLS["tabview-close"]
        };
      }
    },
    
    /*
    ---------------------------------------------------------------------------
      SQV
      
      TABVIEWSPACEBAR
    ---------------------------------------------------------------------------
    */

    "tabviewspacebar" : {},

    "tabviewspacebar/bar" : "tabview/bar",

    "tabviewspacebar/bar/button-forward" : "tabview/bar/button-forward",

    "tabviewspacebar/bar/button-backward" : "tabview/bar/button-backward",

    "tabviewspacebar/pane" : 
    {
      
      style : function(states)
      {
        var margin;
        
        if (states.barTop) {
        	margin = [10, 0, 0, 0];
        } else if (states.barBottom) {
        	margin = [0, 0, 10, 0];
        } else if (states.barRight) {
        	margin = [0, 10, 0, 0];
        } else if (states.barLeft) {
        	margin = [0, 0, 0, 10];
        }
        
        return {
          backgroundColor : "background",
          decorator : "main",
          margin : margin,
          padding : 10
        };
      }
    },

    "tabviewspacebar-page" : "tabview-page",
    
    "tabviewspacebar-page/button" : 
    {
      include : "tabview-page/button",
      
      style : function(states)
      {
        var decorator;

        // default padding
        if (states.barTop || states.barBottom) {
          var padding = [12, 18, 12, 15];
        } else {
          var padding = [12, 8, 12, 8];
        }

        // decorator
        if (states.checked) {
          if (states.barTop) {
            decorator = "tabviewspacebar-page-button-top";
          } else if (states.barBottom) {
            decorator = "tabviewspacebar-page-button-bottom";
          } else if (states.barRight) {
            decorator = "tabviewspacebar-page-button-right";
          } else if (states.barLeft) {
            decorator = "tabviewspacebar-page-button-left";
          }
        } else {
          for (var i=0; i < padding.length; i++) {
            padding[i] += 1;
          }
          // reduce the size by 1 because we have different decorator border width
          if (states.barTop) {
            padding[2] += 2;
            padding[1] -= 1;
            padding[3] -= 1;
            padding[0] -= 1;
          } else if (states.barBottom) {
            padding[0] += 2;
            padding[1] -= 1;
            padding[3] -= 1;
          } else if (states.barRight) {
            padding[3] += 2;
            padding[0] -= 1;
            padding[2] -= 1;
          } else if (states.barLeft) {
            padding[1] += 2;
            padding[0] -= 1;
            padding[2] -= 1;
            padding[3] -= 1;
          }
        }

        return {
          decorator : decorator,
          padding : padding
        };
      }
    },

    "tabviewspacebar-page/button/label" : "tabview-page/button/label",

    "tabviewspacebar-page/button/icon" : "tabview-page/button/icon",
    
    "tabviewspacebar-page/button/close-button" : "tabview-page/button/close-button",
    
    /*
    ---------------------------------------------------------------------------
      SQV
      
      TABVIEWSPOT
    ---------------------------------------------------------------------------
    */

    "tabviewspot" : {},

    "tabviewspot/bar" : "tabviewspacebar/bar",

    "tabviewspot/bar/button-forward" : "tabviewspacebar/bar/button-forward",

    "tabviewspot/bar/button-backward" : "tabviewspacebar/bar/button-backward",

    "tabviewspot/pane" : "tabviewspacebar/pane",

    "tabviewspot-page" : "tabviewspacebar-page",
    
    "tabviewspot-page/button" : 
    {
      include : "tabviewspacebar-page/button",
      
      style : function(states)
      {
        var decorator;

        // default padding
        if (states.barTop || states.barBottom) {
          var padding = [8, 15, 8, 15];
        } else {
          var padding = [8, 8, 8, 8];
        }

        // decorator
        if (states.checked) {
          decorator = "tabviewspot-page-button-top";
        } else if (states.hovered) {
          decorator = "tabviewspot-page-button-top-hovered";
        }

        return {
          decorator : decorator,
          padding : padding
        };
      }
    },

    "tabviewspot-page/button/label" : "tabviewspacebar-page/button/label",

    "tabviewspot-page/button/icon" : "tabviewspacebar-page/button/icon",
    
    "tabviewspot-page/button/close-button" : "tabviewspacebar-page/button/close-button",

    /*
    ---------------------------------------------------------------------------
      COLOR POPUP
    ---------------------------------------------------------------------------
    */


    "colorpopup" :
    {
      alias : "popup",
      include : "popup",

      style : function(states)
      {
        return {
          padding : 5
        };
      }
    },

    "colorpopup/field":
    {
      style : function(states)
      {
        return {
          margin : 2,
          width : 14,
          height : 14,
          backgroundColor : "background",
          decorator : "main-dark"
        };
      }
    },

    "colorpopup/selector-button" : "button",
    "colorpopup/auto-button" : "button",

    "colorpopup/preview-pane" : "groupbox",

    "colorpopup/current-preview":
    {
      style : function(state)
      {
        return {
          height : 20,
          padding: 4,
          marginLeft : 4,
          decorator : "main-dark",
          allowGrowX : true
        };
      }
    },

    "colorpopup/selected-preview":
    {
      style : function(state)
      {
        return {
          height : 20,
          padding: 4,
          marginRight : 4,
          decorator : "main-dark",
          allowGrowX : true
        };
      }
    },

    "colorpopup/colorselector-okbutton":
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          icon : "icon/16/actions/dialog-ok.png"
        };
      }
    },

    "colorpopup/colorselector-cancelbutton":
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          icon : "icon/16/actions/dialog-cancel.png"
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      COLOR SELECTOR
    ---------------------------------------------------------------------------
    */

    "colorselector" : "widget",
    "colorselector/control-bar" : "widget",
    "colorselector/visual-pane" : "groupbox",
    "colorselector/control-pane": "widget",
    "colorselector/preset-grid" : "widget",

    "colorselector/colorbucket":
    {
      style : function(states)
      {
        return {
          decorator : "main-dark",
          width : 16,
          height : 16
        };
      }
    },

    "colorselector/preset-field-set" : "groupbox",
    "colorselector/input-field-set" : {
      include : "groupbox",
      alias : "groupbox",
      style : function() {
        return {
          paddingTop: 12
        };
      }
    },

    "colorselector/preview-field-set" : {
      include : "groupbox",
      alias : "groupbox",
      style : function() {
        return {
          paddingTop: 12
        };
      }
    },

    "colorselector/hex-field-composite" : "widget",
    "colorselector/hex-field" : "textfield",

    "colorselector/rgb-spinner-composite" : "widget",
    "colorselector/rgb-spinner-red" : "spinner",
    "colorselector/rgb-spinner-green" : "spinner",
    "colorselector/rgb-spinner-blue" : "spinner",

    "colorselector/hsb-spinner-composite" : "widget",
    "colorselector/hsb-spinner-hue" : "spinner",
    "colorselector/hsb-spinner-saturation" : "spinner",
    "colorselector/hsb-spinner-brightness" : "spinner",

    "colorselector/preview-content-old":
    {
      style : function(states)
      {
        return {
          decorator : "main-dark",
          width : 50,
          height : 25
        };
      }
    },

    "colorselector/preview-content-new":
    {
      style : function(states)
      {
        return {
          decorator : "main-dark",
          backgroundColor : "white",
          width : 50,
          height : 25
        };
      }
    },

    "colorselector/hue-saturation-field":
    {
      style : function(states)
      {
        return {
          decorator : "main-dark",
          margin : 5
        };
      }
    },

    "colorselector/brightness-field":
    {
      style : function(states)
      {
        return {
          decorator : "main-dark",
          margin : [5, 7]
        };
      }
    },

    "colorselector/hue-saturation-pane": "widget",
    "colorselector/hue-saturation-handle" : "widget",
    "colorselector/brightness-pane": "widget",
    "colorselector/brightness-handle" : "widget",



    /*
    ---------------------------------------------------------------------------
      APPLICATION
    ---------------------------------------------------------------------------
    */

    "app-header" :
    {
      style : function(states)
      {
        return {
          font : "headline",
          textColor : "text-selected",
          backgroundColor: "background-selected-dark",
          padding : [8, 12]
        };
      }
    },

    "app-header-label" :
    {
      style : function(states)
      {
        return {
          paddingTop : 5
        };
      }
    },


    "app-splitpane" : {
      alias : "splitpane",
      style : function(states) {
        return {
          padding: [0, 10, 10, 10],
          backgroundColor: "light-background"
        };
      }
    }
  }
});
