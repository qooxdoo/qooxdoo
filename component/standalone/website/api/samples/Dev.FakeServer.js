addSample("q.dev.fakeServer.configure", {
  javascript: function () {
    /** The following example shows how to configure mock responses for two different requests: */
    var responseData = [
      {
        method: "GET",
        url: /\/api\/resource\/\d+/,
        response: function (request) {
          var status = 200;
          var headers = {"Content-Type": "application/json"};
          var responseData = {
            description: "Mock REST response for resource " + request.url
          };
          var body = JSON.stringify(responseData);
          request.respond(status, headers, body);
        }
      },
      {
        method: "GET",
        url: "/users/{userId}",
        response: [
          200,
          {"Content-Type": "application/json"},
          JSON.stringify({userId: 'someUser'})
        ]
      }
    ];

    q.dev.fakeServer.configure(responseData);
  }
});
