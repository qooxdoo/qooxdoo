// Supported incoming mime types: JSONP
// Can load cross domain: YES
// Supported methods: GET
// Can upload data (form fields): NO

qx.Bootstrap.define("qx.io2.transport.Script",
{
  statics :
  {
    _dataTypes :
    {
      script : true,
      jsonp : true
    },


    /**
     * TODOC
     *
     * @type static
     * @param options {var} TODOC
     * @return {var} TODOC
     */
    isSupported : function(options) {
      return !options.uploadData && this._dataTypes[options.dataType];
    },


    /**
     * TODOC
     *
     * @type static
     * @param options {var} TODOC
     * @param callback {var} TODOC
     * @return {void}
     */
    send : function(options, callback)
    {
      // Place script element into head
      var head = document.getElementsByTagName("head")[0];

      // Create script element
      var script = document.createElement("script");

      // Setup URL
      script.src = options.url;

      // Handle Script loading
      if (!options.dataType == "jsonp")
      {
        // Attach handlers for all browsers
        script.onload = script.onreadystatechange = function()
        {
          if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")
          {
            options.callback(true);

            script.onload = script.onreadystatechange = qx.io2.Request.dummyFunction;
            head.removeChild(script);
          }
        };
      }

      // Finally append child
      // This will execute the script content
      // This also leads to the execution of the JSON-P handler
      head.appendChild(script);
    }
  }
});
