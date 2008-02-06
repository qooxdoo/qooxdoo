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
     * Creates the legend sub widget
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
     * Creates the frame sub widget
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
     * Accessor method for the frame sub widget
     *
     * @type member
     * @return {qx.ui.layout.CanvasLayout} frame sub widget
     */
    getFrameObject : function() {
      return this._frameObject;
    },


    /**
     * Accessor method for the legend sub widget
     *
     * @type member
     * @return {qx.ui.basic.Atom} legend sub widget
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
     * Sets the label of the legend sub widget if the given string is
     * valid. Otherwise the legend sub widget get not displayed.
     *
     * @type member
     * @param vLegend {String} new label of the legend sub widget
     * @return {void}
     */
    setLegend : function(vLegend) {
      if (vLegend !== "" && vLegend !== null) {
        this._legendObject.setLabel(vLegend);
        this._legendObject.setDisplay(true);
      } else {
        this._legendObject.setDisplay(false);
      }
    },


    /**
     * Accessor method for the label of the legend sub widget
     *
     * @type member
     * @return {String} Label of the legend sub widget
     */
    getLegend : function() {
      return this._legendObject.getLabel();
    },


    /**
     * Sets the icon of the legend sub widget.
     *
     * @type member
     * @param vIcon {String} source of the new icon of the legend sub widget
     * @return {void}
     */
    setIcon : function(vIcon) {
      this._legendObject.setIcon(vIcon);
    },


    /**
     * Accessor method for the icon of the legend sub widget
     *
     * @type member
     * @return {String} source of the new icon of the legend sub widget
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
