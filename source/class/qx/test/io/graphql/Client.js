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

/**
 * @require(qx.io.transport.Xhr)
 * @ignore(fetch)
 */
qx.Class.define("qx.test.io.graphql.Client", {
  extend: qx.dev.unit.TestCase,
  include: [qx.test.io.MAssert],
  statics: {
    TEST_ENDPOINT: "https://countries.trevorblades.com/"
  },

  construct() {
    super();
    let transport = new qx.io.transport.Xhr(this.constructor.TEST_ENDPOINT);
    transport.getTransportImpl();
    this.client = new qx.io.graphql.Client(transport);
  },

  members: {
    __hasEndpoint: false,
    __skipMsg: "Skipping test as endpoint is not available.",

    async runQuery(query, expected) {
      let req = new qx.io.graphql.protocol.Request({ query });
      let result = await this.client.send(req);
      this.assertDeepEquals(expected, result);
    },

    async runQueryWithVariables(query, variables, expected) {
      let req = new qx.io.graphql.protocol.Request({ query });
      req.setVariables(variables);
      let result = await this.client.send(req);
      this.assertDeepEquals(expected, result);
    },

    async "test: check endpoint"() {
      try {
        let url = this.constructor.TEST_ENDPOINT;
        let body = '{"query":"{__typename}"}';
        let init = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body
        };

        let response = await fetch(url, init);
        let result = await response.json();
        this.assertDeepEquals(
          {
            data: {
              __typename: "Query"
            }
          },

          result
        );

        this.__hasEndpoint = true;
      } catch (e) {
        console.error(
          `Endpoint ${this.constructor.TEST_ENDPOINT} is not accessible: ${e.message}`
        );
      }
    },

    async "test: execute query"() {
      if (!this.__hasEndpoint) {
        return this.skip(this.__skipMsg);
      }
      await this.runQuery(
        `{
          country(code: "BR") {
            name
            native
            capital
            currency
            languages {
              code
              name
            }
          }
        }`,
        {
          country: {
            name: "Brazil",
            native: "Brasil",
            capital: "Brasília",
            currency: "BRL",
            languages: [
              {
                code: "pt",
                name: "Portuguese"
              }
            ]
          }
        }
      );
    },

    async "test: execute query with variables"() {
      if (!this.__hasEndpoint) {
        return this.skip(this.__skipMsg);
      }
      await this.runQueryWithVariables(
        `query ($countryCode:ID!){
          country(code: $countryCode) {
            name
            languages {
              code
              name
            }
          }
        }`,
        { countryCode: "BE" },
        {
          country: {
            name: "Belgium",
            languages: [
              {
                code: "nl",
                name: "Dutch"
              },

              {
                code: "fr",
                name: "French"
              },

              {
                code: "de",
                name: "German"
              }
            ]
          }
        }
      );
    },

    async "test: expect error after invalid query"() {
      if (!this.__hasEndpoint) {
        return this.skip(this.__skipMsg);
      }
      try {
        await this.runQuery(`query { invalidSyntax }`);
      } catch (e) {
        this.assertInstance(e, qx.io.exception.Protocol);
        this.assertContains("invalidSyntax", JSON.stringify(e.data));
        return;
      }
      throw new Error("Query should return an error after invalid query");
    },

    async "test: expect transport error"() {
      if (!this.__hasEndpoint) {
        return this.skip(this.__skipMsg);
      }
      try {
        const client = new qx.io.graphql.Client(
          "https://doesnotexist.org/" + Math.random()
        );

        const query = "query { doesnotmatter }";
        const request = new qx.io.graphql.protocol.Request({ query });
        await client.send(request);
      } catch (e) {
        this.assertInstance(e, qx.io.exception.Transport);
        return;
      }
      throw new Error("Query should throw qx.io.exception.Transport");
    }
  }
});
