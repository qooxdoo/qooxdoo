/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * @require(qxWeb)
 * @require(qx.module.Attribute)
 * @require(qx.module.Traversing)
 */

qx.Class.define("qx.test.mobile.LocaleSwitch",
{
  extend : qx.test.mobile.MobileTestCase,
  include : qx.locale.MTranslation,


  construct : function()
  {
    this.base(arguments);
    this.manager = qx.locale.Manager.getInstance();
  },



  members :
  {
    manager: null,
    __translationAdded : null,

    setUp : function() {
      this.base(arguments);
      if (!this.__translationAdded) {
        // add dummy translations
        this.manager.addTranslation("en_QX", {
          "test one"       : "test one",
          "test two"       : "test two",
          "test Hello %1!" : "test Hello %1!",
          "test Jonny"     : "test Jonny"
        });
        this.manager.addTranslation("de_QX", {
          "test one"       : "Eins",
          "test two"       : "Zwei",
          "test Hello %1!" : "Servus %1!",
          "test Jonny"     : "Jonathan"
        });
        this.__translationAdded = true;
      }
      this.manager.setLocale("en_QX");
    },

    tearDown : function() {
      this.base(arguments);
      this.manager.resetLocale();
    },


    testLabel : function()
    {
      var label = new qx.ui.mobile.basic.Label(this.tr("test one"));
      this.addAutoDispose(label);
      this.getRoot().add(label);

      this.assertEquals("test one", label.getValue());
      this.manager.setLocale("de_QX");
      this.assertEquals("Eins", label.getValue());
      this.manager.setLocale("en_QX");

      label.setValue(this.tr("test Hello %1!", this.tr("test Jonny")));
      this.assertEquals("test Hello test Jonny!", label.getValue());
      this.manager.setLocale("de_QX");
      this.assertEquals("Servus Jonathan!", label.getValue());

      // de -> en
      label.setValue(this.tr("test two"));
      this.assertEquals("Zwei", label.getValue());
      this.manager.setLocale("en_QX");
      this.assertEquals("test two", label.getValue());

      label.destroy();
    },

    testList : function()
    {
      var list = new qx.ui.mobile.list.List({
        configureItem : function(item, data, row) {
          item.setTitle(data.title);
          item.setSubtitle(data.subTitle);
        }
      });

      var data = [
        {
          title: this.tr("test one"),
          subTitle: this.tr("test two")
        },
        {
          title: this.tr("test Hello %1!", this.tr("test Jonny")),
          subTitle: this.tr("test Jonny")
        }
      ];

      list.setModel(new qx.data.Array(data));
      this.addAutoDispose(list);
      this.getRoot().add(list);

      this.__testListEn();

      this.manager.setLocale("de_QX");
      var title0 = q(".list * .list-item-title").eq(0).getHtml();
      this.assertEquals("Eins". title0);
      var subtitle0 = q(".list * .list-item-subtitle").eq(0).getHtml();
      this.assertEquals("Zwei", subtitle0);
      var title1 = q(".list * .list-item-title").eq(1).getHtml();
      this.assertEquals("Servus Jonathan!", title1);
      var subtitle1 = q(".list * .list-item-subtitle").eq(1).getHtml();
      this.assertEquals("Jonathan", subtitle1);

      this.manager.setLocale("en_QX");
      this.__testListEn();
    },

    __testListEn : function() {
      //debugger
      var title0 = q(".list * .list-item-title").eq(0).getHtml();
      this.assertEquals("test one". title0);
      var subtitle0 = q(".list * .list-item-subtitle").eq(0).getHtml();
      this.assertEquals("test two", subtitle0);
      var title1 = q(".list * .list-item-title").eq(1).getHtml();
      this.assertEquals("test Hello test Jonny!", title1);
      var subtitle1 = q(".list * .list-item-subtitle").eq(1).getHtml();
      this.assertEquals("test Jonny", subtitle1);
    },

    testFormRendererSingle : function()
    {
      var title = new qx.ui.mobile.form.Title(this.tr("test one"));
      this.addAutoDispose(title);
      var form = new qx.ui.mobile.form.Form();
      form.add(new qx.ui.mobile.form.TextField(), this.tr("test two"));

      this.getRoot().add(title);
      var renderer = new qx.ui.mobile.form.renderer.Single(form);
      this.addAutoDispose(renderer);
      this.getRoot().add(renderer);

      this.assertEquals("test one", title.getValue());
      this.assertEquals("test two", renderer._labels[0].getValue());
      this.manager.setLocale("de_QX");
      this.assertEquals("Eins", title.getValue());
      this.assertEquals("Zwei", renderer._labels[0].getValue());
      this.manager.setLocale("en_QX");

      title.destroy();
      renderer.destroy();
    }
  }
});
