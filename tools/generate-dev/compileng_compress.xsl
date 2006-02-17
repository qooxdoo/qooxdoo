<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.1">

<xsl:output method="text" version="1.0" encoding="iso-8859-1"/>




<!-- ******** CORE ******** -->

<xsl:template match="/">
  <result>
    <xsl:apply-templates/>
  </result>
</xsl:template>

<xsl:template match="text()"/>

<xsl:param name="blockdivider">;
</xsl:param>





<!-- ******** STRUCTURE ******** -->

<xsl:template match="block">
  <xsl:apply-templates/>

  <xsl:if test="parent::casecontent or parent::if or count(following-sibling::*) &gt; 0">
    <xsl:value-of select="$blockdivider"/>
  </xsl:if>
</xsl:template>







<!-- ******** GROUPS ******** -->

<xsl:template match="function">
  <xsl:text>function</xsl:text>

  <xsl:if test="namegroup">
    <xsl:text> </xsl:text>
  </xsl:if>

  <xsl:apply-templates/>
</xsl:template>

<xsl:template match="if">
  <xsl:text>if</xsl:text>

  <xsl:apply-templates/>
</xsl:template>

<xsl:template match="else">
  <xsl:text>else</xsl:text>

  <xsl:if test="child::*[position()=1 and name() != 'commandgroup']">
    <xsl:text> </xsl:text>
  </xsl:if>

  <xsl:apply-templates/>
</xsl:template>

<xsl:template match="space">
  <xsl:text> </xsl:text>
</xsl:template>






<!-- ******** BLOCKS ******** -->

<xsl:template match="commandgroup">
  <xsl:text>{</xsl:text>
  <xsl:apply-templates/>
  <xsl:text>}</xsl:text>

  <xsl:choose>
    <xsl:when test="preceding-sibling::*[position()=1 and name() = 'protected' and @detail = 'DO'] and following-sibling::*[position()=1 and name() = 'protected' and @detail = 'WHILE']">
      <!-- PASS: Do-While -->
    </xsl:when>
    <xsl:when test="following-sibling::*[position()=1 and name() != 'token' and not(name() = 'else' or @detail = 'CATCH' or @detail = 'FINALLY')]">
      <xsl:value-of select="$blockdivider"/>
    </xsl:when>
  </xsl:choose>
</xsl:template>

<xsl:template match="argumentgroup">
  <xsl:text>(</xsl:text>
  <xsl:apply-templates/>
  <xsl:text>)</xsl:text>

  <xsl:choose>
    <xsl:when test="preceding-sibling::*[position()=1 and (name() = 'if' or (name() = 'protected' and @detail = 'WHILE'))]">

    </xsl:when>
    <xsl:otherwise>
      <xsl:if test="following-sibling::*[position()=1 and (name() = 'namegroup' or (name() = 'protected' and not(@detail = 'IN' or @detail = 'INSTANCEOF' or @detail = 'TYPEOF')))]">
        <xsl:value-of select="$blockdivider"/>
      </xsl:if>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="accessgroup">
  <xsl:text>[</xsl:text>
  <xsl:apply-templates/>
  <xsl:text>]</xsl:text>

  <xsl:if test="count(following-sibling::*) &gt; 0 and following-sibling::*[position()=1 and ((name() = 'protected' and not(@detail = 'IN' or @detail = 'INSTANCEOF' or @detail = 'TYPEOF')) or name() = 'namegroup' or name() = 'builtin')]">
    <xsl:value-of select="$blockdivider"/>
  </xsl:if>
</xsl:template>







<!-- ******** CONTENT ******** -->

<xsl:template match="namegroup">
  <xsl:for-each select="*">
    <xsl:value-of select="text()"/>
    <xsl:if test="position()!=last()">.</xsl:if>
  </xsl:for-each>

  <xsl:if test="count(following-sibling::*) &gt; 0">
    <xsl:choose>
      <xsl:when test="following-sibling::*[position()=1 and name() = 'protected' and (@detail = 'IN' or @detail = 'INSTANCEOF')]">
        <xsl:text> </xsl:text>
      </xsl:when>
      <xsl:when test="following-sibling::*[position()=1 and (name() = 'protected' or name() = 'namegroup' or name() = 'builtin')]">
        <xsl:value-of select="$blockdivider"/>
      </xsl:when>
    </xsl:choose>
  </xsl:if>
</xsl:template>

<xsl:template match="command">
  <xsl:value-of select="concat(text(), ' ')"/>
</xsl:template>

<xsl:template match="protected">
  <xsl:value-of select="text()"/>

  <xsl:choose>
    <xsl:when test="following-sibling::*[position()=1 and (name() = 'if' or (name() = 'protected' and @detail = 'RETURN'))]">
      <xsl:value-of select="$blockdivider"/>
    </xsl:when>
    <xsl:when test="following-sibling::*[position()=1 and name() = 'protected' and (@detail = 'CASE' or @detail = 'DEFAULT')]">
      <xsl:value-of select="$blockdivider"/>
    </xsl:when>
    <xsl:when test="following-sibling::*[position()=1 and name() = 'token']">
      <!-- PASS -->
    </xsl:when>
    <xsl:when test="(@detail = 'DELETE' or @detail = 'FUNCTION' or @detail = 'RETURN' or @detail = 'VAR' or @detail = 'IN' or @detail = 'INSTANCEOF' or @detail = 'TYPEOF' or @detail = 'THROW' or @detail = 'NEW' or @detail = 'CASE') and following-sibling::*[position()=1 and (name() = 'namegroup' or name() = 'function' or (name() = 'protected' and @detail != 'FUNCTION' and @detail != 'VAR') or name() = 'string' or name() = 'number' or name() = 'boolean' or name() = 'regexp' or name() = 'token')]">
      <xsl:text> </xsl:text>
    </xsl:when>
    <xsl:when test="following-sibling::*[position()=1 and (name() = 'namegroup' or name() = 'protected' or name() = 'string' or name() = 'number' or name() = 'boolean' or name() = 'regexp' or name() = 'token')]">
      <xsl:value-of select="$blockdivider"/>
    </xsl:when>
  </xsl:choose>
</xsl:template>

<xsl:template match="token">
  <xsl:value-of select="text()"/>

  <xsl:choose>
    <xsl:when test="@detail = 'INC' or @detail = 'DEC'">
      <xsl:if test="preceding-sibling::*[position()=1 and (name() = 'namegroup' or name() = 'number')] and count(following-sibling::*) &gt; 0 and not(following-sibling::*[position()=1 and name() = 'token' and @detail = 'COMMA'])">
        <xsl:value-of select="$blockdivider"/>
      </xsl:if>
    </xsl:when>

    <xsl:when test="following-sibling::*[position()=1 and (name() = 'if' or (name() = 'protected' and (@detail = 'WHILE' or @detail = 'DO' or @detail = 'DELETE')))]">
      <xsl:value-of select="$blockdivider"/>
    </xsl:when>
  </xsl:choose>
</xsl:template>







<!-- ******** TYPES ******** -->

<xsl:template match="number|regexp|boolean|name|builtin">
  <xsl:value-of select="text()"/>

  <xsl:if test="count(following-sibling::*) &gt; 0 and following-sibling::*[position()=1 and (name() = 'protected' or name() = 'namegroup' or name() = 'builtin')]">
    <xsl:value-of select="$blockdivider"/>
  </xsl:if>
</xsl:template>

<xsl:template match="string">
  <xsl:variable name="quote">
    <xsl:choose>
      <xsl:when test="@detail = 'doublequotes'">"</xsl:when>
      <xsl:when test="@detail = 'singlequotes'">'</xsl:when>
    </xsl:choose>
  </xsl:variable>

  <xsl:value-of select="concat($quote, text(), $quote)"/>

  <xsl:if test="count(following-sibling::*) &gt; 0 and following-sibling::*[position()=1 and (name() = 'protected' or name() = 'namegroup' or name() = 'builtin')]">
    <xsl:value-of select="$blockdivider"/>
  </xsl:if>
</xsl:template>

</xsl:stylesheet>