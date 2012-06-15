/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * HTML templating module. This is a wrapper for mustache.js which is a
 * "framework-agnostic way to render logic-free views".
 *
 * Here is a basic example how to use it:
 * <pre class="javascript">
 * var template = "Hi, my name is {{name}}!";
 * var view = {name: "qooxdoo"};
 * q.template.render(template, view);
 * // return "Hi, my name is qooxdoo!"
 * </pre>
 *
 * For further details, please visit the mustache.js documentation here:
 *   https://github.com/janl/mustache.js/blob/master/README.md
 */
qx.Bootstrap.define("qx.module.Template", {
  statics :
  {
    /**
     * Helper method which provides direct access to templates stored as HTML in
     * the DOM. The DOM node with the given ID will be treated as a template,
     * parsed and a new DOM node will be returned containing the parsed data.
     * Keep in mind that templates can only have one root element.
     *
     * @attachStatic{q, template.get}
     * @param id {String} The id of the HTML template in the DOM.
     * @param view {Object} The object holding the data to render.
     * @param partials {Object} Object holding parts of a template.
     * @return {q} Collection containing a single DOM element with the parsed
     * template data.
     */
    get : function(id, view, partials) {
      var el = qx.bom.Template.get(id, view, partials);
      return q.$init([el]);
    },

    /**
     * Original and only template method of mustache.js. For further
     * documentation, please visit https://github.com/janl/mustache.js
     *
     * @attachStatic{q, template.render}
     * @param template {String} The String containing the template.
     * @param view {Object} The object holding the data to render.
     * @param partials {Object} Object holding parts of a template.
     * @return {String} The parsed template.
     */
    render : function(template, view, partials) {
      return qx.bom.Template.render(template, view, partials);
    }
  },


  defer : function(statics) {
    q.$attachStatic({
      "template" : {get: statics.get, render: statics.render}
    });
  }
});