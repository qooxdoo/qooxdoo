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
     * Will Johnson (WillsterJohnson)

************************************************************************ */

qx.Class.define("qx.test.html.jsx.TestJsx", {
  extend: qx.dev.unit.TestCase,

  members: {
    testBasics() {
      let html = (
        <div id="el1">
          Hello
          <div id="el2" class="hello" style="border: 1px solid" /> World
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
    },

    testCustomElements() {
      const CustomElem = ({ who }) => <p>Hello, {who}</p>;
      const myCustomElem = <CustomElem who="world" />;
      this.assertTrue(myCustomElem instanceof qx.html.Element);
      this.assertEquals("p", myCustomElem.getNodeName());
    },

    testClassElements() {
      const Cls = qx.Class.define(null, {
        extend: qx.html.Element,
        construct({ attr1 }) {
          super();
          this.add(<p attr1={attr1}></p>);
        }
      });

      const myCls = <Cls attr1="val1" />;
      const p = myCls.getChildren()[0];
      this.assertTrue(myCls instanceof qx.html.Element);
      this.assertEquals("div", myCls.getNodeName());
      this.assertEquals("p", p.getNodeName());
      this.assertEquals("val1", p.getAttribute("attr1"));
    },

    testSpreadAttrs() {
      const attrs = { attr1: "val1" };
      const myElem = <div {...attrs} />;
      this.assertTrue(myElem instanceof qx.html.Element);
      this.assertEquals("val1", myElem.getAttribute("attr1"));
    },

    testAnonFragments() {
      const myElem = (
        <>
          <div />
          <div />
        </>
      );

      this.assertTrue(myElem instanceof qx.data.Array);
      this.assertEquals(2, myElem.length);
      const plainArray = myElem.toArray();
      this.assertTrue(plainArray[0] instanceof qx.html.Element);
      this.assertTrue(plainArray[1] instanceof qx.html.Element);
    },

    testComments() {
      const hasComment = (
        <>
          {/* A comment */}
          <div />
        </>
      );

      // it didn't throw, so we're good
      this.assertTrue(true);
    },

    testSlots() {
      const CustomElem = () => (
        <div>
          <slot name="named" />
          <slot />
        </div>
      );

      const usage = (
        <CustomElem>
          <p />
          <div slot="named" />
        </CustomElem>
      );

      const slotNamed = usage.getSlots().get("named");
      const div = slotNamed.getChildren()[0];
      const slotDefault = usage.getSlots().get(qx.html.Slot.DEFAULT);
      const p = slotDefault.getChildren()[0];

      this.assertTrue(usage instanceof qx.html.Element);
      this.assertEquals(2, usage.getChildren().length);
      this.assertEquals("div", div.getNodeName());
      this.assertEquals("p", p.getNodeName());
    },

    testSlotFallbackContent() {
      const CustomElem = () => (
        <div>
          <slot>
            <p>fallback</p>
          </slot>
        </div>
      );

      const usage = <CustomElem />;

      const slot = usage.getSlots().get(qx.html.Slot.DEFAULT);
      const p = slot.getDefaultChildren()[0];

      this.assertTrue(usage instanceof qx.html.Element);
      this.assertEquals(1, usage.getChildren().length);
      this.assertEquals("p", p.getNodeName());
      this.assertEquals("fallback", p.getText());
    },

    testCssCustomProperties() {
      const CustomElem = () => (
        <p style="color: var(--my-custom-property, blue);"></p>
      );

      const unstyled = <CustomElem />;

      const domElem = unstyled.getDomElement(true);

      this.assertTrue(unstyled instanceof qx.html.Element);
      this.assertEquals("p", unstyled.getNodeName());
      document.body.appendChild(domElem);
      this.assertEquals("rgb(0, 0, 255)", getComputedStyle(domElem).color);
      document.body.removeChild(domElem);

      const red = <CustomElem __my-custom-property="red" />;

      const redElem = red.getDomElement(true);

      this.assertTrue(red instanceof qx.html.Element);
      this.assertEquals("p", red.getNodeName());
      document.body.appendChild(redElem);
      this.assertEquals("rgb(255, 0, 0)", getComputedStyle(redElem).color);
      document.body.removeChild(redElem);
    }
  }
});
