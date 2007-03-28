<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:output omit-xml-declaration="yes"/>
	
    <xsl:template match="doctree">
		<xsl:call-template name="map"/>
	</xsl:template>
	
	<xsl:template name="map">
		<xsl:param name="Indent"/>
		<xsl:if test="not(name()='text')">  <!-- skip text nodes, see further -->
			<xsl:text>&#xa;</xsl:text>
			<xsl:value-of select="$Indent"/>
			<xsl:text>{type:"</xsl:text>
			<xsl:value-of select="name()"/>
			<xsl:text>",attributes:{</xsl:text>
			<xsl:call-template name="attribs"/>
			<xsl:if test="name()='desc'">  <!-- lift <text> child into attribute -->
				<xsl:text>"text":"</xsl:text>
				<xsl:value-of select="text"/>
				<xsl:text>"</xsl:text>
			</xsl:if>
			<xsl:text>},children:[</xsl:text>
			<xsl:for-each select="child::*">
				<xsl:call-template name="map">
					<xsl:with-param name="Indent" select="concat($Indent,'  ')"/>
				</xsl:call-template>
				<xsl:if test="not(last()=position())">
					<xsl:text>,</xsl:text>
				</xsl:if>
			</xsl:for-each>
			<xsl:text>&#xa;</xsl:text>
			<xsl:value-of select="$Indent"/>
			<xsl:text>]}</xsl:text>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="attribs">
		<xsl:for-each select="./attribute::*">
			<xsl:text>"</xsl:text>
			<xsl:value-of select="name()"/>
			<xsl:text>":"</xsl:text>
			<xsl:value-of select="."/>
			<xsl:text>"</xsl:text>
			<xsl:if test="not(last()=position())">
  			  <xsl:text>,</xsl:text>
			</xsl:if>
		</xsl:for-each>
	</xsl:template>
    
  
</xsl:stylesheet>
