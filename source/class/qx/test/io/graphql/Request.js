/**
 * @require(qx.io.transport.Xhr)
 */
qx.Class.define("qx.test.io.graphql.Request", {
  extend: qx.dev.unit.TestCase,
  include: [qx.test.io.MAssert],

  members: {
    "test: request can be converted to json"() {
      const query = "query { SomeRandomStuff }";
      const variables = { testKey: "testValue" };

      const request = new qx.io.graphql.protocol.Request({ query });
      request.setVariables(variables);

      const expected =
        '{"query":"query { SomeRandomStuff }","variables":{"testKey":"testValue"}}';
      this.assertEquals(expected, request.toString());
    },

    "test: no variables in the final string"() {
      const query = "query { SomeRandomStuff }";
      const request = new qx.io.graphql.protocol.Request({ query });
      const expected = '{"query":"query { SomeRandomStuff }"}';
      this.assertEquals(expected, request.toString());
    },

    "test: variables can be bound"() {
      const query = "query { SomeRandomStuff }";
      const variables = { testKey: "testValue" };
      const request = new qx.io.graphql.protocol.Request({ query });
      request.setVariables(variables);

      const model = qx.data.marshal.Json.createModel({ source: "test" });
      model.bind("source", request, "variables.testKey");
      model.setSource("newTestValue");

      this.assertMatch(request.toString(), /newTestValue/);
    }
  }
});
