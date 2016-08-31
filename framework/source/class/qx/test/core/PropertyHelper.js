/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.core.PropertyHelper", {
  extend : qx.core.Object,

  construct : function(delegate) {
    this.base(arguments);

    if (delegate) {
      delegate(this);
    }
  },

  properties :
  {
    // protection
    publicProp : { nullable : true },

    // types
    stringProp :
    {
      check    : "String",
      nullable : true
    },

    booleanProp :
    {
      check    : "Boolean",
      nullable : true
    },

    numberProp :
    {
      check    : "Number",
      nullable : true
    },

    objectProp :
    {
      check    : "Object",
      nullable : true
    },

    arrayProp :
    {
      check    : "Array",
      nullable : true
    },

    mapProp :
    {
      check    : "Map",
      nullable : true
    },

    // multi values
    noProp :
    {
      check    : "String",
      nullable : true
    },

    initProp : { init : "foo" },

    initApplyProp1 :
    {
      check : "String",
      init : "juhu",
      apply : "_applyInitApplyProp"
    },

    initApplyProp2 :
    {
      check : "String",
      init : null,
      nullable : true,
      apply : "_applyInitApplyProp"
    },

    nullProp :
    {
      init     : "bar",
      nullable : true
    },

    appearanceProp :
    {
      themeable : true,
      nullable  : true
    },

    fullProp :
    {
      init      : 100,
      themeable : true
    }
  },

  members :
  {
    _applyInitApplyProp : function(value, old) {
      this.lastApply = [value, old];
    }
  }
});