/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * EXPERIMENTAL!
 */
qx.Class.define("qx.test.ui.list.core.ModelProvider",
{
  extend : qx.dev.unit.TestCase,
  
  members :
  {
    __modelProvider : null,
    
    setUp : function() {
      this.__modelProvider = new qx.ui.list.core.ModelProvider();
    },
    
    tearDown : function()
    {
      this.__modelProvider.dispose();
      this.__modelProvider = null;
    },
    
    testGetLabel : function() {
      var item = "test";
      this.assertEquals(item, this.__modelProvider.getLabel(item));
      
      item = {label: "label", icon: "icon"};
      this.assertEquals(item.label, this.__modelProvider.getLabel(item));
    },

    testGetIcon : function() {
      var item = "test";
      this.assertNull(this.__modelProvider.getIcon(item));
      
      item = {label: "label", icon: "icon"};
      this.assertEquals(item.icon, this.__modelProvider.getIcon(item));
    },
    
    testSetLabelPath : function() {
      var item = {myLabel: "label", myIcon: "icon"};
      this.__modelProvider.setLabelPath("myLabel");
      this.assertEquals(item.myLabel, this.__modelProvider.getLabel(item));
    },
    
    testSetIconPath : function() {
      var item = {myLabel: "label", myIcon: "icon"};
      this.__modelProvider.setIconPath("myIcon");
      this.assertEquals(item.myIcon, this.__modelProvider.getIcon(item));
    }
  }
});
