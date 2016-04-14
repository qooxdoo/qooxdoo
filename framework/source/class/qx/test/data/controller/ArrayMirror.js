/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com)

 ************************************************************************ */

qx.Class.define("qx.test.data.controller.ArrayMirror", {
  extend: qx.dev.unit.TestCase,

  members: {
    testObjects: function() {
      var t = this;
      var verifySame = function() {
        t.assertEquals(model.getLength(), target.getLength(), "Model length != target length");
        for (var i = 0; i < model.getLength(); i++) {
          var modelItem = model.getItem(i);
          var targetItem = target.getItem(i);
          t.assertEquals(modelItem.getTitle(), targetItem.getTitle(), "Wrong title");
          t.assertEquals(modelItem, targetItem.getModel(), "Wrong model");
        }
      };
      
      var model = new qx.data.Array();
      for (var i = 0; i < 10; i++)
        model.push(new qx.test.data.controller.DummyModelItem().set({ 
          title: "Item #" + (i+1),
          alpha: "Alpha #" + (i+1)
        }));
      
      var am = new qx.data.controller.ArrayMirror({
        createTargetItem: function() {
          return new qx.test.data.controller.DummyTargetItem()
        }
      });
      am.bindChild("title", "title");
      am.bindChild("", "model");
      
      var target = new qx.data.Array();
      am.set({
        model: model,
        target: target
      });
      verifySame();
      model.push(new qx.test.data.controller.DummyModelItem().set({ title: "Extra Item #1" }));
      verifySame();
      var modelItem = model.removeAt(4);
      verifySame();
      model.insertAt(6, modelItem);
      verifySame();
      model.shift();
      verifySame();
      model.insertAt(6, modelItem);
      verifySame();
      model.sort();
      verifySame();
      
      this.assertNull(target.getItem(2).getAlpha());
      am.bindChild("alpha", "alpha");
      verifySame();
      var model2Alpha = model.getItem(2).getAlpha();
      this.assertEquals(model2Alpha, target.getItem(2).getAlpha());
      am.unbindChild("alpha", "alpha");
      model.getItem(2).setAlpha("Aardvark");
      this.assertEquals(model2Alpha, target.getItem(2).getAlpha());
    }
  }
});
