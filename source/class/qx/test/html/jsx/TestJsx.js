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

qx.Class.define("qx.test.html.jsx.TestJsx", {
  extend: qx.dev.unit.TestCase,

  members: {
    testBasics() {
      let html = (
        <div id="el1">
          Hello
          <div id="el2" className="hello" style="border: 1px solid" /> World
        </div>
      );

      this.assertEquals(true, html instanceof qx.html.Element);
      this.assertEquals(3, html.getChildren().length);
      let el2 = html.getChildren()[1];
      this.assertEquals(true, html.getChildren()[0] instanceof qx.html.Text);
      this.assertEquals(true, el2 instanceof qx.html.Element);
      this.assertEquals(true, html.getChildren()[2] instanceof qx.html.Text);
      this.assertEquals("el1", html.getAttribute("id"));
      this.assertEquals("el2", el2.getAttribute("id"));
      this.assertEquals("1px solid", el2.getStyle("border"));
    },

    testRefs() {
      let myRef = new qx.html.JsxRef();
      let html = (
        <div>
          <div ref={myRef}></div>
        </div>
      );

      this.assertTrue(html.getChildren()[0] === myRef.getValue());
    }
  }
});
