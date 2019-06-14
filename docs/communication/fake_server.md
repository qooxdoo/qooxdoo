FakeServer
==========

qx.dev.FakeServer provides a simple way to define a mock HTTP server in the browser. This can be used to test and develop applications that communicate with an HTTP backend even if the actual service is unavailable. It is based on the excellent [Sinon.JS](http://sinonjs.org/) mocking library, in particular its FakeXMLHttpRequest interface which wraps the browser's XHR implementation, and is thus completely transparent: No modifications to the client code are required.

Configuration
-------------

FakeServer is configured by defining responses to HTTP method/request URL pairs. Only matching requests will receive a mock response, other requests will be processed by the browser as usual. Here is an example configuration that defines mock responses for two different requests:

    var responseData = [
      {
        method: "GET",
        url: /\/api\/resource\/\d+/,
        response : function(request) {
          var status = 200;
          var headers = { "Content-Type": "application/json" };
          var responseData = {
            description: "Mock REST response for resource " + request.url
          };
          var body = qx.lang.Json.stringify(responseData);
          request.respond(status, headers, body);
        }
      },
      {
        method: "GET",
        url: "/users/{userId}",
        response: [
          200,
          { "Content-Type": "application/json" },
          qx.lang.Json.stringify({userId: 'someUser'})
        ]
      }
    ];

### URL matching

The value of the url key can be either a regular expression or a string. If a URL string contains placeholders in curly brackets (a common pattern in REST client applications using qx.io.rest.Resource), they will be treated as wildcards.

### Responses

Sinon's FakeServer accepts three types of responses:

> -   If the value of response is a string, it will be sent as the response body. The status code will be 200 and no response headers will be configured.
> -   The response can also be an array containing the status code, a map of response headers, and the response body text, e.g. [200, { "Content-Type":
>     "text/html", "Content-Length": 2 }, "OK"]
> -   If the response value is a function, it will be called with a [FakeXMLHttpRequest](http://sinonjs.org/docs/#FakeXMLHttpRequest) object as the only argument. Its [respond](http://sinonjs.org/docs/#respond) method can be used to send a response.

Usage
-----

It's a good idea to create separate classes to hold the FakeServer configuration, for example one mock class per REST resource class. By loading these classes only if a custom environment setting is active, it's easy to ensure the mock backend is never included in the deployment version of the application. Here is an example:

    qx.Class.define("myapp.mock.User", {
      statics : {
        mockData :
        [
          {
            method: "GET",
            url: "/users/{userId}",
            response: [
              200,
              { "Content-Type": "application/json" },
              qx.lang.Json.stringify({userName: 'FakeUser'})
            ]
          }
        ]
      },

      defer : function(statics) {
        qx.dev.FakeServer.getInstance().configure(statics.mockData);
      }
    });

By calling FakeServer's configure method in the class' defer block, we make sure that the mock backend is ready as soon as the class is loaded. In the application, we only need to add a dependency:

    if (qx.core.Environment.get("myapp.mockBackend")) {
      myapp.mock.User;
    }
