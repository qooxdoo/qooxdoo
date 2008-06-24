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
        "Hello %1!": "Juhu %1!"
      });
      manager.setLocale("de");

      var root = this.getRoot();


      // transform
      var label = new qx.ui.basic.Label(this.tr("Hello %1!", "Fabian"));
      root.add(label, {top: 50, left: 10});



      // external binding
      var label = new qx.ui.basic.Label();
      this.bindtr(label, "content", this.marktr("Hello %1!"), "Fabian");
      root.add(label, {left: 10, top: 10});

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


    bindtr : function(obj, propname, text, varargs)
    {
      var mgr = qx.locale.Manager.getInstance();
      var args = qx.lang.Array.fromArguments(arguments, 3);

      var update = function()
      {
        var tr = mgr.translate(text.toString(), args, mgr.getLocale());
        var props = {};
        props[propname] = tr;
        obj.set(props);
      }
      update();
      mgr.addListener("changeLocale", update, this);
    }
  }
});

