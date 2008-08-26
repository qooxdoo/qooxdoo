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
  type : "abstract",
  extend : qx.ui.core.Widget,

  include :
  [
    qx.ui.core.MChildrenHandling,
    qx.ui.core.MBlocker,
    qx.ui.window.MDesktop
  ],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Register as root for the focus handler
    qx.ui.core.FocusHandler.getInstance().addRoot(this);
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
     *
     * Please note that in the current implementation this has no effect in IE.
     */
    globalCursor :
    {
      check : "String",
      nullable : true,
      themeable : true,
      apply : "_applyGlobalCursor",
      event : "changeGlobalCursor"
    },


    /**
     * Whether to show the native context menu
     */
    nativeContextMenu :
    {
      check : "Boolean",
      nullable : true,
      apply : "_applyNativeContextMenu",
      init : true
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


    /**
     * Get the widget's layout manager.
     *
     * @return {qx.ui.layout.Abstract} The widget's layout manager
     */
    getLayout : function() {
      return this._getLayout();
    },


    // property apply
    _applyGlobalCursor : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(value, old) {
        // empty implementation
      },

      // This would be the optimal solution.
      // For performance reasons this is impractical in IE
      "default" : function(value, old)
      {
        var Stylesheet = qx.bom.Stylesheet;

        var sheet = this.__globalCursorStyleSheet;
        if (!sheet) {
          this.__globalCursorStyleSheet = sheet = Stylesheet.createElement();
        }

        Stylesheet.removeAllRules(sheet);

        if (value) {
          Stylesheet.addRule(sheet, "*", qx.bom.element.Cursor.compile(value).replace(";", "") + " !important");
        }
      }
    }),


    // property apply
    _applyNativeContextMenu : function(value, old)
    {
      if (value) {
        this.removeListener("contextmenu", this._onNativeContextMenu, this, true);
      } else {
        this.addListener("contextmenu", this._onNativeContextMenu, this, true);
      }
    },


    /**
     * Stops the <code>contextmenu</code> event from showing the native context menu
     *
     * @param e {qx.event.type.Mouse} The event object
     */
    _onNativeContextMenu : function(e) {
      e.preventDefault();
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__globalCursorStyleSheet");
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics, members) {
    qx.ui.core.MChildrenHandling.remap(members);
  }
});
