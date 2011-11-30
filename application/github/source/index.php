<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
</head>
<body>

<?php
  # Must set $CLIENT_ID and $CLIENT_SECRET
  include("/home/qooxdoo/div/qx-gists.conf.php");

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
      echo "<script>GITHUB=".$buffer.";</script>";
    }
  }
?>

<script>
  (function() {
    if (typeof GITHUB == "undefined" || GITHUB.error) {
      var redirectUri = window.location.origin + window.location.pathname;
      var authorizeUri = "https://github.com/login/oauth/authorize?client_id=ec109aae020b6657af81&redirect_uri=" + redirectUri;
      window.location = authorizeUri;
    }
  })();
</script>

<script type="text/javascript" src="script/github.js"></script>

</body>
</html>
