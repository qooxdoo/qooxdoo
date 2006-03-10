<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.1">

<xsl:output method="xml" indent="yes" version="1.0" encoding="iso-8859-1"/>





<!-- ******** CORE ******** -->

<xsl:template match="/">
  <result>
    <properties>
      <xsl:apply-templates select="//name[text()='addProperty']"/>
    </properties>
    <functions>
      <xsl:apply-templates select="//function"/>
    </functions>
  </result>
</xsl:template>

<xsl:template match="text()"/>






<!-- ******** UTILITIES ******** -->

<xsl:template name="tolower">
  <xsl:param name="in"/>

  <xsl:value-of select="translate($in, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"/>
</xsl:template>

<xsl:template name="firsttolower">
  <xsl:param name="in"/>

  <xsl:call-template name="tolower">
    <xsl:with-param name="in">
      <xsl:value-of select="substring($in, 1, 1)"/>
    </xsl:with-param>
  </xsl:call-template>

  <xsl:value-of select="substring($in, 2)"/>
</xsl:template>







<!-- ******** PROPERTIES ******** -->

<xsl:template match="name[text()='addProperty']">
  <property>
    <xsl:for-each select="../following-sibling::argumentgroup/commandgroup/block/namegroup[following-sibling::token[position()=1 and @detail='COLON']]">
      <xsl:attribute name="{name/text()}">
        <xsl:choose>
          <xsl:when test="following-sibling::*[position()=2 and name()='namegroup']">
            <xsl:for-each select="following-sibling::*[position()=2 and name()='namegroup']/*">
              <xsl:value-of select="."/>
              <xsl:if test="position()!=last()">.</xsl:if>
            </xsl:for-each>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="following-sibling::*[position()=2]/text()"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:attribute>
    </xsl:for-each>
  </property>
</xsl:template>







<!-- ******** FUNCTIONS ******** -->

<xsl:template match="function">
  <function>
    <xsl:attribute name="modifier">false</xsl:attribute>
    <xsl:attribute name="private">false</xsl:attribute>

    <xsl:variable name="name">
      <xsl:choose>
        <xsl:when test="namegroup">
          <xsl:attribute name="anonymous">false</xsl:attribute>

          <xsl:for-each select="namegroup/*[position()=last()]">
            <xsl:value-of select="text()"/>
          </xsl:for-each>
        </xsl:when>
        <xsl:otherwise>
          <xsl:attribute name="anonymous">true</xsl:attribute>

          <xsl:for-each select="preceding-sibling::namegroup/*[position()=last()]">
            <xsl:value-of select="text()"/>
          </xsl:for-each>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:attribute name="name">
      <xsl:value-of select="$name"/>
    </xsl:attribute>

    <xsl:if test="starts-with($name, '_')">
      <xsl:attribute name="private">true</xsl:attribute>

      <xsl:if test="starts-with($name, '_modify')">
        <xsl:attribute name="modifier">true</xsl:attribute>

        <xsl:attribute name="property">
          <xsl:call-template name="firsttolower">
            <xsl:with-param name="in" select="substring($name, 8)"/>
          </xsl:call-template>
        </xsl:attribute>
      </xsl:if>
    </xsl:if>
  </function>
</xsl:template>

</xsl:stylesheet>