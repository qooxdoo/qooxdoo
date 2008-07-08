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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/**
 * @appearance groupbox
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
    this._createChildControl("frame");
    this._createChildControl("legend");

    // Processing parameters
    this.setLegend(vLegend || "");

    if (vIcon != null) {
      this.setIcon(vIcon);
    }
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
      init   : "groupbox"
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
    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "frame":
          control = new qx.ui.container.Composite();
          this._add(control, {left: 0, top: 6, right: 0, bottom: 0});
          break;

        case "legend":
          control = new qx.ui.basic.Atom();
          control.addListener("resize", this._repositionFrame, this);
          this._add(control);
          break;
      }

      return control || this.base(arguments, id);
    },




    /*
    ---------------------------------------------------------------------------
      WIDGET INTERNALS
    ---------------------------------------------------------------------------
    */

    _getStyleTarget : function() {
      return this._getChildControl("frame");
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
      if (this._getChildControl("legend").getBounds()) {
        this._repositionFrame();
      }
    },


    /**
     * Repositions the frame of the group box dependent on the
     * {@link legendPosition} property.
     */
    _repositionFrame: function()
    {
      var legend = this._getChildControl("legend");
      var frame = this._getChildControl("frame");

      // get the current height of the legend
      var height = legend.getBounds().height;
      // check for the property legend position
      if (this.getLegendPosition() == "middle") {
        frame.setLayoutProperties({"top": Math.round(height / 2)});
      } else if (this.getLegendPosition() == "top") {
        frame.setLayoutProperties({"top": height});
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
      return this._getChildControl("frame");
    },


    /**
     * Accessor method for the legend sub widget.
     *
     * @type member
     * @return {qx.ui.basic.Atom} legend sub widget
     */
    getLegendObject : function() {
      return this._getChildControl("legend");
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
    setLegend : function(vLegend)
    {
      var control = this._getChildControl("legend");

      if (vLegend !== "" && vLegend !== null) {
        control.setLabel(vLegend);
        control.show();
      } else {
        control.exclude();
      }
    },


    /**
     * Accessor method for the label of the legend sub widget
     *
     * @type member
     * @return {String} Label of the legend sub widget
     */
    getLegend : function() {
      return this._getChildControl("legend").getLabel();
    },


    /**
     * Sets the icon of the legend sub widget.
     *
     * @type member
     * @param vIcon {String} source of the new icon of the legend sub widget
     * @return {void}
     */
    setIcon : function(vIcon) {
      this._getChildControl("legend").setIcon(vIcon);
    },


    /**
     * Accessor method for the icon of the legend sub widget
     *
     * @type member
     * @return {String} source of the new icon of the legend sub widget
     */
    getIcon : function() {
      this._getChildControl("legend").getIcon();
    }
  }
});
