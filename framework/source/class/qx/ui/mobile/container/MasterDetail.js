/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * The master/detail container divides an area into two panes, master and detail. The master
 * can be detached when the orientation of the device changes to portrait.
 * This container provides an optimized view for tablet and mobile devices.
 *
 * *Example*
 *
 * Here is a little example of how to use the master/detail container.
 *
 * <pre class="javascript">
 * var container = new qx.ui.mobile.container.MasterDetail();
 *
 * container.getMaster().add(new qx.ui.mobile.container.Navigation());
 * container.getDetail().add(new qx.ui.mobile.container.Navigation());
 *
 * </pre>
 */
qx.Class.define("qx.ui.mobile.container.MasterDetail",
{
  extend : qx.ui.mobile.container.Composite,

  events : {
    /**
     * Fired when the layout of the master detail is changed. This happens
     * when the orientation of the device is changed.
     */
    "layoutChange" : "qx.event.type.Data"
  },


  properties : {
    // overridden
    defaultCssClass : {
      refine : true,
      init : "master-detail"
    }
  },

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param layout {qx.ui.mobile.layout.Abstract?null} The layout that should be used for this
   *     container
   */
  construct : function(layout)
  {
    this.base(arguments, layout || new qx.ui.mobile.layout.HBox());
    this.__master = this._createMasterContainer();
    this.__detail = this._createDetailContainer();
    this.add(this.__detail, {flex:4});

    qx.event.Registration.addListener(window, "orientationchange", this._onOrientationChange, this);

    this.__syncLayout();
  },


  members : {
    __master : null,
    __detail : null,
    __portraitMasterContainer : null,


    /**
     * Returns the master container.
     *
     * @return {qx.ui.mobile.container.Composite} The master container
     */
    getMaster : function() {
      return this.__master;
    },


    /**
     * Returns the detail container.
     *
     * @return {qx.ui.mobile.container.Composite} The detail container
     */
    getDetail : function() {
      return this.__detail;
    },


    /**
     * Returns the set container for the portrait mode. The master container will be added and removed
     * automatically to this container when the orientation is changed.
     *
     * @return {qx.ui.mobile.core.Widget} The set master container for the portrait mode.
     */
    getPortraitMasterContainer : function() {
      return this.__portraitMasterContainer;
    },


    /**
     * Set the container for the portrait mode. The master container will be added and removed
     * automatically to this container when the orientation is changed.
     *
     * @param container {qx.ui.mobile.core.Widget} The set master container for the portrait mode.
     */
    setPortraitMasterContainer : function(container)
    {
      this.__portraitMasterContainer = container;
      this.__syncLayout();
    },


    /**
     * Event handler. Called when the orientation of the device is changed.
     *
     * @param evt {qx.event.type.Orientation} The causing event
     */
    _onOrientationChange : function(evt) {
      this.__syncLayout();
    },



    /**
     * Synchronizes the layout.
     */
    __syncLayout  : function() {
      var isPortrait = qx.bom.Viewport.isPortrait();
      if (isPortrait) {
        this.__addMasterToPortraitContainer();
      } else {
        this.__addMasterToOrigin();
      }
      this._applyMasterContainerCss(isPortrait);

      var portraitMasterContainer = this.getPortraitMasterContainer();

      // Initial hiding of container.
      if (portraitMasterContainer) {
        portraitMasterContainer.hide();
      }
      this.fireDataEvent("layoutChange", isPortrait);
    },



    /**
     * Adds the master container to the portrait container.
     */
    __addMasterToPortraitContainer : function()
    {
      var container = this.getPortraitMasterContainer();
      if (container) {
        container.add(this.__master);
      }
    },


    /**
     * Adds the master container to the origin position.
     */
    __addMasterToOrigin : function()
    {
      if (this.__master.getLayoutParent() != this) {
        this.addBefore(this.__master, this.__detail);
      }
    },


    /**
     * Creates the master container.
     *
     * @return {qx.ui.mobile.container.Composite} The created container
     */
    _createMasterContainer : function() {
      return this.__createContainer("master-detail-master");
    },


    /**
     * Applies the master container CSS classes.
     *
     * @param isPortrait {Boolean} Whether the orientation is in portrait mode
     */
    _applyMasterContainerCss : function(isPortrait)
    {
      var container = this.getPortraitMasterContainer();
      if (container && isPortrait) {
        this.__master.removeCssClass("attached");
      } else {
        this.__master.addCssClass("attached");
      }
    },


    /**
     * Creates the detail container.
     *
     * @return {qx.ui.mobile.container.Composite} The created container
     */
    _createDetailContainer : function() {
      return this.__createContainer("master-detail-detail");
    },


    /**
     * Creates a container.
     *
     * @param cssClass {String} The CSS class that should be set to the container.
     *
     * @return {qx.ui.mobile.container.Composite} The created container
     */
    __createContainer : function(cssClass) {
      var container = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox());
      container.setDefaultCssClass(cssClass);
      return container;
    }
  },



  destruct : function() {
    qx.event.Registration.removeListener(window, "orientationchange", this._onOrientationChange, this);
    this._disposeObjects("__master", "__detail");
    this.__master = this.__detail = this.__portraitMasterContainer = null;
  }
});
