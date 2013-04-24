/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

************************************************************************ */
/**
 * Client-side wrapper of a REST resource.
 *
 * Each instance represents a resource in terms of REST. A number of actions
 * (usually HTTP methods) unique to the resource can be defined and invoked.
 * A resource with its actions is configured declaratively by passing a resource
 * description to the constructor, or programatically using {@link qx.io.rest.Resource#map}.
 *
 * Each action is associated to a route. A route is a combination of method,
 * URL pattern and optional parameter constraints.
 *
 * An action is invoked by calling a method with the same name. When a URL
 * pattern of a route contains positional parameters, those parameters must be
 * passed when invoking the associated action. Also, constraints defined in the
 * route must be satisfied.
 *
 * When an action is invoked, a request is configured according to the associated
 * route, is passed the URL parameters, request body data, and finally send.
 * What kind of request is send can be configured by overwriting {@link qx.io.rest.Resource#_getRequest}.
 *
 * No contraints on the action's name or the scope of the URLs are imposed. However,
 * if you want to follow RESTful design patterns it is recommended to name actions
 * the same as the HTTP action.
 *
 * <pre class="javascript">
 * var description = {
 *  "get": { method: "GET", url: "/photo/{id}" },
 *  "put": { method: "PUT", url: "/photo/{id}"},
 *  "post": { method: "POST", url: "/photos/"}
 * };
 * var photo = new qx.io.rest.Resource(description);
 * // Can also be written: photo.invoke("get", {id: 1});
 * photo.get({id: 1});
 *
 * // Additionally sets request data
 * // In a RESTful environment this creates a new resource with the given 'id'
 * photo.put({id: 1}, {title: "Monkey"});
 *
 * // Additionally sets request data
 * // In a RESTful environment this adds a new resource to the resource collection 'photos'
 * photo.post(null, {title: "Monkey"});
 * </pre>
 *
 * To check for existence of URL parameters or constrain them to a certain format, you
 * can add a <code>check</code> property to the description. See {@link qx.io.rest.Resource#map} for details.
 *
 * <pre class="javascript">
 * var description = {
 *  "get": { method: "GET", url: "/photo/{id}", check: { id: /\d+/ } }
 * };
 * var photo = new qx.io.rest.Resource(description);
 * // photo.get({id: "FAIL"});
 * // -- Error: "Parameter 'id' is invalid"
 * </pre>
 *
 * If your description happens to use the same action more than once, consider
 * defining another resource.
 *
 * <pre class="javascript">
 * var description = {
 *  "get": { method: "GET", url: "/photos"},
 * };
 * // Distinguish "photo" (singular) and "photos" (plural) resource
 * var photos = new qx.io.rest.Resource(description);
 * photos.get();
 * </pre>
 *
 * Basically, all routes of a resource should point to the same URL (resource in
 * terms of HTTP). One acceptable exception of this constraint are resources where
 * required parameters are part of the URL (<code>/photos/1/</code>) or filter
 * resources. For instance:
 *
 * <pre class="javascript">
 * var description = {
 *  "get": { method: "GET", url: "/photos/{tag}" }
 * };
 * var photos = new qx.io.rest.Resource(description);
 * photos.get();
 * photos.get({tag: "wildlife"})
 * </pre>
 *
 * Strictly speaking, the <code>photos</code> instance represents two distinct resources
 * and could therefore just as well mapped to two distinct resources (for instance,
 * named photos and photosTagged). What style to choose depends on the kind of data
 * returned. For instance, it seems sensible to stick with one resource if the filter
 * only limits the result set (i.e. the invidual results have the same properties).
 *
 * In order to respond to successful (or erroneous) invocations of actions,
 * either listen to the generic "success" or "error" event and get the action
 * from the event data, or listen to action specific events defined at runtime.
 * Action specific events follow the pattern "&lt;action&gt;Success" and
 * "&lt;action&gt;Error", e.g. "indexSuccess".
 */
qx.Bootstrap.define("qx.module.Rest", {
  statics :
  {
    /**
     * @param description {Map?} Each key of the map is interpreted as
     *  <code>action</code> name. The value associated to the key must be a map
     *  with the properties <code>method</code> and <code>url</code>.
     *  <code>check</code> is optional. Also see {@link qx.io.rest.Resource#map}.
     *
     * For example:
     *
     * <pre class="javascript">
     * { get: {method: "GET", url: "/photos/{id}", check: { id: /\d+/ } }
     * </pre>
     *
     * @return {qx.io.rest.Resource} The resource object.
     */
    resource : function(description) {
      return new qx.io.rest.Resource(description);
    }
  },

  defer : function(statics) {
    qxWeb.$attachStatic({
      "rest" : {
        "resource" : statics.resource
      }
    });
  }
});
