/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * A simple, reusable information display window.
 *
 * @param caption The caption text
 * @param icon The URL of the caption bar icon
 */
qx.Class.define("demobrowser.InfoWindow", {

  extend : qx.ui.window.Window,

  construct : function(caption, icon)
  {
    this.base(arguments, caption, icon);
    this.setLayout(new qx.ui.layout.VBox(10));
    this.setMinWidth(200);
    this.setMaxWidth(qx.bom.Viewport.getWidth() - 10);
    this.setMaxHeight(qx.bom.Viewport.getHeight() - 10);
    this.setShowMinimize(false);
    this.setShowMaximize(false);

    this.add(this._getContentContainer(), {flex : 1});
    this.add(this._makeOkButton(), {flex : 0});
    this.addListener("resize", this.__centerOnResize, this);
  },

  properties :
  {
    /**
     * The window's content. Must be a widget.
     */
    content : {
      apply : "_applyContent"
    },

    /**
     * If true, the window will be centered relative to the viewport on resize.
     */
    autoCenter : {
      check : "Boolean",
      init : false
    }
  },

  members :
  {
    __contentContainer : null,

    /**
     * Returns the container for the conten widget
     *
     * @return {qx.ui.container.Composite} The container widget
     */
    _getContentContainer : function()
    {
      if (!this.__contentContainer) {
        this.__contentContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
        this.__contentContainer.setMinHeight(20);
      }
      return this.__contentContainer;
    },


    /**
     * Removes all child widgets from the content container
     */
    clear : function()
    {
      this._getContentContainer().removeAll();
    },


    /**
     * Returns the "OK" button that closes the window.
     *
     * @return {qx.ui.form.Button} The OK button
     */
    _makeOkButton : function()
    {
      var okButton = new qx.ui.form.Button(this.tr("OK"));
      okButton.addListener("execute", function(ev) {
        this.close();
      }, this);
      okButton.setAllowStretchX(false);
      okButton.setMinWidth(60);
      okButton.setAlignX("center");
      return okButton;
    },


    _applyContent : function(value, old)
    {
      this.clear();
      this._getContentContainer().add(value);
    },


    /**
     * Centers the window relative to the viewport.
     */
    center : function()
    {
      var x = Math.floor((qx.bom.Viewport.getWidth() / 2) - ( this.getBounds().width / 2));
      var y = Math.floor((qx.bom.Viewport.getHeight() / 2) - ( this.getBounds().height / 2));
      x = x >= 0 ? x : 0;
      y = y >= 0 ? y : 0;
      this.moveTo(x,y);
    },


    /**
     * Callback function for a resize listener that centers the window if the
     * @link{#autoCenter} property is active.
     */
    __centerOnResize : function()
    {
      if (this.getAutoCenter()) {
        this.center();
      }
    }
  }

});