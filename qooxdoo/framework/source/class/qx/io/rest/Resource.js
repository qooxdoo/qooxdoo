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

qx.Class.define("qx.io.rest.Resource",
{
  extend : qx.core.Object,

  construct: function()
  {
    this.base(arguments);
  },

  members:
  {
    __routes: {},
    __request: null,

    //
    // Request handling
    //

    _getRequest: function() {
      return new qx.io.request.Xhr();
    },

    __createRequest: function() {
      if (this.__request) {
        this.__request.dispose();
      }

      this.__request = this._getRequest();
      return this.__request;
    },

    //
    // Routes and actions
    //

    route: function(method, url, action) {
      this.__routes[action] = [method, url];

      if (typeof this[action] !== "undefined") {
        throw new Error("Method with name of action (" +
          action + ") already exists. Choose another action name.");
      }

      this[action] = qx.lang.Function.bind(function() {
        this._invoke(action);
        return this;
      }, this);
    },

    _invoke: function(action) {
      var req = this.__createRequest(),
          params = this._getRequestParams(action);

      req.set({
        method: params[0],
        url: params[1]
      });

      req.addListener("success", function() {
        this.fireDataEvent(action + "Success", req.getResponse());
      }, this);

      req.send();
    },

    /**
     * @internal
     */
    _getRequestParams: function(action) {
      return this.__routes[action];
    }
  },

  destruct: function() {
    this.__request && this.__request.dispose();
  }
});
