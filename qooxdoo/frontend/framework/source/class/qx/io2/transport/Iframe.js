// Supported incoming mime types: HTML
// Can load cross domain: NO
// Supported methods: GET
// Can upload data (form fields): YES

qx.Class.define("qx.io2.transport.Iframe",
{
  statics :
  {
    _dataTypes :
    {
      text : true,
      html : true
    },

    isSupported : function(options) {
      return !!(!options.crossDomain && this._dataTypes[options.dataType]);
    },

    send : function(options)
    {
      // TODO
    }
  }
});
