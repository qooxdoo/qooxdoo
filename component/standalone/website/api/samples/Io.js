addSample("q.io.xhr", function() {
  var getData = function(callback) {
    var xmlhttp = q.io.xhr("/resource", {
      header: {
        'Accept': 'application/json'
      }
    });

    xmlhttp.on('loadend', function(callback, xhr) {
      if (xhr.responseText) {
        // when there is a response, pass it back to the callback function and correct scope
        callback(this, JSON.parse(xhr.responseText));
      }
    }.bind(this, callback));

    // send request now
    xmlhttp.send();
  };

  // calling this function
  getData(function(that, responseData) {
    // handle response
    console.log(responseData);
  });
});
