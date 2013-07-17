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

    var container = new qx.ui.container.Composite();
    var layout = new qx.ui.layout.Grid();
    layout.setColumnAlign(1, "left", "top");
    container.setLayout(layout);

    var logo = new qx.ui.basic.Image("playground/images/jsfiddle-logo.png");
    container.add(logo, {row: 0, column: 0, rowSpan: 2});

    var headline = new qx.ui.basic.Label(this.tr("jsFiddle"));
    headline.setFont("jsFiddle");
    container.add(headline, {row: 0, column: 1});

    var message = new qx.ui.basic.Label(this.tr(
      "If you want to give qx.Website a try, please check out <a href='http://jsfiddle.net/user/qooxdoo/fiddles/' target='_blank'>jsFiddle</a>."
    ));
    message.setWidth(300);
    message.setRich(true);
    message.setWrap(true);
    container.add(message, {row: 1, column: 1});

    this._setLayout(new qx.ui.layout.Canvas());
    this._add(container, {left: "50%", top: "50%"});



    this.addListener("appear", function() {
      // align in the center
      var bounds = container.getBounds();
      container.setMarginTop(-parseInt(bounds.height/2));
      container.setMarginLeft(-parseInt(bounds.width/2));

      // no rotation for font rendering breaking gecko
      if (qx.core.Environment.get("engine.name") != "gecko") {
        // rotate a bit
        var el = container.getContentElement().getDomElement();
        qx.bom.element.Transform.rotate(el, "-2deg");
      }
    });
  }
});
