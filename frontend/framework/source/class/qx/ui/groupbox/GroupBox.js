/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_form)

************************************************************************ */

/**
 * @appearance group-box
 * @appearance group-box-legend {qx.ui.basic.Atom}
 * @appearance group-box-frame {qx.ui.layout.CanvasLayout}
 */
qx.Class.define("qx.ui.groupbox.GroupBox",
{
  extend : qx.ui.layout.CanvasLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vLegend, vIcon)
  {
    this.base(arguments);

    // Sub widgets
    this._createFrameObject();
    this._createLegendObject();

    // Processing parameters
    this.setLegend(vLegend || "");

    if (vIcon != null) {
      this.setIcon(vIcon);
    }

    // Enable method remapping
    this.remapChildrenHandlingTo(this._frameObject);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "group-box"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      SUB WIDGET CREATION
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createLegendObject : function()
    {
      this._legendObject = new qx.ui.basic.Atom;
      this._legendObject.setAppearance("group-box-legend");

      this.add(this._legendObject);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createFrameObject : function()
    {
      this._frameObject = new qx.ui.layout.CanvasLayout;
      this._frameObject.setAppearance("group-box-frame");

      this.add(this._frameObject);
    },




    /*
    ---------------------------------------------------------------------------
      GETTER FOR SUB WIDGETS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getFrameObject : function() {
      return this._frameObject;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getLegendObject : function() {
      return this._legendObject;
    },




    /*
    ---------------------------------------------------------------------------
      SETTER/GETTER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vLegend {var} TODOC
     * @return {void}
     */
    setLegend : function(vLegend) {
      if (qx.util.Validation.isValidString(vLegend)) {
        this._legendObject.setLabel(vLegend);
        this._legendObject.setDisplay(true);
      } else {
        this._legendObject.setDisplay(false);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getLegend : function() {
      return this._legendObject.getLabel();
    },


    /**
     * TODOC
     *
     * @type member
     * @param vIcon {var} TODOC
     * @return {void}
     */
    setIcon : function(vIcon) {
      this._legendObject.setIcon(vIcon);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    getIcon : function() {
      this._legendObject.getIcon();
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_legendObject", "_frameObject");
  }
});
