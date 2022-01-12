/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2019-2021 Zenesis Ltd, https://zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (johnspackman)

************************************************************************ */

qx.Class.define("qx.test.html.jsx.TestWidget", {
  extend: qx.html.Element,

  construct() {
    super();
    this.add(this.getQxObject("header"));
    this.add(this.getQxObject("body"));
  },

  members: {
    _createQxObjectImpl(id) {
      switch (id) {
        case "header":
          var elem = new qx.html.Element();
          elem.addClass("header-class");
          return elem;

        case "body":
          var elem = new qx.html.Element();
          elem.addClass("body-class");
          elem.add(this.getQxObject("labelOne"));
          elem.add(this.getQxObject("labelTwo"));
          return elem;

        case "labelOne":
          var elem = new qx.html.Element();
          elem.add(new qx.html.Text("Label One"));
          return elem;

        case "labelTwo":
          var elem = new qx.html.Element();
          elem.add(new qx.html.Text("Label Two"));
          return elem;
      }
    }
  }
});
