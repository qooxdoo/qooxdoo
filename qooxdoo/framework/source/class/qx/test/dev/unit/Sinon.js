/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

/**
 * Rudimentary tests to check that Sinon.JS is integrated correctly.
 */
qx.Class.define("qx.test.dev.unit.Sinon",
{
  extend : qx.dev.unit.TestCase,

  // Convenience and custom asserts
  include : qx.dev.unit.MMock,

  members :
  {
    sinon: null,

    setUp : function()
    {
      this.sinon = qx.dev.unit.Sinon.getSinon();
    },

    "test: should get sinon": function() {
      var sinon = this.sinon;

      this.assertObject(sinon, "Sinon not found");
      this.assertFunction(sinon.spy, "No spy");
      this.assertFunction(sinon.stub, "No stub");
      this.assertFunction(sinon.mock, "No mock");
      this.assertFunction(sinon.useFakeTimers, "No fake timers");
      this.assertFunction(sinon.useFakeXMLHttpRequest, "No fake XHR");
    },

    "test: should fail": function() {
      var sinon = this.sinon;
      this.assertException(function() {
        sinon.fail();
      });
    },

    "test: should spy": function() {
      var spy = this.sinon.spy();
      spy();
      this.assertTrue(spy.called);
    },

    "test: should spy conveniently": function() {
      var spy = this.spy();
      spy();
      this.assertTrue(spy.called);
    },

    "test: should stub": function() {
      var whoami = this.sinon.stub();
      whoami.returns("Affe");

      this.assertEquals("Affe", whoami());
    },

    "test: should stub conveniently": function() {
      var whoami = this.stub();
      whoami.returns("Affe");

      this.assertEquals("Affe", whoami());
    },

    "test: should assert": function() {
      var spy = this.sinon.spy();
      spy();
      this.assertCalled(spy);
    },

    tearDown : function()
    {
      this.sinon = null;
    }
  }
});
