/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************


************************************************************************ */
/**
 *
 * @asset(demobrowser/demo/icons/multimedia-player.png)
 * @asset(demobrowser/demo/fonts/fontawesome-webfont*)
 * @asset(qx/icon/${qx.icontheme}/32/actions/format-*)
 * @asset(qx/icon/${qx.icontheme}/32/actions/go-home.png)
 */

qx.Class.define("demobrowser.demo.widget.Image",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      this._initFont();

      var layout = new qx.ui.layout.HBox();
      layout.setSpacing(20);

      var container = new qx.ui.container.Composite(layout);
      this.getRoot().add(container, {left:20,top:20});

      container.add(new qx.ui.basic.Image("demobrowser/demo/icons/multimedia-player.png"));

      var ileft = new qx.ui.basic.Image("icon/32/actions/format-justify-left.png");
      container.add(ileft);

      var iright = new qx.ui.basic.Image("icon/32/actions/format-justify-right.png");
      container.add(iright);

      var ifill = new qx.ui.basic.Image("icon/32/actions/format-justify-fill.png");
      container.add(ifill);

      var icenter = new qx.ui.basic.Image("icon/32/actions/format-justify-center.png");
      container.add(icenter);

      var big = new qx.ui.basic.Image("icon/32/actions/go-home.png");
      big.setScale(true);
      big.setWidth(64);
      big.setHeight(64);
      container.add(big);

      var font = new qx.ui.basic.Image("@FontAwesome/heart");
      font.setScale(true);
      font.setWidth(64);
      font.setHeight(64);
      container.add(font);

      var external = new qx.ui.basic.Image("http://resources.qooxdoo.org/images/logo.gif");
      container.add(external);

      var externalSmall = new qx.ui.basic.Image("http://resources.qooxdoo.org/images/logo.gif");
      externalSmall.setWidth(136);
      externalSmall.setHeight(40);
      externalSmall.setScale(true);
      container.add(externalSmall);


      // toggle button
      var btn = new qx.ui.form.ToggleButton("Toggle enabled");
      btn.setValue(true);
      btn.addListener("changeValue", function(e) {
        container.setEnabled(e.getData());
      });

      this.getRoot().add(btn, {left:20, top:180});
    },

    _initFont : function()
    {
      var currentFont = qx.theme.manager.Font.getInstance().getTheme();

      // Add font definitions
      var config = {
        fonts: {
          "FontAwesome": {
            size: 40,
            lineHeight: 1,
            comparisonString : "\uf1e3\uf1f7\uf11b\uf19d",
            family: ["FontAwesome"],
            sources: [
              {
                family: "FontAwesome",
                source: [
                  "demobrowser/demo/fonts/fontawesome-webfont.ttf" , "demobrowser/demo/fonts/fontawesome-webfont.woff", "demobrowser/demo/fonts/fontawesome-webfont.woff2", "demobrowser/demo/fonts/fontawesome-webfont.eot"
                ]
              }
            ]
          }
        }
      };

      qx.Theme.define("demobrowser.theme.icon.Font", config);
      qx.Theme.include(currentFont, demobrowser.theme.icon.Font);
    }
  }
});
