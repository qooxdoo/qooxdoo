/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)

************************************************************************ */

/* ************************************************************************
************************************************************************ */
/**
 *
 * @asset(qx/test/colorstrip.gif)
 */

qx.Class.define("qx.test.io.ImageLoader",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function()
    {
      this.__imageUri = qx.util.ResourceManager.getInstance().toUri("qx/test/colorstrip.gif");
      this.__wrongImageUri = this.__imageUri.replace(/color/, "foocolor");

      this.__vectorImageUri = qx.util.ResourceManager.getInstance().toUri("qx/test/bluebar.svg");
      this.__wrongVectorImageUri = this.__vectorImageUri.replace(/blue/, "fooblue");
    },

    tearDown : function()
    {
      qx.io.ImageLoader.dispose();
    },


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
      }, this, 500);


      this.wait();
    },

    testLoadVectorImageSuccess : function()
    {
      this.__imageSource = null;
      qx.io.ImageLoader.load(this.__vectorImageUri, function(source, entry) {
        this.__imageSource = source;
      }, this);

      qx.event.Timer.once(function(e) {
        var self = this;
        this.resume(function() {
          this.assertTrue(qx.io.ImageLoader.isLoaded(this.__imageSource));
        }, self);
      }, this, 500);


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
      }, this, 500);

      this.wait();
    },

    testLoadVectorImageFailure : function()
    {
      this.__imageSource = null;
      qx.io.ImageLoader.load(this.__wrongVectorImageUri, function(source, entry) {
        this.__imageSource = source;
      }, this);

      qx.event.Timer.once(function(e) {
        var self = this;
        this.resume(function() {
          this.assertTrue(qx.io.ImageLoader.isFailed(this.__imageSource));
        }, self);
      }, this, 500);

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
          this.assertEquals(192, qx.io.ImageLoader.getWidth(this.__imageSource));
        }, self);
      }, this, 500);

      this.wait();
    },

    testVectorImageWidth : function()
    {
      this.__imageSource = null;
      qx.io.ImageLoader.load(this.__vectorImageUri, function(source, entry) {
        this.__imageSource = source;
      }, this);

      qx.event.Timer.once(function(e) {
        var self = this;
        this.resume(function() {
          this.assertEquals(192, qx.io.ImageLoader.getWidth(this.__imageSource));
        }, self);
      }, this, 500);

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
          this.assertEquals(10, qx.io.ImageLoader.getHeight(this.__imageSource));
        }, self);
      }, this, 500);

      this.wait();
    },

    testVectorImageHeight : function()
    {
      this.__imageSource = null;
      qx.io.ImageLoader.load(this.__vectorImageUri, function(source, entry) {
        this.__imageSource = source;
      }, this);

      qx.event.Timer.once(function(e) {
        var self = this;
        this.resume(function() {
          this.assertEquals(10, qx.io.ImageLoader.getHeight(this.__imageSource));
        }, self);
      }, this, 500);

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
          this.assertEquals(192, size.width);
          this.assertEquals(10, size.height);
        }, self);
      }, this, 500);

      this.wait();
    },

    testVectorImageSize : function()
    {
      this.__imageSource = null;
      qx.io.ImageLoader.load(this.__vectorImageUri, function(source, entry) {
        this.__imageSource = source;
      }, this);

      qx.event.Timer.once(function(e) {
        var self = this;
        this.resume(function() {
          var size = qx.io.ImageLoader.getSize(this.__imageSource);
          this.assertEquals(192, size.width);
          this.assertEquals(10, size.height);
        }, self);
      }, this, 500);

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
          this.assertEquals("gif", qx.io.ImageLoader.getFormat(this.__imageSource));
        }, self);
      }, this, 500);

      this.wait();
    },


    testAbort : function()
    {
      var aborted = false;
      this.__imageSource = null;
      qx.io.ImageLoader.load(this.__imageUri, function(source, entry) {
        aborted = true;
        this.assertTrue(entry.aborted);
        this.assertEquals(this.__imageUri, source);
      }, this);

      qx.io.ImageLoader.abort(this.__imageUri);

      this.assertTrue(aborted);
    }
  }
});
