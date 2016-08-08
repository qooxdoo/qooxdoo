/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("testrunner.TestLoaderMobile",
{
  extend : qx.dev.unit.TestLoaderMobile,

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Returns the TestLoader instance
     *
     * @return {testrunner.TestLoader} TestLoader instance
     */
    getInstance : function() {
      return this.instance;
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    main : function()
    {
      testrunner.TestLoader.instance = this;
      this.base(arguments);
    }
  }
});
