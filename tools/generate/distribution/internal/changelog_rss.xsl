<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"

  xmlns:x="http://www.w3.org/1999/xhtml"
  xmlns:cl="http://www.red-bean.com/xmlns/cvs2cl/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"

  exclude-result-prefixes="cl"
  >

<xsl:output indent="yes" />

<!-- Filter for cvs2cl's XML output -->

<xsl:template match="/">
 <rss version='2.0'>
  <channel>
   <title>CVS Changelog</title>
   <description>CVS Changelog Items</description>

   <xsl:apply-templates select="cl:changelog/cl:entry" />
  </channel>
 </rss>
</xsl:template>

<xsl:template match="cl:entry">
 <item>
  <title><xsl:value-of select="cl:author"/></title>
  <dc:date><xsl:value-of select="cl:isoDate"/></dc:date>
  <description><xsl:for-each select="cl:file"><xsl:value-of select="cl:name"/><xsl:if test="position()!=last()">, </xsl:if></xsl:for-each>&lt;br>
<xsl:value-of select="cl:msg"/>
  </description>
  <x:body>
   <!-- Choose one of these lines depending on your preferred verbosity -->
   <xsl:apply-templates select="cl:file"/>
   <!-- <x:h4><xsl:for-each select="cl:file"><xsl:value-of select="cl:name"/><xsl:if test="position()!=last()">, </xsl:if></xsl:for-each></x:h4> -->

   <x:p><xsl:value-of select="cl:msg"/></x:p>
  </x:body>
 </item>
</xsl:template>

<xsl:template match="cl:file">
<x:h4><xsl:value-of select="cl:name"/>:
 <xsl:value-of select="cl:revision"/>
 (<xsl:value-of select="cl:cvsstate"/><xsl:apply-templates select="cl:tag"/>)</x:h4>
</xsl:template>

<xsl:template match="cl:tag">; <xsl:value-of select="."/></xsl:template>

</xsl:stylesheet>
