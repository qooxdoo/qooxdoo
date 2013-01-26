<!DOCTYPE html>
<html>
<head>
  <title>qooxdoo REST demo which uses GitHub OAuth and GitHub Gists API</title>
  <meta charset="utf-8">
</head>
<body>

<?php
  /*
    Entry point for REST demo app.

    There are two essential parts:
      - the backend component (this file) which is responsible for the OAuth communication.
      - the frontend component (Github.js) which is responsible for the Gists retrieval.

    For local development some requirements have to be met to make it runnable:

      * as qx core dev:
        - copy the content of the *conf.php file (see below) into this file (API keys) and ignore the include error msg from php
        - use a WPAD PAC file or a Reverse Proxy configuration to proxy the request to "http://demo.qooxdoo.org"
          with your local machine. This has to be done due a same-origin policy enforced by GitHub:

        'redirect_uri' GET param (from GitHub docs):
         "The redirect_uri parameter is optional. If left out, GitHub will redirect users to the callback URL
          configured in the OAuth Application settings. If provided, the redirect URL must match the callback URL’s host"

        See how to get it working:
          http://findproxyforurl.com/example-pac-file/   XOR
          http://the-taylors.org/blog/2012/10/07/using-oauth-to-connect-with-github-using-nodejs/#reverse_proxy

      * as qx userspace dev who want's to accomplish something similar:
         - register your own application at GitHub (https://github.com/settings/applications/new)
         - replace $CLIENT_ID and $CLIENT_SECRET with your own
         - replace the 'redirect_uri' GET param whith your own path and use a WPAD PAC file or
           a Reverse Proxy configuration (see above).

    See also:
      - http://manual.qooxdoo.org/current/pages/communication/rest.html (used in Github.js)
      - http://developer.github.com/v3/oauth/ (used here)
  */

  // provides $CLIENT_ID and $CLIENT_SECRET
  include("/home/qooxdoo/div/qx-gists.conf.php");

  // 2) obtain access token which is then available for github qx app within GITHUB var
  if (isset($_GET['code'])) {
    $code = $_GET["code"];
    $ch=curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://github.com/login/oauth/access_token");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array("Accept: application/json"));
    curl_setopt($ch, CURLOPT_POSTFIELDS, "client_id=".$CLIENT_ID."&client_secret=".$CLIENT_SECRET."&code=".$code);
    $buffer = curl_exec($ch);
    curl_close($ch);
    if (!empty($buffer)) {
      echo "<script>var GITHUB=".$buffer.";</script>";
    }
  }
?>

<script>
  // 1) authorize via 'client_id' as third party app via OAuth against GitHub
  (function() {
    if (typeof GITHUB == "undefined" || GITHUB.error) {
      var redirectUri = "http://demo.qooxdoo.org" + window.location.pathname;
      var authorizeUri = "https://github.com/login/oauth/authorize?client_id=ec109aae020b6657af81&redirect_uri=" + redirectUri;
      window.location = authorizeUri;
    }
  })();
</script>

<!-- 3) github qx app which uses access token from GITHUB var during qx REST API requests using the GitHub Gists API -->
<script type="text/javascript" src="script/github.js"></script>

</body>
</html>
