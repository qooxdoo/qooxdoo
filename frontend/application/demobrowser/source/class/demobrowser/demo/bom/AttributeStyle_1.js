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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.bom.AttributeStyle_1",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var util = qx.bom.element.Visibility;
      var attrib = qx.bom.element.Attribute;
      var style = qx.bom.element.Style;
      var opac = qx.bom.element.Opacity;

      this.info("test1");
      this.debug("classname: " + attrib.get(document.getElementById("test1"), "class"));
      this.debug("title: " + attrib.get(document.getElementById("test1"), "title"));

      // throws exception in IE
      // this.debug("margin-left: " + style.get(document.getElementById("test1"), "marginLeft"));

      this.debug("top: " + style.get(document.getElementById("test1"), "top"));

      this.info("test2");
      this.debug("name: " + attrib.get(document.getElementById("test2"), "name"));
      this.debug("value: " + attrib.get(document.getElementById("test2"), "value"));
      this.debug("type: " + attrib.get(document.getElementById("test2"), "type"));
      this.debug("max: " + attrib.get(document.getElementById("test2"), "maxlength"));
      this.debug("left: " + style.get(document.getElementById("test2"), "left"));

      this.info("test3");
      this.debug("name: " + attrib.get(document.getElementById("test3"), "name"));
      this.debug("value: " + attrib.get(document.getElementById("test3"), "value"));
      this.debug("type: " + attrib.get(document.getElementById("test3"), "type"));
      this.debug("checked: " + attrib.get(document.getElementById("test3"), "checked"));
      this.debug("disabled: " + attrib.get(document.getElementById("test3"), "disabled"));
      this.debug("tabindex: " + attrib.get(document.getElementById("test3"), "tabindex"));

      this.info("test4");
      this.debug("disabled: " + attrib.get(document.getElementById("test4"), "disabled"));
      this.debug("readonly: " + attrib.get(document.getElementById("test4"), "readonly"));

      this.info("test5");
      this.debug("disabled: " + attrib.get(document.getElementById("test5"), "disabled"));
      this.debug("readonly: " + attrib.get(document.getElementById("test5"), "readonly"));

      this.info("test6");
      this.debug("href: " + attrib.get(document.getElementById("test6"), "href"));
      this.debug("style: " + attrib.get(document.getElementById("test6"), "style"));
      this.debug("css: " + style.getCss(document.getElementById("test6")));
      this.debug("color: " + style.get(document.getElementById("test6"), "color"));
      this.debug("bg: " + style.get(document.getElementById("test6"), "backgroundColor"));

      // shorthand properties are not supported
      // this.debug("font: " + style.get(document.getElementById("test6"), "font"));

      this.debug("family: " + style.get(document.getElementById("test6"), "fontFamily"));
      this.debug("text: " + attrib.get(document.getElementById("test6"), "text"));
      this.debug("html: " + attrib.get(document.getElementById("test6"), "html"));
      this.debug("opacity: " + opac.get(document.getElementById("test6")));

      this.info("test7");
      this.debug("valign: " + attrib.get(document.getElementById("test7"), "valign"));
      this.debug("colspan: " + attrib.get(document.getElementById("test7").getElementsByTagName("td")[0], "colspan"));

      this.info("test8");
      style.set(document.getElementById("test8"), "color", "red");
      style.set(document.getElementById("test8"), "backgroundColor", "black");
      opac.set(document.getElementById("test8"), 0.5);
      this.debug("opacity: " + opac.get(document.getElementById("test8")));

      this.info("test9");
      this.debug("Document: " + qx.bom.Document.getWidth() + "x" + qx.bom.Document.getHeight());
      this.debug("Viewport: " + qx.bom.Viewport.getWidth() + "x" + qx.bom.Viewport.getHeight());

    }
  }
});