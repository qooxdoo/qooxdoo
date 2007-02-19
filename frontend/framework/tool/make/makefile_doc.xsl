<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<!--
	<xsl:output method="text"/>
-->

	<xsl:template match="mak">
	  <xsl:apply-templates select="part"/>
	</xsl:template>

	<xsl:template match="part">
	  <xsl:text>=====</xsl:text>
	  <xsl:value-of select="title"/> 
	  <xsl:text> =====&#xa;&#xa;</xsl:text>
      <xsl:apply-templates select="section"/>
	  <xsl:apply-templates select="incl"/>
	</xsl:template>

	<xsl:template match="section">
		  <xsl:apply-templates select="var"/>
    	  <xsl:element name="note">
			  <xsl:value-of select="descr"/>
    	  </xsl:element>
		  <xsl:text>&#xa;&#xa;</xsl:text>
	</xsl:template>

	<xsl:template match="var">
		  <xsl:text>==== </xsl:text>
		  <xsl:value-of select="name"/> 
		  <xsl:text> ====&#xa;&#xa;</xsl:text>
		  <!-- xsl:value-of select="name"/ --> 
    	  <xsl:text>default:     ''</xsl:text>
		  <xsl:value-of select="default"/> 
    	  <xsl:text>''&#xa;&#xa;</xsl:text>
	</xsl:template>
	
	<xsl:template match="incl">
		<xsl:value-of select="."/>
	    <xsl:text>&#xa;</xsl:text>
	</xsl:template>

	
</xsl:stylesheet>
