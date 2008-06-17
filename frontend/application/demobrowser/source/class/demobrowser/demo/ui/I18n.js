/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.ui.I18n",
{
  extend : qx.application.Standalone,

  members :
  {
    locale : "de",

    main: function()
    {
      this.base(arguments);

      var manager = qx.locale.Manager.getInstance();
      manager.addTranslation("en", {
        "one": "one",
        "two": "two",
        "Hello %1!": "Hello %1!"
      });
      manager.addTranslation("de", {
        "one": "Eins",
        "two": "Zwei",
        "Hello %1!": "Hallo %1!"
      });
      manager.setLocale("de");

      qx.Class.include(qx.ui.basic.Label, demobrowser.demo.ui.MDynLocaleLabel);

      var root = this.getRoot();

      // external binding
      var label = new qx.ui.basic.Label();
      this.bindtr(label, label.setContent, this.tr("Hello %1!", "Fabian"));
      root.add(label, {left: 10, top: 10});

      var label = new qx.ui.basic.Label();
      label.setLocalizedContent(this.tr("one"));
      root.add(label, {left: 10, top: 30});

      var btn = new qx.ui.form.Button("Change locale");
      root.add(btn, {left: 100, top: 10});

      btn.addListener("execute", function(e)
      {
        var locale = manager.getLocale();
        if (locale == "de") {
          locale = "en";
        } else {
          locale = "de";
        }
        manager.setLocale(locale);
      }, this);
    },


    bindtr : function(obj, method, ls)
    {
      var update = function()
      {
        var tr = ls.toString();
        method.call(obj, tr);
      }
      update();
      qx.locale.Manager.getInstance().addListener("changeLocale", update, this);
    }
  }
});


qx.Mixin.define("demobrowser.demo.ui.MDynLocaleLabel",
{
  properties : {
    localizedContent : {
      check: "qx.locale.LocalizedString",
      apply: "_applyLocalizedContent"
    }
  },


  members :
  {
    _applyLocalizedContent : function(value, old)
    {
      this.setContent(value.toString());

      qx.locale.Manager.getInstance().addListener("changeLocale", function(e) {
        this.setContent(value.toString());
      }, this);
    }
  }
});

