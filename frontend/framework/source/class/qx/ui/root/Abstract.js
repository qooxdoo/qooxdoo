/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Shared implementation for all root widgets.
 */
qx.Class.define("qx.ui.root.Abstract",
{
  extend : qx.ui.core.Widget,
  include : [ qx.ui.core.MChildrenHandling, qx.ui.core.MLayoutHandling ],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._focusHandler = new qx.ui.core.FocusHandler(this);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "root"
    },

    // overridden
    enabled :
    {
      refine : true,
      init : true
    },

    // overridden
    focusable :
    {
      refine : true,
      init : true
    },
    
    /**
     *  Sets the global cursor style
     *
     *  The name of the cursor to show when the mouse pointer is over the widget.
     *  This is any valid CSS2 cursor name defined by W3C.
     *
     *  The following values are possible:
     *  <ul><li>default</li>
     *  <li>crosshair</li>
     *  <li>pointer (hand is the ie name and will mapped to pointer in non-ie).</li>
     *  <li>move</li>
     *  <li>n-resize</li>
     *  <li>ne-resize</li>
     *  <li>e-resize</li>
     *  <li>se-resize</li>
     *  <li>s-resize</li>
     *  <li>sw-resize</li>
     *  <li>w-resize</li>
     *  <li>nw-resize</li>
     *  <li>text</li>
     *  <li>wait</li>
     *  <li>help </li>
     *  <li>url([file]) = self defined cursor, file should be an ANI- or CUR-type</li>
     *  </ul>
     */
    globalCursor :
    {
      check : "String",
      nullable : true,
      themeable : true,
      apply : "_applyGlobalCursor",
      event : "changeGlobalCursor"
    }    
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    isRootWidget : function() {
      return true;
    },


    // overridden
    isFocusRoot : function() {
      return true;
    },
    
    
    // property apply
    _applyGlobalCursor : qx.core.Variant.select("qx.client",
    {
      "default--" : function(value, old) 
      {
        if (value && !old) 
        {
          this.addListener("mouseover", this._onGlobalCursorOver, this, true);
          this.addListener("mouseout", this._onGlobalCursorOut, this, true);
        }
        else if (old && !value)
        {
          this.removeListener("mouseover", this._onGlobalCursorOver, this, true);
          this.removeListener("mouseout", this._onGlobalCursorOut, this, true);
        } 
      },
      
      // This would be the optimal solution.
      // But this has some issues:
      // * Works like charm in Safari
      // * Massive performance lost in IE, but working
      // * Reflow issues in Gecko where hover states get lost, otherwise working
      // * Reflow issues like Gecko and cursor never seems to get applied at all
      "default" : function(value)
      {
        var Stylesheet = qx.bom.Stylesheet;
        
        var sheet = this._globalCursorStyleSheet;
        if (!sheet) {
          this._globalCursorStyleSheet = sheet = Stylesheet.createElement();
        }

        Stylesheet.removeAllRules(sheet);

        if (value) {
          Stylesheet.addRule(sheet, "*", "cursor:" + value + " !important");
        }
      }
    }),    
    
    _onGlobalCursorOver : function(e)
    {
      this.debug("Over: " + e.getCurrentTarget());
    },
    
    _onGlobalCursorOut : function(e)
    {
      this.debug("Out: " + e.getCurrentTarget());
    }
  },
  




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics, members)
  {
    qx.ui.core.MChildrenHandling.remap(members);
    qx.ui.core.MLayoutHandling.remap(members);
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_focusHandler");
  }
});
