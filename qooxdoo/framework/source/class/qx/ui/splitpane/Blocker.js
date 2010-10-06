/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.ui.splitpane.Blocker", 
{
  extend : qx.html.Element,


  construct : function(orientation)
  {
    var styles = {
      position: "absolute",
      zIndex: 11
    };

    this.base(arguments, "div", styles);
    
    // Initialize orientation
    if (orientation) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }    
  },
  
  
  properties : 
  {
    /**
     * The orientation of the splitpane control.
     */
    orientation :
    {
      init  : "horizontal",
      check : [ "horizontal", "vertical" ],
      apply : "_applyOrientation"
    }
  },


  members :
  {
    _applyOrientation : function(value, old) {   
      if (value == "horizontal") {
        this.setStyle("height", "100%");        
        this.setStyle("cursor", "col-resize");
        this.setStyle("top", null);        
      } else {
        this.setStyle("width", "100%");
        this.setStyle("left", null);
        this.setStyle("cursor", "row-resize");
      }
    },
    
    
    setWidth : function(offset, spliterSize) {
      var width = spliterSize + 2 * offset;
      this.setStyle("width", width + "px");
    },
    
    
    setHeight : function(offset, spliterSize) {
      var height = spliterSize + 2 * offset;
      this.setStyle("height", height + "px");
    },
    
    
    setLeft : function(offset, splitterLeft) {
      var left = splitterLeft - offset;
      this.setStyle("left", left + "px");
    },  
    
    
    setTop : function(offset, splitterTop) {
      var top = splitterTop - offset;
      this.setStyle("top", top + "px");
    }
  }
});