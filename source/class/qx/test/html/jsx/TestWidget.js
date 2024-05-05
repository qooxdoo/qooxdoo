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
          return <div class="header-class"></div>;

        case "body":
          return (
            <div class="body-class">
              {this.getQxObject("labelOne")}
              {this.getQxObject("labelTwo")}
            </div>
          );

        case "labelOne":
          return <p>Label One</p>;

        case "labelTwo":
          return <p>Label Two</p>;
      }
    }
  }
});
