qx.Class.define("testapp.Warnings1", {
  extend: qx.core.Object,
  
  construct(options) {
    this.base(arguments);
    
    let proxyOpts = {
        proxyReqPathResolver(req) {
          console.log(`proxyReqPathResolver: ${req.originalUrl}`);
          return req.originalUrl;
        },
        proxyReqOptDecorator(proxyReqOpts, srcReq) {
          let cookies = srcReq.cookieJarStore && srcReq.cookieJarStore.getAllCookiesSync() || null;
          if (cookies) {
            cookies = cookies.map(cookie => cookie.toString());
            let arr = proxyReqOpts.headers["Set-Cookie"];
            if (!arr)
              arr = proxyReqOpts.headers["Set-Cookie"] = [];
            qx.lang.Array.append(arr, cookies);
          }
          console.log(`proxyReqOptDecorator: ${JSON.stringify(proxyReqOpts)}`);
          return proxyReqOpts;
        }
      };
  }
});
