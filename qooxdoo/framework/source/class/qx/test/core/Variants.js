/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#require(qx.legacy.core.Client)

************************************************************************ */

qx.Class.define("qx.test.core.Variants",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    /**
     * TODOC
     *
     * @return {void}
     */
    testBrowserAllDefined : function()
    {
      this.debug("test testBrowserAllDefined");

      qx.Class.define("qx.test.Browser1",
      {
        extend : Object,
        construct : function() {},

        members :
        {
          getName : qx.core.Variant.select("qx.client",
          {
            "default" : function() {
              return "unknown browser";
            },

            "gecko" : function() {
              return "Gecko";
            },

            "mshtml" : function() {
              return "Internet Explorer";
            },

            "webkit" : function() {
              return "Webkit";
            },

            "opera" : function() {
              return "Opera";
            }
          })
        }
      });

      var b = new qx.test.Browser1();

      if (qx.legacy.core.Client.getInstance().isGecko()) {
        this.assertEquals("Gecko", b.getName());
      } else if (qx.legacy.core.Client.getInstance().isMshtml()) {
        this.assertEquals("Internet Explorer", b.getName());
      } else if (qx.legacy.core.Client.getInstance().isWebkit()) {
        this.assertEquals("Webkit", b.getName());
      } else if (qx.legacy.core.Client.getInstance().isOpera()) {
        this.assertEquals("Opera", b.getName());
      }
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    testBrowserOrDefined : function()
    {
      this.debug("test testBrowserOrDefined");

      qx.Class.define("qx.test.Browser2",
      {
        extend : Object,
        construct : function() {},

        members :
        {
          getName : qx.core.Variant.select("qx.client",
          {
            "default" : function() {
              return "unknown browser";
            },

            "gecko|mshtml|webkit|opera" : function() {
              return "known browser";
            }
          })
        }
      });

      var b = new qx.test.Browser2();
      this.assertEquals("known browser", b.getName());
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    testBrowserOneDefined : function()
    {
      this.debug("test testBrowserOneDefined");

      qx.Class.define("qx.test.Browser3",
      {
        extend : Object,
        construct : function() {},

        members :
        {
          getName : qx.core.Variant.select("qx.client",
          {
            "default" : function() {
              return "default browser";
            },

            "unknown" : function() {
              return "unknown browser";
            }
          })
        }
      });

      var b = new qx.test.Browser3();
      this.assertEquals("default browser", b.getName());
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    testInlineSwitch : function()
    {
      this.debug("test testInlineSwitch");

      qx.core.Variant.define("test.animal", [ "dog", "cat", "snake" ], "snake");
      this.assertEquals("snake", qx.core.Variant.get("test.animal"));

      var c;

      if (qx.core.Variant.isSet("test.animal", "dog|snake"))
      {
        if (qx.core.Variant.isSet("test.animal", "dog")) {
          c = "dog";
        } else {
          c = "snake";
        }
      }
      else if (qx.core.Variant.isSet("test.animal", "cat"))
      {
        c = "cat";
      }

      if (qx.core.Variant.isSet("test.animal", "default")) {
        c = "snake";
      }

      this.assertEquals(qx.core.Variant.get("test.animal"), c);
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    testIfWithComment : function()
    {
      this.debug("test testIfWithComment");

      var b;


      /**
       *
       */
      if (qx.core.Variant.isSet("qx.client", "mshtml")) {
        b = "mshtml";
      }


      /**
       *
       */
      else if (qx.core.Variant.isSet("qx.client", "gecko")) {
        b = "gecko";
      }


      /**
       *
       */
      else if (qx.core.Variant.isSet("qx.client", "webkit")) {
        b = "webkit";
      }


      /**
       *
       */
      else if (qx.core.Variant.isSet("qx.client", "opera")) {
        b = "opera";
      }

      this.assertEquals(qx.core.Variant.get("qx.client"), b);

      if (qx.core.Variant.isSet("qx.client", "mshtml"))  // The Microsoft style
      {
        b = "mshtml";
      }
      else  // all other browsers
      {
        b = "other";
      }

      if (qx.legacy.core.Client.getInstance().isMshtml()) {
        this.assertEquals("mshtml", b);
      } else {
        this.assertEquals("other", b);
      }
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    testInlineOr : function()
    {
      this.debug("test testInlineOr");

      var c;

      if (qx.core.Variant.isSet("qx.client", "mshtml|opera|webkit|gecko")) {
        c = "all";
      } else {
        c = "unknown";
      }

      this.assertEquals("all", c);
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    testTernary : function()
    {
      var a = qx.core.Variant.isSet("qx.client", "mshtml") ? "mshtml" : "other";

      if (qx.legacy.core.Client.getInstance().isMshtml()) {
        this.assertEquals("mshtml", a);
      } else {
        this.assertEquals("other", a);
      }
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    testScope : function()
    {
      this.assertUndefined(window.abcdef);

      if (qx.core.Variant.isSet("qx.client", "mshtml|opera|webkit|gecko"))
      {
        abcdef = "mshtml";
        var g;
      }
      else
      {
        var abcdef = "other";

        var f = function() {
          var y;
        };

        var g, gh;
      }

      this.assertUndefined(window.abcdef);
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    testVariantInElse : function()
    {
      // this tests a pathological case which cased the generator to produce
      // invalid code
      var i = 1;

      if (true) {
        var i = 3;
      } else if (qx.core.Variant.isSet("qx.client", "mshtml")) {
        debug("");
      }

      i = 2;
      this.assertEquals(2, i);
    }
  }
});
