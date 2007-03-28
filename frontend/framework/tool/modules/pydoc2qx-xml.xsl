<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<!--
  <xsl:output method="text"/>
-->

  <xsl:template match="module">
	<xsl:variable name="packName" select="@name"/>
    <xsl:element name="doctree">
      <xsl:attribute name="hasWarning">true</xsl:attribute>
      <xsl:element name="packages">
        <xsl:element name="package">
			<xsl:call-template name="package">
				<xsl:with-param name="packName" select="$packName"/>
			</xsl:call-template>
        </xsl:element>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template name="package">
	  <xsl:param name="packName"/>
      <xsl:attribute name="packageName"><xsl:value-of select="$packName"/></xsl:attribute>
      <xsl:attribute name="fullName"><xsl:value-of select="$packName"/></xsl:attribute>
      <xsl:attribute name="name"><xsl:value-of select="$packName"/></xsl:attribute>
	  <xsl:apply-templates select="infoX"/> <!-- avoid descriptions curr. -->
	  <xsl:element name="classes">
		<xsl:apply-templates select="class">
			<xsl:with-param name="packName" select="$packName"/>
		</xsl:apply-templates>
		<!-- Put top-level functions in a pseudo class -->
		<xsl:element name="class">
		  <xsl:attribute name="packageName"><xsl:value-of select="$packName"/></xsl:attribute>
		  <xsl:attribute name="fullName"><xsl:value-of select="concat($packName,'._Module_Functions_')"/></xsl:attribute>
		  <xsl:attribute name="name">_Module_Functions_</xsl:attribute>
		  <xsl:element name="methods">
			<xsl:apply-templates select="function"/>
		  </xsl:element>
		</xsl:element>
	  </xsl:element>
	  <!-- Here is were functions should go
	  <xsl:element name="functions">
		<xsl:apply-templates select="function"/>
	  </xsl:element>
	  -->
  </xsl:template>

  <xsl:template match="info1">
    <xsl:element name="description">
      <xsl:value-of select="summary"/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="class">
	<xsl:param name="packName"/>
    <xsl:element name="class">
      <xsl:attribute name="packageName"><xsl:value-of select="$packName"/></xsl:attribute>
      <xsl:attribute name="fullName"><xsl:value-of select="@name"/></xsl:attribute>
      <xsl:attribute name="name"><xsl:value-of select="substring-after(@name,'.')"/></xsl:attribute>
      <!--
      <xsl:element name="constructor">
      </xsl:element>
      <xsl:element name="properties">
      </xsl:element>
      -->
      <xsl:element name="methods">
        <xsl:apply-templates select="method"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="function">
    <xsl:call-template name="method"/>
  </xsl:template>

  <xsl:template name="method" match="method">
    <xsl:element name="method">
      <xsl:attribute name="hasError">true</xsl:attribute>
      <xsl:attribute name="fullname"><xsl:value-of select="@name"/></xsl:attribute>
      <xsl:attribute name="name"><xsl:value-of select="info/name"/></xsl:attribute>
      <xsl:element name="desc">
        <xsl:element name="text"><xsl:value-of select="info/description"/></xsl:element>
      </xsl:element>
      <xsl:element name="params">
        <xsl:apply-templates select="info/param"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="info/param">
    <xsl:element name="param">
      <xsl:attribute name="name"><xsl:value-of select="@name"/></xsl:attribute>
      <xsl:element name="desc">
        <xsl:element name="text"><xsl:value-of select="."/></xsl:element>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  
</xsl:stylesheet>
