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
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("playground.test.UrlShorter", 
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __shorter : null,
    
    setUp : function() 
    {
      this.__shorter = new playground.UrlShorter();
    },
    
    
    tearDown : function() 
    {
      this.__shorter.dispose();
      this.__shorter = null;
    },
    
    
    
    testFileUrl : function() {
      var url = "file:///Users/mw/Documents";
      this.__shorter.shorten(url, function(shorturl, error) {
        this.resume(function() {
          this.assertNull(shorturl, "No url should be returned");
          this.assertNotEquals(error, "", "An error message from bit.ly should be returned");
        }, this);
      }, this);
      this.wait(5000);
    },
    
    
    testNoUrl : function() {
      var url = "a b c";
      this.__shorter.shorten(url, function(shorturl, error) {
        this.resume(function() {
          this.assertNull(shorturl, "No url should be returned");
          this.assertNotEquals(error, "", "An error message from bit.ly should be returned");          
        }, this);
      }, this);
      this.wait(5000);
    },    
    
    
    testRegularUrl : function() {
      var url = "http://demo.qooxdoo.org/current/playground/#Hello%20World";
      this.__shorter.shorten(url, function(shorturl, error) {
        this.resume(function() {
          this.assertNotNull(shorturl, "A url should be returned. (" + error + ")");
          this.assertNull(error, "No error should appera");
        }, this);
      }, this);
      this.wait(5000);    
    },
      
    
    testLongUrl : function() {
      var url = "http://demo.qooxdoo.org/current/playground/#%7B%22code%22%3A%20%22function%2520createRandomRows(rowCount)%2520%257B%250A%2520%2520var%2520rowData%2520%253D%2520%255B%255D%253B%250A%2520%2520var%2520now%2520%253D%2520new%2520Date().getTime()%253B%250A%2520%2520var%2520dateRange%2520%253D%2520400%2520*%252024%2520*%252060%2520*%252060%2520*%25201000%253B%2520%252F%252F%2520400%2520days%250A%2520%2520var%2520nextId%2520%253D%25200%253B%250A%2520%2520for%2520(var%2520row%2520%253D%25200%253B%2520row%2520%253C%2520rowCount%253B%2520row%252B%252B)%2520%257B%250A%2520%2520%2520%2520var%2520date%2520%253D%2520new%2520Date(now%2520%252B%2520Math.random()%2520*%2520dateRange%2520-%2520dateRange%2520%252F%25202)%253B%250A%2520%2520%2520%2520rowData.push(%255B%2520nextId%252B%252B%252C%2520Math.random()%2520*%25201000%252C%2520date%252C%2520(Math.random()%2520%253E%25200.5)%2520%255D)%253B%250A%2520%2520%257D%250A%2520%2520return%2520rowData%253B%250A%257D%250A%250A%250A%252F%252F%2520window%250Avar%2520win%2520%253D%2520new%2520qx.ui.window.Window(%2522Table%2522).set(%257B%250A%2520%2520layout%2520%253A%2520new%2520qx.ui.layout.Grow()%252C%250A%2520%2520allowClose%253A%2520false%252C%250A%2520%2520allowMinimize%253A%2520false%252C%250A%2520%2520contentPadding%253A%25200%250A%257D)%253B%250Athis.getRoot().add(win)%253B%250Awin.moveTo(30%252C%252040)%253B%250Awin.open()%253B%250A%250A%252F%252F%2520table%2520model%250Avar%2520tableModel%2520%253D%2520new%2520qx.ui.table.model.Simple()%253B%250AtableModel.setColumns(%255B%2520%2522ID%2522%252C%2520%2522A%2520number%2522%252C%2520%2522A%2520date%2522%252C%2520%2522Boolean%2522%2520%255D)%253B%250AtableModel.setData(createRandomRows(1000))%253B%250A%250A%252F%252F%2520make%2520second%2520column%2520editable%250AtableModel.setColumnEditable(1%252C%2520true)%253B%250A%250A%252F%252F%2520table%250Avar%2520table%2520%253D%2520new%2520qx.ui.table.Table(tableModel).set(%257B%250A%2520%2520decorator%253A%2520null%250A%257D)%250Awin.add(table)%253B%250A%250Avar%2520tcm%2520%253D%2520ta";
      this.__shorter.shorten(url, function(shorturl, error) {
        this.resume(function() {
          this.assertNotNull(shorturl, "A url should be returned. (" + error + ")");
          this.assertNull(error, "No error should appera");
        }, this);
      }, this);
      this.wait(5000); 
    },
    
    
    // bit.ly supports only urls not longer than 2048
    testTooLongUrl : function() {
      var url = "http://demo.qooxdoo.org/current/playground/#%7B%22code%22%3A%20%22function%2520createRandomRows(rowCount)%2520%257B%250A%2520%2520var%2520rowData%2520%253D%2520%255B%255D%253B%250A%2520%2520var%2520now%2520%253D%2520new%2520Date().getTime()%253B%250A%2520%2520var%2520dateRange%2520%253D%2520400%2520*%252024%2520*%252060%2520*%252060%2520*%25201000%253B%2520%252F%252F%2520400%2520days%250A%2520%2520var%2520nextId%2520%253D%25200%253B%250A%2520%2520for%2520(var%2520row%2520%253D%25200%253B%2520row%2520%253C%2520rowCount%253B%2520row%252B%252B)%2520%257B%250A%2520%2520%2520%2520var%2520date%2520%253D%2520new%2520Date(now%2520%252B%2520Math.random()%2520*%2520dateRange%2520-%2520dateRange%2520%252F%25202)%253B%250A%2520%2520%2520%2520rowData.push(%255B%2520nextId%252B%252B%252C%2520Math.random()%2520*%25201000%252C%2520date%252C%2520(Math.random()%2520%253E%25200.5)%2520%255D)%253B%250A%2520%2520%257D%250A%2520%2520return%2520rowData%253B%250A%257D%250A%250A%250A%252F%252F%2520window%250Avar%2520win%2520%253D%2520new%2520qx.ui.window.Window(%2522Table%2522).set(%257B%250A%2520%2520layout%2520%253A%2520new%2520qx.ui.layout.Grow()%252C%250A%2520%2520allowClose%253A%2520false%252C%250A%2520%2520allowMinimize%253A%2520false%252C%250A%2520%2520contentPadding%253A%25200%250A%257D)%253B%250Athis.getRoot().add(win)%253B%250Awin.moveTo(30%252C%252040)%253B%250Awin.open()%253B%250A%250A%252F%252F%2520table%2520model%250Avar%2520tableModel%2520%253D%2520new%2520qx.ui.table.model.Simple()%253B%250AtableModel.setColumns(%255B%2520%2522ID%2522%252C%2520%2522A%2520number%2522%252C%2520%2522A%2520date%2522%252C%2520%2522Boolean%2522%2520%255D)%253B%250AtableModel.setData(createRandomRows(1000))%253B%250A%250A%252F%252F%2520make%2520second%2520column%2520editable%250AtableModel.setColumnEditable(1%252C%2520true)%253B%250A%250A%252F%252F%2520table%250Avar%2520table%2520%253D%2520new%2520qx.ui.table.Table(tableModel).set(%257B%250A%2520%2520decorator%253A%2520null%250A%257D)%250Awin.add(table)%253B%250A%250Avar%2520tcm%2520%253D%2520ta12102,0050351530";
      this.__shorter.shorten(url, function(shorturl, error) {
        this.resume(function() {
          this.assertNull(shorturl, "No url should be returned");
          this.assertNotEquals(error, "", "An error message from bit.ly should be returned");        }, this);
      }, this);
      this.wait(5000); 
    }    
  }
});
