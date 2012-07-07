/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

qx.Class.define("qx.test.bom.client.Device",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testDetectDeviceType : function()
    {
      var mobileUserAgentTests = [
        "Mozilla/5.0 (Linux; U; Android 2.2.1; en-us; Nexus One Build/FRG83) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
        "Mozilla/5.0 (iPod; U; CPU iPhone OS 2_0_2 like Mac OS X; en-us) AppleWebKit/525.18.1 (KHTML, like Gecko) Version/3.1.1 Mobile/5C1 Safari/525.20"
      ]

      var tabletUserAgentTests = [
        "Mozilla/5.0 (Linux; U; Android 3.0; en-us; Xoom Build/HRI39) AppleWebKit/534.13 (KHTML, like Gecko) Version/4.0 Safari/534.13",
        "Mozilla/5.0 (iPad; U; CPU iPhone OS 4_3 like Mac OS X; en_us) AppleWebKit/525.18.1 (KHTML, like Gecko )",
        "Mozilla/4.0 (compatible; Linux 2.6.10) NetFront/3.3 Kindle/1.0 (screen 600x800)",
        "Mozilla/5.0 (Linux; U; Android 3.1; en-us; Xoom Build/HMJ37) AppleWebKit/534.13 (KHTML, like Gecko) Version/4.0 Safari/534.13",
        "Mozilla/5.0 (iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7D11"
      ]

      var desktopUserAgentTests = [
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) AppleWebKit/534.51.22 (KHTML, like Gecko) Version/5.1.1 Safari/534.51.22",
        "Mozilla/5.0 (Windows NT 6.2; rv:9.0.1) Gecko/20100101 Firefox/9.0.1",
        "Microsoft Internet Explorer/1.0 (Windows 95)",
        "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.7.5) Gecko/20070321 Netscape/9.0"
      ]


      for (var i = 0; i<mobileUserAgentTests.length; i++){
          this.info("Mobile User Agent Testing:"+mobileUserAgentTests[i]);
          this.assertEquals("mobile",qx.bom.client.Device.detectDeviceType(mobileUserAgentTests[i],"Expected User Agent string to be detected as a mobile device."));
      }

      for (i = 0; i<tabletUserAgentTests.length; i++){
          this.info("Tablet User Agent Testing:"+tabletUserAgentTests[i]);
          this.assertEquals("tablet",qx.bom.client.Device.detectDeviceType(tabletUserAgentTests[i],"Expected User Agent string to be detected as a tablet device."));
      }

      for (i = 0; i<desktopUserAgentTests.length; i++){
          this.info("Desktop User Agent Testing:"+desktopUserAgentTests[i]);
          this.assertEquals("desktop",qx.bom.client.Device.detectDeviceType(desktopUserAgentTests[i],"Expected User Agent string to be detected as a desktop device."));
      }
    }
  }
});