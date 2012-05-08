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
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 */
qx.Class.define("qx.ui.mobile.container.SplitPane",
{
  extend : qx.ui.mobile.container.Composite,

  events : {
    "layoutChange" : "qx.event.type.Data"
  },


  properties : {
    defaultCssClass : {
      refine : true,
      init : "split-pane"
    }
  },

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */


  construct : function(layout)
  {
    this.base(arguments, layout || new qx.ui.mobile.layout.HBox());
    this.__master = this._createMasterContainer();

    this.__detail = this._createDetailContainer();
    this.add(this.__detail, {flex:1});
    qx.event.Registration.addListener(window, "orientationchange", this._onOrientationChange, this);

    this.__syncLayout();
  },


  members : {
    __master : null,
    __detail : null,
    __portraitMasterContainer : null,


    getMaster : function() {
      return this.__master;
    },


    getDetail : function() {
      return this.__detail;
    },


    getPortraitMasterContainer : function() {
      return this.__portraitMasterContainer;
    },


    /**
     * Set the popup used by this splipane to show the leftPane when it gets hidden.
     */
    setPortraitMasterContainer : function(container)
    {
      this.__portraitMasterContainer = container;
      this.__syncLayout();
    },


    _onOrientationChange : function(evt) {
      this.__syncLayout();
    },


    __syncLayout  : function() {
      var isPortrait = qx.bom.Viewport.isPortrait();
      if (isPortrait) {
        this.__addMasterToPortraitContainer();
      } else {
        this.__addMasterToSplitView();
      }
      this._applyMasterContainerCss(isPortrait);
      var container = this.getPortraitMasterContainer();
      if (container) {
        container.hide();
      }
      this.fireDataEvent("layoutChange", isPortrait);
    },


    __addMasterToPortraitContainer : function()
    {
      var container = this.getPortraitMasterContainer();
      if (container) {
        container.add(this.__master);
      }
    },


    __addMasterToSplitView : function()
    {
      if (this.__master.getLayoutParent() != this) {
        this.addBefore(this.__master, this.__detail);
      }
    },


    _createMasterContainer : function() {
      return this.__createContainer("split-pane-master");
    },


    _applyMasterContainerCss : function(isPortrait)
    {
      var container = this.getPortraitMasterContainer();
      if (container && isPortrait) {
        this.__master.removeCssClass("attached");
      } else {
        this.__master.addCssClass("attached");
      }
    },


    _createDetailContainer : function() {
      return this.__createContainer("split-pane-detail");
    },


    __createContainer : function(cssClass) {
      var container = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox());
      container.setDefaultCssClass(cssClass);
      return container;
    }
  }
});
