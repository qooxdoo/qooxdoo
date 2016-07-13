/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

************************************************************************ */
/**
 * This modules eases the communication with a RESTful web service by providing
 * a client-side wrapper of a REST resource.
 *
 * See {@link qx.bom.rest.Resource}.
 *
 * @group (IO)
 */
qx.Bootstrap.define("qx.module.Rest", {
  statics :
  {
    /**
     * @param description {Map?} Each key of the map is interpreted as
     *  <code>action</code> name. The value associated to the key must be a map
     *  with the properties <code>method</code> and <code>url</code>.
     *  <code>check</code> is optional. Also see {@link qx.bom.rest.Resource#map}.
     *
     * @attachStatic {qxWeb, rest.resource}
     * @return {qx.bom.rest.Resource} The resource object.
     */
    resource : function(description) {
      return new qx.bom.rest.Resource(description);
    }
  },

  defer : function(statics) {
    qxWeb.$attachAll(this, "rest");
  }
});
