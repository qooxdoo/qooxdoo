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
     * Jonathan Weiß (jonathan_rass)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/actions/go-previous.png)
#asset(qx/icon/${qx.icontheme}/16/actions/go-next.png)
#asset(qx/icon/${qx.icontheme}/16/actions/media-playback-start.png)
#asset(qx/icon/${qx.icontheme}/16/categories/internet.png)

************************************************************************ */

/**
 * @tag showcase
 */
qx.Class.define("demobrowser.demo.showcase.Browser",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);
      this.getRoot().add(this._createBrowser(), {left: 40, top: 30});
    },


    _createBrowser : function()
    {
      var win = new qx.ui.window.Window(
        "Web Browser",
        "icon/16/categories/internet.png"
      );

      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");

      win.setLayout(layout);
      win.setAllowClose(false);
      win.setContentPadding(0);
      win.open();

      var toolbar = new qx.ui.toolbar.ToolBar();
      win.add(toolbar);

      var btnBack = new qx.ui.toolbar.Button(null, "icon/16/actions/go-previous.png");
      btnBack.addListener("execute", function(e) {
        this.iframe.getWindow().history.back();
      }, this);
      toolbar.add(btnBack);

      var btnForward = new qx.ui.toolbar.Button(null, "icon/16/actions/go-next.png");
      btnForward.addListener("execute", function(e) {
        this.iframe.getWindow().history.forward();
      }, this);
      toolbar.add(btnForward);

      // IE does not allow access to an iframes history object
      // Firefox applies history changes to the main window
      // Opera throws a script error when trying to go forward or back

      btnForward.setEnabled(false);
      btnBack.setEnabled(false);

      btnForward.setToolTipText("This feature is currently not supported.")
      btnBack.setToolTipText("This feature is currently not supported.")

      this.txtUrl = new qx.ui.form.TextField().set({
        marginLeft: 1,
        value: "http://qooxdoo.org",
        padding: 2,
        alignY: "middle"
      });
      this.txtUrl.addListener("keypress", function(e) {
        if (e.getKeyIdentifier() == "Enter") {
          this.surfTo(this.txtUrl.getValue());
        }
      }, this);
      toolbar.add(this.txtUrl, {flex: 1});

      var btnGo = new qx.ui.toolbar.Button(null, "icon/16/actions/media-playback-start.png");
      btnGo.addListener("execute", function(e) {
        this.surfTo(this.txtUrl.getValue());
      }, this);
      toolbar.add(btnGo);


      this.iframe = new qx.ui.embed.Iframe().set({
        width: 400,
        height: 300,
        minWidth: 200,
        minHeight: 150,
        source: this.txtUrl.getValue(),
        decorator : null
      });
      win.add(this.iframe, {flex: 1});

      return win;
    },

    surfTo : function(url)
    {
      if (url.indexOf("http://") !== 0) {
        url = "http://" + url;
        this.txtUrl.setValue(url);
      }

      this.iframe.setSource(url);
    }
  }
});
