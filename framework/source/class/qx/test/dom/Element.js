/*******************************************************************************
 *
 * qooxdoo - the new era of web development
 *
 * http://qooxdoo.org
 *
 * Copyright: 2007-2012 1&1 Internet AG, Germany, http://www.1und1.de
 *
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL:
 * http://www.eclipse.org/org/documents/epl-v10.php See the LICENSE file in the
 * project's top-level directory for details.
 *
 * Authors: Fabian Jakobs (fjakobs)
 *
 ******************************************************************************/

qx.Class.define("qx.test.dom.Element", {
  extend : qx.dev.unit.TestCase,

  members : {

    setUp : function() {
      var div = document.createElement("div");
      div.id = "el";

      this._el = div;
      document.body.appendChild(div);
    },

    tearDown : function() {
      document.body.removeChild(this._el);
    },

    testCreate : function() {
      var el = qx.dom.Element.create("div", {
            name : "juhu"
          }, window);
      this.assertElement(el);
      this.assertEquals("juhu", qx.bom.element.Attribute.get(el, "name"));
    },

    testEmpty : function() {
      this._el.innerHTML = "Juhu";
      qx.dom.Element.empty(this._el);
      this.assertEquals("", this._el.innerHTML);
    }
  }
});