/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2020 Christian Boulanger

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (cboulanger)

************************************************************************ */

qx.Class.define("qx.test.io.jsonrpc.Protocol", {
  extend: qx.dev.unit.TestCase,
  include: [qx.test.io.MAssert],
  construct() {
    super();
    this.parser = new qx.io.jsonrpc.protocol.Parser();
  },
  members: {
    "test: JSON-RPC request message object"() {
      let message = new qx.io.jsonrpc.protocol.Request("foo", ["bar",1,false], 1);

      let expected = {
        id: 1,
        jsonrpc: "2.0",
        method: "foo",
        params: ["bar", 1, false]
      };

      this.assertDeepEquals(expected, message.toObject());
      // test parser
      this.assertDeepEquals(
        expected,
        this.parser.parse(JSON.stringify(expected)).toObject()
      );
    },

    "test: JSON-RPC request notification object"() {
      let message = new qx.io.jsonrpc.protocol.Notification("foo", [
        "bar",
        1,
        false
      ]);

      let expected = {
        jsonrpc: "2.0",
        method: "foo",
        params: ["bar", 1, false]
      };

      this.assertDeepEquals(expected, message.toObject());
      // test parser
      this.assertDeepEquals(
        expected,
        this.parser.parse(JSON.stringify(expected)).toObject()
      );
    },

    "test: JSON-RPC error object"() {
      let message = new qx.io.jsonrpc.protocol.Error(1, 5, "error!");
      let expected = {
        jsonrpc: "2.0",
        id: 1,
        error: {
          code: 5,
          message: "error!"
        }
      };

      this.assertDeepEquals(expected, message.toObject());
      // test parser
      this.assertDeepEquals(
        expected,
        this.parser.parse(JSON.stringify(expected)).toObject()
      );
    },

    "test: JSON-RPC result object"() {
      let message = new qx.io.jsonrpc.protocol.Error(1, 5, "error!");
      let expected = {
        jsonrpc: "2.0",
        id: 1,
        error: {
          code: 5,
          message: "error!"
        }
      };

      this.assertDeepEquals(expected, message.toObject());
      // test parser
      this.assertDeepEquals(
        expected,
        this.parser.parse(JSON.stringify(expected)).toObject()
      );
    },

    "test: JSON-RPC message serialization is unchanged for ordinary values"() {
      let message = new qx.io.jsonrpc.protocol.Request(
        "foo",
        {
          text: 'a "quoted" and a \\ backslash',
          escapes: "\r\n\t\f\b",
          number: 1.5,
          flag: false,
          nothing: null,
          list: [1, "two", { three: 3 }]
        },
        1
      );

      // byte for byte what qx.util.Serializer.toJson produced, including the
      // order in which the properties of the message are written
      this.assertEquals(qx.util.Serializer.toJson(message), message.toString());

      this.assertDeepEquals(message.toObject(), JSON.parse(message.toString()));
    },

    "test: JSON-RPC message serialization produces valid JSON"() {
      let params = value =>
        JSON.parse(
          new qx.io.jsonrpc.protocol.Request("foo", value, 1).toString()
        ).params;

      // control characters below U+0020 used to be written unescaped
      this.assertDeepEquals({ s: "a\u000Bb" }, params({ s: "a\u000Bb" }));

      // NaN and Infinity used to be written bare
      this.assertDeepEquals(
        { nan: null, inf: null },
        params({ nan: NaN, inf: Infinity })
      );

      // keys were written unescaped
      this.assertDeepEquals({ 'say "hi"': 1 }, params({ 'say "hi"': 1 }));
      this.assertDeepEquals({ "C:\\temp": 1 }, params({ "C:\\temp": 1 }));

      // dates were written as a locale string without milliseconds
      this.assertDeepEquals(
        { d: "2024-01-02T03:04:05.678Z" },
        params({ d: new Date(Date.UTC(2024, 0, 2, 3, 4, 5, 678)) })
      );
    },

    "test: JSON-RPC message serialization of qooxdoo objects"() {
      let array = new qx.data.Array([1, 2]);
      let message = new qx.io.jsonrpc.protocol.Request(
        "foo",
        {
          array,
          translated: qx.locale.Manager.tr("Hello"),
          object: new qx.io.jsonrpc.protocol.Notification("bar", { baz: true })
        },
        1
      );

      this.assertDeepEquals(
        {
          array: [1, 2],
          translated: "Hello",
          object: { jsonrpc: "2.0", method: "bar", params: { baz: true } }
        },
        JSON.parse(message.toString()).params
      );

      message.getParams().object.dispose();
      array.dispose();
      message.dispose();
    }
  }
});
