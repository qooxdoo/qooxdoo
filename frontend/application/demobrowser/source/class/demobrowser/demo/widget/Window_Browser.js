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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/Tango/16/actions/go-previous.png)
#asset(qx/icon/Tango/16/actions/go-next.png)
#asset(qx/icon/Tango/16/actions/media-playback-start.png)
#asset(qx/icon/Tango/16/categories/internet.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Window_Browser",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Modern);
      this.getRoot().add(this._createBrowser(), {left: 40, top: 30});
    },


    _createBrowser : function()
    {
      var win = new qx.ui.window.Window(
        "Web Browser",
        "icon/16/categories/internet.png"
      );

      win.setLayout(new qx.ui.layout.VBox());
      win.setAllowClose(false);

      var toolbar = new qx.ui.toolbar.ToolBar();
      win.add(toolbar);

      var btnBack = new qx.ui.toolbar.Button("", "icon/16/actions/go-previous.png");
      btnBack.addListener("execute", function(e) {
        this.iframe.getWindow().history.back();
      }, this);
      toolbar.add(btnBack);

      var btnForward = new qx.ui.toolbar.Button("", "icon/16/actions/go-next.png");
      btnForward.addListener("execute", function(e) {
        this.iframe.getWindow().history.forward();
      }, this);
      toolbar.add(btnForward);

      this.txtUrl = new qx.ui.form.TextField().set({
        marginLeft: 1,
        value: "http://web.de",
        padding: 2,
        alignY: "middle"
      });
      this.txtUrl.addListener("keypress", function(e) {
        if (e.getKeyIdentifier() == "Enter") {
          this.surfTo(this.txtUrl.getValue());
        }
      }, this);
      toolbar.add(this.txtUrl, {flex: 1});

      btnGo = new qx.ui.toolbar.Button(null, "icon/16/actions/media-playback-start.png");
      btnGo.addListener("execute", function(e) {
        this.surfTo(this.txtUrl.getValue());
      }, this);
      toolbar.add(btnGo);


      this.iframe = new qx.ui.embed.Iframe().set({
        width: 400,
        height: 300,
        minWidth: 200,
        minHeight: 150,
        source: this.txtUrl.getValue()
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
