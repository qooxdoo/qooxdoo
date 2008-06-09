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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * @appearance group-box
 * @appearance group-box-legend {qx.ui.basic.Atom}
 * @appearance group-box-frame {qx.ui.layout.CanvasLayout}
 */
qx.Class.define("qx.ui.groupbox.GroupBox",
{
  extend : qx.ui.core.Widget,

  include : [
    qx.ui.core.MRemoteChildrenHandling,
    qx.ui.core.MRemoteLayoutHandling
  ],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vLegend, vIcon) {
    this.base(arguments);


    this._setLayout(new qx.ui.layout.Canvas());

    // Sub widgets
    this._createFrameObject();
    this._createLegendObject();

    // Processing parameters
    this.setLegend(vLegend || "");

    if (vIcon != null) {
      this.setIcon(vIcon);
    }

    // Listen to the resize of the legend
    this._legendObject.addListener("resize", this._repositionFrame, this);
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
      init   : "group-box"
    },


    /**
     * Property for setting the position of the legend.
     */
    legendPosition : {
      check     : ["top", "middle"],
      init      : "middle",
      apply     : "_applyLegendPosition",
      themeable : true
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
      WIDGET INTERNALS
    ---------------------------------------------------------------------------
    */

    _getStyleTarget : function() {
      return this._frameObject;
    },


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
      this._legendObject = new qx.ui.basic.Atom();
      this._legendObject.setAppearance("group-box-legend");

      this._add(this._legendObject);
    },


    /**
     * Creates the frame sub widget
     *
     * @type member
     * @return {void}
     */
    _createFrameObject : function()
    {
      this._frameObject = new qx.ui.container.Composite();
      this._frameObject.setAppearance("group-box-frame");

      this._add(this._frameObject, {left: 0, top: 6, right: 0, bottom: 0});
    },


    /*
    ---------------------------------------------------------------------------
      LEGEND POSITION HANDLING
    ---------------------------------------------------------------------------
    */
    /**
     * Apply method for applying the legend position. It calls the
     * {@link _repositionFrame} method.
     */
    _applyLegendPosition: function(e)
    {
      if (this._legendObject.getBounds()) {
        this._repositionFrame();
      }
    },


    /**
     * Repositions the frame of the group box dependent on the
     * {@link legendPosition} property.
     */
    _repositionFrame: function()
    {
      // get the current height of the legend
      var height = this._legendObject.getBounds().height;
      // check for the property legend position
      if (this.getLegendPosition() == "middle") {
        this._frameObject.setLayoutProperties({"top": Math.round(height / 2)});
      } else if (this.getLegendPosition() == "top") {
        this._frameObject.setLayoutProperties({"top": height});
      }
    },


    /*
    ---------------------------------------------------------------------------
      GETTER FOR SUB WIDGETS
    ---------------------------------------------------------------------------
    */


    /**
     * The children container needed by the {@link qx.ui.core.MRemoteChildrenHandling}
     * mixin
     *
     * @type member
     * @return {qx.ui.container.Composite} pane sub widget
     */
    getChildrenContainer : function() {
      return this._frameObject;
    },


    /**
     * Accessor method for the legend sub widget.
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
        this._legendObject.show();
      } else {
        this._legendObject.exclude();
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
