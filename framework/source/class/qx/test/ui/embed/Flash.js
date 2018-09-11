/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/* ************************************************************************


************************************************************************ */
/**
 *
 * @asset(qx/test/UnitTestFlash.swf)
 */

qx.Class.define("qx.test.ui.embed.Flash",
{
  extend : qx.test.ui.LayoutTestCase,
  include : [qx.dev.unit.MMock, qx.dev.unit.MRequirements],

  statics :
  {
    isFlashReady : false,


    flashCallback : function() {
      qx.test.ui.embed.Flash.isFlashReady = true;
    }
  },

  members :
  {
    __flash : null,


    __params : null,


    __variables : null,


    setUp : function()
    {
      this.require(["plugin.flash"]);
      this.flush();
      this.__params = {
        wmode : "opaque",
        quality : "best",
        allowScriptAccess : "sameDomain",
        swLiveConnect : "true",
        play : "true",
        loop : "true",
        menu : "true"
      };

      this.__variables = {
        init : "qx.test.ui.embed.Flash.flashCallback",
        flashVar1: "bli bla blub",
        flashVar2: "bulb alb ilb"
      };

      var flash = this.__flash = new qx.ui.embed.Flash("qx/test/UnitTestFlash.swf", "flashmovie");
      flash.setVariables(this.__variables);
      flash.setScale("noscale");
      flash.setPlay(true);
      flash.setLoop(true);
      flash.setMenu(true);

      this.getRoot().add(this.__flash, {edge: 10});
    },


    tearDown : function() {
      qx.test.ui.embed.Flash.isFlashReady = false;
      this.getRoot().removeAll();
      this.__flash.destroy();
      this.__flash = null;
    },


    testEvents : function()
    {
      // disable event tests for chrome on linux to have travis ci
      // succeed again
      // see https://github.com/qooxdoo/qooxdoo/issues/9167
      this.require(["noChromeOnLinux"]);
      var test = {
        loading : function() {},
        loaded : function() {},
        timeout : function() {}
      };

      var loading = this.spy(test, "loading");
      var loaded = this.spy(test, "loaded");
      var timeout = this.spy(test, "timeout");
      this.__flash.addListener("loading", test.loading);
      this.__flash.addListener("loaded", test.loaded);
      this.__flash.addListener("timeout", test.timeout);

      var that = this;
      this.wait(2000, function()
      {
        that.assertCalled(loading);
        that.assertCalled(loaded);
        that.assertNotCalled(timeout);
        loaded.calledAfter(loading);
      });
    },


    testLoadTimeout : function()
    {
      if (qx.core.Environment.get("qx.test.travis") == "true") {
        this.skip("Test disabled on travis");
      }
      
      var test = {
        loading : function() {},
        loaded : function() {},
        timeout : function() {}
      };

      var loading = this.spy(test, "loading");
      var loaded = this.spy(test, "loaded");
      var timeout = this.spy(test, "timeout");

      var flash = new qx.ui.embed.Flash("qx/test/invalidmovie.swf", "invalidmovie");
      flash.setLoadTimeout(1000);
      this.getRoot().removeAll();
      this.getRoot().add(flash, {edge: 10});

      flash.addListener("loading", test.loading);
      flash.addListener("loaded", test.loaded);
      flash.addListener("timeout", test.timeout);

      var that = this;
      this.wait(2000, function()
      {
        that.assertCalled(loading);
        that.assertNotCalled(loaded);
        that.assertCalled(timeout);
        timeout.calledAfter(loading);
      });
    },


    testCreateFlash : function()
    {
      var that = this;
      this.wait(2000, function()
      {
        var flash = that.__flash.getFlashElement();
        that.assertNotNull(flash, "DOM element for Flash movie is not created!");

        that.assertIdentical("object", flash.nodeName.toLowerCase());

        // general object attribute tests
        that.assertIdentical("100%", flash.width);
        that.assertIdentical("100%", flash.height);
        that.assertIdentical("flashmovie", flash.id);

        // object attribute tests for IE or other browser
        if ((qx.core.Environment.get("engine.name") == "mshtml") &&
          qx.core.Environment.get("browser.documentmode") < 11)
        {
          that.assertIdentical("clsid:D27CDB6E-AE6D-11cf-96B8-444553540000", flash.classid);
        }
        else
        {
          var index = flash.data.lastIndexOf("qx/test/UnitTestFlash.swf");
          var substring = flash.data.substring(index, flash.data.length);

          that.assertIdentical("qx/test/UnitTestFlash.swf", substring);
          that.assertIdentical("application/x-shockwave-flash", flash.type);
        }

        // test params and flashvars
        var params = that.__params;
        params.flashvars = "init=qx.test.ui.embed.Flash.flashCallback&flashVar1=bli bla blub&flashVar2=bulb alb ilb";

        var children = flash.childNodes;
        for(var name in params)
        {
          var testSuccessful = false;
          for(var i = 0; i < children.length; i++)
          {
            that.assertIdentical("param", children[i].nodeName.toLowerCase());

            if (children[i].name === name) {
              testSuccessful = true;
              that.assertIdentical(params[name], children[i].value);
              break;
            }
          }
          that.assertTrue(testSuccessful, "Param element with name:'" + name + "' not found!");
        }
      });
    },

    testProperties : function()
    {
      var that = this;
      this.wait(5000, function()
      {
        that.assertException(function()
        {
          that.__flash.setSource("new.swf");
        }, Error, null, "Error expected by calling 'setSource'!");

        that.assertException(function()
        {
          that.__flash.setId("newId");
        }, Error, null, "Error expected by calling 'setId'!");

        that.assertException(function()
        {
          that.__flash.setQuality("low");
        }, Error, null, "Error expected by calling 'setQuality'!");

        that.assertException(function()
        {
          that.__flash.setScale("excactfit");
        }, Error, null, "Error expected by calling 'setScale'!");

        that.assertException(function()
        {
          that.__flash.setWmode("transparent");
        }, Error, null, "Error expected by calling 'setWmode'!");

        that.assertException(function()
        {
          that.__flash.setPlay(false);
        }, Error, null, "Error expected by calling 'setPlay'!");

        that.assertException(function()
        {
          that.__flash.setLoop(false);
        }, Error, null, "Error expected by calling 'setLoop'!");

        that.assertException(function()
        {
          that.__flash.setMenu(false);
        }, Error, null, "Error expected by calling 'setMenu'!");

        that.assertException(function()
        {
          that.__flash.setAllowScriptAccess("never");
        }, Error, null, "Error expected by calling 'setAllowScriptAccess'!");

        that.assertException(function()
        {
          that.__flash.setLiveConnect(false);
        }, Error, null, "Error expected by calling 'setLiveConnect'!");

        that.assertException(function()
        {
          that.__flash.setVariables({key: "value"});
        }, Error, null, "Error expected by calling 'setVariables'!");
      });
    },

    testExternalInterface : function()
    {
      // skip this test because it only runs with a webserver
      if (location.protocol.indexOf("http") !== 0) {
        this.warn("Skipped test 'testExternalInterface', because a webserver " +
          "is needed to run this test.");
        return;
      }

      var result = "";

      var that = this;
      this.wait(5000, function()
      {
        if (!qx.test.ui.embed.Flash.isFlashReady)
        {
          that.warn("ExternalInterface not ready -> skipped test");
          return;
        }

        var flash = that.__flash.getFlashElement();

        if (flash.echo) {
          result = flash.echo("hello echo!");
        }

        that.assertIdentical("hello echo!", result);
      });
    }
  }
});
