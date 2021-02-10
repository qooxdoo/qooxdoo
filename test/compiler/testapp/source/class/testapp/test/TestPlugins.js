/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
 *
 *    Copyright:
 *      2011-2018 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      MIT: https://opensource.org/licenses/MIT
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com, @johnspackman)
 *
 * ************************************************************************/

qx.Class.define("testapp.test.TestPlugins", {
  extend: qx.dev.unit.TestCase,

  members: {
    testSimple: function() {
      qx.io.PartLoader.require(["pluginFramework", "pluginOne"], () => {
        this.debug("pluginOne loaded");
        var plugin = new testapp.plugins.PluginOne();
        this.assertEquals("testapp.plugins.PluginOne: Plugin One Hello\n", plugin.sayHello());
      }, this);
      qx.io.PartLoader.require(["pluginFramework", "pluginTwo"], () => {
        this.debug("pluginTwo loaded");
        var plugin = new testapp.plugins.PluginTwo();
        this.assertEquals("testapp.plugins.PluginTwo: Plugin One Hello\n", plugin.sayHello());
      }, this);
    }
  }
});
