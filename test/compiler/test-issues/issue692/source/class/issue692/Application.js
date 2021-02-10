/* ************************************************************************

   Copyright: 2019 undefined

   License: MIT license

   Authors: undefined

************************************************************************ */

/**
 * @asset(issue692/*)
 * @require(qx.core.BaseInit)
 */
qx.Class.define("issue692.Application", {
  extend: qx.application.Basic,
  members: {
    main: function() {
      this.base(arguments);

      qx.core.Assert.assertTrue(!Object.values.toString().match(/for\s*\(var\s+/));
      console.log("OK");
    }
  }
});
