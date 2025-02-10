/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2023-24 Zenesis Limited (https://www.zenesis.com)

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (github.com/johnspackman)

************************************************************************ */

/**
 * Implementation of check for class instances
 */
qx.Bootstrap.define("qx.core.check.DynamicTypeCheck", {
  extend: qx.core.check.AbstractCheck,

  construct(typename, nullable) {
    super(nullable);
    this.__typename = typename;
  },

  members: {
    /** @type{String} the name of the class to check against */
    __typename: null,

    /**
     * @override
     */
    _matchesImpl(value) {
      if (qx.Class.isDefined(this.__typename)) {
        let clazz = qx.Class.getByName(this.__typename);
        let tmp = value.constructor;
        while (tmp) {
          if (tmp === clazz) {
            return true;
          }
          tmp = tmp.superclass;
        }
      } else if (qx.Interface && qx.Interface.isDefined(this.__typename)) {
        let ifc = qx.Interface.getByName(this.__typename);
        let tmp = value;
        while (tmp) {
          if (qx.Class.implementsInterface(tmp, ifc)) {
            return true;
          }
          tmp = tmp.superclass;
        }
      }

      return false;
    },

    /**
     * @override
     */
    isCompatible(check) {
      if (!(check instanceof this.constructor)) {
        return false;
      }
      if (this.isNullable() && !check.isNullable()) {
        return false;
      }
      let tmp = this.__clazz;
      let requiredSuperclass = check.__clazz;
      while (tmp) {
        if (tmp === requiredSuperclass) {
          return true;
        }
        tmp = tmp.superclass;
      }
      return false;
    }
  }
});
