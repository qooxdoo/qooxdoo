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

qx.Class.define("qx.test.html.jsx.TestJsxBrowser", {
  extend: qx.dev.unit.TestCase,

  members: {
    testUseNode() {
      let elem = new qx.test.html.jsx.TestWidget();
      let buffer = "";
      elem.serialize((...args) => (buffer += args.join("")));
      console.log(buffer);
      this.assertTrue(!elem.getDomElement());

      let dom = document.createElement("div");
      dom.innerHTML = buffer;
      dom = dom.children[0];
      qx.core.Assert.assertTrue(!elem.getDomElement());
      elem.useNode(dom);

      this.assertTrue(dom === elem.getDomElement());
      this.assertTrue(dom.children.length == 2);
      this.assertTrue(dom.children[0].className === "header-class");
      this.assertTrue(
        dom.children[0] === elem.getQxObject("header").getDomElement()
      );

      this.assertTrue(dom.children[1].className === "body-class");
      this.assertTrue(
        dom.children[1] === elem.getQxObject("body").getDomElement()
      );

      let domBody = dom.children[1];
      let body = elem.getQxObject("body");
      this.assertTrue(domBody.children.length == 2);
      this.assertTrue(domBody.children[0].innerText === "Label One");
      this.assertTrue(
        domBody.children[0] === elem.getQxObject("labelOne").getDomElement()
      );

      this.assertTrue(domBody.children[1].innerText === "Label Two");
      this.assertTrue(
        domBody.children[1] === elem.getQxObject("labelTwo").getDomElement()
      );
    },

    testUseNodeWithExtra() {
      let src = (
        <div data-qx-object-id="root">
          <div className="header-class" data-qx-object-id="root/header">
            <p>This is extra</p>
          </div>
          <div className="body-class" data-qx-object-id="root/body">
            <div data-qx-object-id="root/labelOne">Label One</div>
            <div data-qx-object-id="root/labelTwo">Label Two</div>
          </div>
        </div>
      );

      let buffer = "";
      src.serialize((...args) => (buffer += args.join("")));
      console.log(buffer);

      let elem = new qx.test.html.jsx.TestWidget();
      this.assertTrue(!elem.getDomElement());

      let dom = document.createElement("div");
      dom.innerHTML = buffer;
      dom = dom.children[0];
      qx.core.Assert.assertTrue(!elem.getDomElement());
      elem.useNode(dom);

      this.assertTrue(dom === elem.getDomElement());
      this.assertTrue(dom.children.length == 2);
      this.assertTrue(
        dom.children[0] === elem.getQxObject("header").getDomElement()
      );

      this.assertTrue(
        dom.children[0].children[0] ===
          elem.getQxObject("header").getChildren()[0].getDomElement()
      );
    }
  }
});
