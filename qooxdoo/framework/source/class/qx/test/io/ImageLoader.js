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
     * Alexander Steitz (aback)

************************************************************************ */

qx.Class.define("qx.test.io.ImageLoader",
{
  extend : qx.dev.unit.TestCase,

  members :
  {

    setUp : function()
    {
      var location = window.parent.location.href;
      var pathName = location.substring(0, location.lastIndexOf("/") + 1);

      this.__imageUri = pathName + "resource/testrunner/image/colorstrip.gif";
      this.__wrongImageUri = pathName + "resource/testrunner/image/foocolorstrip.gif";
    },


    tearDown : function() {},


    testLoadImageSuccess : function()
    {
      this.__imageSource = null;
      qx.io.ImageLoader.load(this.__imageUri, function(source, entry) {
        this.__imageSource = source;
      }, this);

      qx.event.Timer.once(function(e) {
        var self = this;
        this.resume(function() {
          this.assertTrue(qx.io.ImageLoader.isLoaded(this.__imageSource));
        }, self);
      }, this, 2000);


      this.wait();
    },

    testLoadImageFailure : function()
    {
      this.__imageSource = null;
      qx.io.ImageLoader.load(this.__wrongImageUri, function(source, entry) {
        this.__imageSource = source;
      }, this);

      qx.event.Timer.once(function(e) {
        var self = this;
        this.resume(function() {
          this.assertTrue(qx.io.ImageLoader.isFailed(this.__imageSource));
        }, self);
      }, this, 2000);

      this.wait();
    },

    testImageWidth : function()
    {
      this.__imageSource = null;
      qx.io.ImageLoader.load(this.__imageUri, function(source, entry) {
        this.__imageSource = source;
      }, this);

      qx.event.Timer.once(function(e) {
        var self = this;
        this.resume(function() {
          this.assertEquals(qx.io.ImageLoader.getWidth(this.__imageSource), 192);
        }, self);
      }, this, 2000);

      this.wait();
    },

    testImageHeight : function()
    {
      this.__imageSource = null;
      qx.io.ImageLoader.load(this.__imageUri, function(source, entry) {
        this.__imageSource = source;
      }, this);

      qx.event.Timer.once(function(e) {
        var self = this;
        this.resume(function() {
          this.assertEquals(qx.io.ImageLoader.getHeight(this.__imageSource), 10);
        }, self);
      }, this, 2000);

      this.wait();
    },

    testImageSize : function()
    {
      this.__imageSource = null;
      qx.io.ImageLoader.load(this.__imageUri, function(source, entry) {
        this.__imageSource = source;
      }, this);

      qx.event.Timer.once(function(e) {
        var self = this;
        this.resume(function() {
          var size = qx.io.ImageLoader.getSize(this.__imageSource);
          this.assertEquals(size.width, 192);
          this.assertEquals(size.height, 10);
        }, self);
      }, this, 2000);

      this.wait();
    },

    testImageFormat : function()
    {
      this.__imageSource = null;
      qx.io.ImageLoader.load(this.__imageUri, function(source, entry) {
        this.__imageSource = source;
      }, this);

      qx.event.Timer.once(function(e) {
        var self = this;
        this.resume(function() {
          this.assertEquals(qx.io.ImageLoader.getFormat(this.__imageSource), "gif");
        }, self);
      }, this, 2000);

      this.wait();
    }
  }
});
