/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
qx.Class.define("playground.view.WebsiteContent",
{
  extend : qx.ui.core.Widget,


  construct : function()
  {
    this.base(arguments);
    this.setAppearance("website-content");

    var qVersion = q.env.get("qx.version");
    var qUrl = "http://demo.qooxdoo.org/" + qVersion + "/framework/q-" +
      qVersion + ".min.js";
    var indigoUrl = "http://demo.qooxdoo.org/" + qVersion + "/framework/indigo-" +
        qVersion + ".css";

    var container = new qx.ui.container.Composite();
    var layout = new qx.ui.layout.Grid();
    layout.setColumnAlign(1, "left", "top");
    container.setLayout(layout);

    var logo = new qx.ui.basic.Image("playground/images/codepen-256-black.png");
    container.add(logo, {row: 0, column: 0, rowSpan: 2});
    var headline = new qx.ui.basic.Label(this.tr("CodePen"));
    headline.setFont("CodePen");
    headline.setAlignY("top");
    headline.setPaddingTop(15);
    container.add(headline, {row: 0, column: 1});

    var data = {
      js_external: qUrl,
      css_external: indigoUrl,
      js: "// use qxWeb here"
    };

    var message = new qx.ui.basic.Label(this.tr(
      "If you want to give qx.Website a try, please check out ") +
      "<form action='http://codepen.io/pen/define' method='POST' target='_blank' style='display: inline;'>" +
        "<input type='submit' value='CodePen' style='border: none; padding: 0; background: none; text-decoration: underline; cursor: pointer; font-size: 12px;'>" +
        "<input type='hidden' name='data' value='" + JSON.stringify(data) + "' />" +
      "</form>."
    );
    message.setWidth(300);
    message.setRich(true);
    message.setWrap(true);
    message.setAlignY("top");
    message.setPaddingBottom(35);
    container.add(message, {row: 1, column: 1});

    this._setLayout(new qx.ui.layout.Canvas());
    this._add(container, {left: "50%", top: "50%"});

    this.addListener("appear", function() {
      // align in the center
      var bounds = container.getBounds();
      container.setMarginTop(-parseInt(bounds.height/2));
      container.setMarginLeft(-parseInt(bounds.width/2));

      // no rotation for font rendering breaking gecko
      // also looks terrible in IE < 10
      if (qx.core.Environment.get("engine.name") != "gecko" &&
          (qx.core.Environment.get("engine.name") != "mshtml" ||
           qx.core.Environment.get("browser.documentmode") > 9)
        ) {
        // rotate a bit
        var el = container.getContentElement().getDomElement();
        qx.bom.element.Transform.rotate(el, "-2deg");
      }
    });
  }
});
