/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/* ************************************************************************
#asset(qx/icon/Tango/22/actions/list-add.png)
#asset(qx/icon/Tango/22/actions/list-remove.png)
#asset(qx/icon/Tango/22/actions/media-playback-start.png)
#asset(qx/icon/Tango/22/actions/media-record.png)
#asset(qx/icon/Tango/22/actions/window-new.png)
#asset(qx/icon/Tango/22/categories/system.png)
************************************************************************ */

/**
 * This class represents the Selenium window.
 *
 * The Selenium window recreates some of the Selenium IDE Firefox extension's
 * functionality, namely generating locator strings (in this case for qooxdoo
 * widgets instead of regular DOM elements) and running Selenium commands
 * against the inspected application.
 */
qx.Class.define("inspector.selenium.SeleniumWindow", {

  extend : inspector.components.AbstractWindow,

  /**
   * Creates a new instance of a SeleniumWindow.
   *
   * @param name {String} The window title.
   * @param inspectorModel {inspector.components.IInspectorModel} model to show.
   */
  construct : function(name, inspectorModel)
  {
    this.base(arguments, name, inspectorModel);

    this.__view = new inspector.selenium.View();
    this.add(this.__view, {edge: 0});

    this.__changeInspectedListenerID = this._model.addListener("changeInspected", function(e) {
      this.select(e.getData());
    }, this);

    this._model.addListener("changeApplication", this.__onChangeApplication, this);
  },

  members :
  {
    __view : null,

    __changeInspectedListenerID : null,

    __appChangeTimer : null,

    /**
     * Set the window's initial size and location
     */
    setInitSizeAndPosition: function() {
      this.moveTo(0, 35);
      this.setHeight(300);
      this.setWidth(550);
    },


    /**
     * Inform the view that the inspected widget has changed
     *
     * @param widget {qx.ui.core.Widget} The new inspected widget
     */
    select: function(widget) {
      this.__view.select(widget);
    },

    /**
     * If the Inspected application changes, add the Selenium scripts to its
     * window and ask the user if the command list should be cleared.
     *
     * @param e {qx.event.type.Event} changeApplication event
     */
    __onChangeApplication : function(e) {
      // The "changeApplication" event is fired twice each time the inspected
      // application changes, so we use a timer to prevent doing everything
      // again
      if (!this.__appChangeTimer) {
        this.__appChangeTimer = new qx.event.Timer(3000);
        this.__appChangeTimer.addListener("interval", function(ev) {
          this.__appChangeTimer.setEnabled(false);
        }, this);
      }
      if (this.__appChangeTimer.isEnabled()) {
        // timer is running, do nothing
        return;
      } else {
        this.__appChangeTimer.start();
      }
      // Immediately load scripts if cookies are set
      var coreScripts = qx.bom.Cookie.get("coreScripts");
      if (coreScripts) {
        this.__view.setSeleniumScripts(coreScripts);
      }
      this.__view.clearTable();
    }
  },

  destruct : function()
  {
    this._model.removeListener("changeApplication", this.__onChangeApplication, this);
    this._model.removeListenerById(this.__changeInspectedListenerID);
    this.__view.dispose();
    this.__view = null;
    this.__appChangeTimer.dispose();
  }
});
