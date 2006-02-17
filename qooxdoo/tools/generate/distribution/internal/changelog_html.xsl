<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"  xmlns:cvs2cl="http://www.red-bean.com/xmlns/cvs2cl/">
  <xsl:output method="xml" omit-xml-declaration="no" doctype-public="-//W3C//DTD XHTML 1.1//EN" doctype-system="http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd" indent="no" encoding="iso-8859-15"/>
  <xsl:template match="/cvs2cl:changelog">
    <html>
      <head>
        <title>qooxdoo ChangeLog</title>
        <link rel="stylesheet" type="text/css" href="http://qooxdoo.oss.schlund.de/misc/screen.css" media="screen,presentation"/>
        <link rel="stylesheet" type="text/css" href="http://qooxdoo.oss.schlund.de/misc/print.css" media="print"/>
        <style type="text/css">
#content{
  width: 700px !important;
}

.filelist{
  font-size: 10px !important;;
  font-familiy: "Bitstream Vera Sans Mono", "Courier New", monospace !important;;
  margin-top: 0 !important;
  margin-bottom: 20px !important;;
  margin-left: 25px !important;;
  color: #333 !important;;
}
        </style>
      </head>
      <body>
        <div id="frame">
          <div id="head">
            <h1 style="display:none">qooxdoo</h1>
            <h2 style="display:none">the new era of javascript interface development</h2>

            <div id="headlogo">
              <img src="http://qooxdoo.oss.schlund.de/images/14.gif" height="81" width="288" alt="the new era of web interface development"    />
            </div>

            <div id="headimage">
              <img src="http://qooxdoo.oss.schlund.de/images/1.png" height="128" width="128" alt="enjoy rich versatile widgets for your web application"    />
            </div>

            <div id="navigation" class="clearfix">
              <ul>
                <li><a href="http://qooxdoo.oss.schlund.de/">Home</a></li>
                <li><a href="http://qooxdoo.oss.schlund.de/counter/refer.php?id=5">Demo</a></li>
                <li><a href="http://qooxdoo.oss.schlund.de/2005/07/14/faq">FAQ</a></li>
                <li><a href="http://qooxdoo.oss.schlund.de/section/documentation">Documentation</a></li>
                <li><a href="http://qooxdoo.oss.schlund.de/section/community">Community</a></li>
                <li><a href="http://qooxdoo.oss.schlund.de/section/download">Download</a></li>
                <li><a href="http://qooxdoo.oss.schlund.de/counter/refer.php?id=7">Project</a></li>
              </ul>
            </div>
          </div>
          <div id="banner">
            <h2>&#160;</h2>
            <br style="clear:both"/>
          </div>
          <div id="content" class="article">
            <h2>ChangeLog</h2>
            <ul class="articlelist">
              <xsl:for-each select="cvs2cl:entry">
                <li>
                  <h3>
                    <xsl:value-of select="concat(cvs2cl:date, ' - ', cvs2cl:author)"/>
                  </h3>
                  <p><xsl:value-of select="cvs2cl:msg"/></p>
                  <ul class="filelist">
                    <xsl:for-each select="cvs2cl:file">
                      <li>
                        <xsl:value-of select="cvs2cl:name"/>
                      </li>
                    </xsl:for-each>
                  </ul>
                </li>
              </xsl:for-each>
            </ul>
          </div>
          <br style="clear:both"/>
          <div id="footer">
            <p class="designedby">Designed by Sebastian Werner | <a href="http://www.validome.org/get/http://qooxdoo.oss.schlund.de/">XHTML 1.1</a> | <a href="http://jigsaw.w3.org/css-validator/check/referer?warning=no&#38;profile=css2">CSS 2</a> | <a href="http://www.textpattern.com/">Textpattern 4</a></p>
            <p class="copyright"><a href="/section/imprint">Imprint</a> | Copyright 2005 <a href="http://www.schlund.de">Schlund+Partner AG</a></p>
            <br style="clear:both"/>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
