/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014-2015 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */
/**
 * Generic wrapper instance which wrapps a set of objects and forwards the API of
 * the first object to all objects in the array.
 */
qx.Bootstrap.define("qx.core.Wrapper", {
  extend : Array,
  construct : function() {
    for (var i=0, l=arguments.length; i<l; i++) {
      this.push(arguments[i]);
    }

    var firstItem = arguments[0];
    for (var name in firstItem) {

      if (this[name] !== undefined) {
        continue;
      }

      if (firstItem[name] instanceof Function) {
        this[name] = function(name) {
          var firstReturnValue;

          var args = Array.prototype.slice.call(arguments, 0);
          args.shift();

          this.forEach(function(item) {
            var returnValue = item[name].apply(item, args);
            if (firstReturnValue === undefined) {
              firstReturnValue = returnValue;
            }
          });

          // return the collection if the return value was the collection
          if (firstReturnValue === this[0]) {
            return this;
          }
          return firstReturnValue;
        }.bind(this, name);
      } else {
        Object.defineProperty(this, name, {
          enumerable: true,
          get: function(name) {
            return this[name];
          }.bind(firstItem, name),
          set: function(name, value) {
            this.forEach(function(item) {
              item[name] = value;
            });
          }.bind(this, name)
        });
      }
    }
  }
});
