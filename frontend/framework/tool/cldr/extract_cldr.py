#!/usr/bin/env python
# encoding: utf-8
"""
extract_cldr.py

Created by Fabian Jakobs on 2006-12-12.
Copyright (c) 2006 1&1 Internet AG. All rights reserved.
"""

import os
import sys
import getopt
import ElementTree

help_message = '''
The help message goes here.
'''


class Usage(Exception):
    def __init__(self, msg):
        self.msg = msg


def getJavaScript(data, locale, language, territory="", namespace="qx.locale.data"):
	str = "/*\n"
	if territory != "":
		str += "#load(%s.%s)\n" % (namespace, language)
	str += '''#require(qx.Locale)
*/
qx.Locale.define("%s.%s", {
/*
  locale: "%s",
  data: {
*/
''' % (namespace, locale, locale)
	lines = []
	keys = data.keys()
	keys.sort()
	for key in keys:
		lines.append('    cldr_%s: "%s"' % (key.replace("-", "_"), data[key].encode("UTF-8").replace("\n", "\n" + 6 * " ").replace('"', '\\"')) )
		
	body = ",\n".join(lines)
	str += "%s\n  /*}*/\n});" % body
	return str
	

def getLocale(calendarElement):
	locale = calendarElement.find("identity/language").attrib["type"]
	territoryNode = calendarElement.find("identity/territory")
	territory = ""
	if territoryNode != None:
		territory = territoryNode.attrib["type"]
	return (locale, territory)
	

def extractMonth(calendarElement):
	data = {}
	for monthContext in calendarElement.findall(".//monthContext"):
		#context = monthContext.attrib["type"]
		for monthWidth in monthContext.findall("monthWidth"):
			monthType = monthWidth.attrib["type"]
			#monthList = []
			for month in monthWidth.findall("month"):
				if month.attrib.has_key("alt"): continue
				#monthList.append(month.text)
				data["month_%s_%s" % (monthType, month.attrib["type"])] = month.text
			#data["month_%s_%s" % (context, monthType)] = '["%s"]' % ""'", "'.join(monthList)
	return data


def extractDay(calendarElement):
	data = {}
	for dayWidth in calendarElement.findall(".//dayWidth"):
		dayType = dayWidth.attrib["type"]
		#dayList = []
		for day in dayWidth.findall("day"):
			if day.attrib.has_key("alt"): continue
			#dayList.append(day.text)
			data['day_%s_%s' % (dayType, day.attrib["type"])] = day.text
		#data['day_%s' % (dayType)] = '["%s"]' % ""'", "'.join(dayList)
	return data
	
def extractQuarter(calendarElement):
	#print "/* TODO no quarter extraction yet */"
	return {'': ''}

	
def extractAmPm(calendarElement):
	data = {}

	amNode = calendarElement.find(".//am")
	if amNode != None:
		data['am'] = amNode.text
		
	pmNode = calendarElement.find(".//pm")
	if pmNode != None:
		data["pm"] = pmNode.text

	return data

	
def extractDateFormat(calendarElement):
	data = {}
	for dateFormatLength in calendarElement.findall(".//dateFormatLength"):
		dateType = dateFormatLength.attrib["type"]
		for dateFormat in dateFormatLength.findall("dateFormat/pattern"):
			if dateFormat.attrib.has_key("alt"): continue
			data['date_format_%s'% dateType] = dateFormat.text
	return data


def extractTimeFormat(calendarElement):
	data = {}
	for timeFormatLength in calendarElement.findall(".//timeFormatLength"):
		timeType = timeFormatLength.attrib["type"]
		for timeFormat in timeFormatLength.findall("timeFormat/pattern"):
			if timeFormat.attrib.has_key("alt"): continue
			data['time_format_%s' % timeType] = timeFormat.text
	return data

		
def extractDateTimeFormat(calendarElement):
	#formatList = []
	data = {}
	for dateTimeFormat in calendarElement.findall(".//dateFormatItem"):
		#formatList.append('"%s": "%s"' % (dateTimeFormat.attrib["id"], dateTimeFormat.text))
		data["date_time_format_%s" % dateTimeFormat.attrib["id"]] = dateTimeFormat.text
	#return {'dateTimeFormats' : '{\n%s\n}' % (',\n'.join(formatList)) }
	return data

	
def extractFields(calendarElement):
	fields = {}
	for field in calendarElement.findall(".//fields/field"):
		if not field.find("displayName"): break
		fields[field.attrib["type"]] = field.find("displayName").text
		
	return fields
	

def extractDelimiter(tree):
	delimiters = {}
	for delimiter in tree.findall("delimiters/*"):
		delimiters[delimiter.tag] = delimiter.text
	
	return delimiters

		
def extractNumber(tree):
	data = {}
	
	decimalSeperatorNode = tree.find("numbers/symbols/decimal")
	if decimalSeperatorNode != None:
		data['number_decimal_seperator'] = decimalSeperatorNode.text
	
	groupSeperator = ","
	groupSeperatorNode = tree.find("numbers/symbols/group")
	if groupSeperatorNode != None:
		data['number_group_seperator'] = groupSeperatorNode.text
	
	percentFormatNode = tree.find("numbers/percentFormats/percentFormatLength/percentFormat/pattern")
	if percentFormatNode != None:
		data['number_percent_format'] = percentFormatNode.text

	return data

	
def parseCldrFile(filename, outputDirectory=None):
	tree = ElementTree.parse(filename)
	
	language, territory = getLocale(tree)
	data = {}
	
	for cal in tree.findall('dates/calendars/calendar'):
		if not cal.attrib.has_key("type"): continue
		if cal.attrib["type"] != "gregorian": continue
		data.update(extractMonth(cal))
		data.update(extractDay(cal))
		#data.update(extractQuarter(cal))
		data.update(extractAmPm(cal))
		data.update(extractDateFormat(cal))
		data.update(extractTimeFormat(cal))
		data.update(extractDateTimeFormat(cal))
		data.update(extractFields(cal))
		
	data.update(extractDelimiter(tree))
	data.update(extractNumber(tree))

	locale = language
	if territory != "":
		locale += "_" + territory

	code = getJavaScript(data, locale, language, territory)
	#print code
	if outputDirectory != None:
		outfile = os.path.join(outputDirectory, locale + ".js");
		# print "writing %s ..." % outfile
		open(outfile, "w").write(code)
	else:
		print code


def main(argv=None):
    if argv is None:
        argv = sys.argv
    try:
        try:
            opts, args = getopt.getopt(argv[1:], "ho:v", ["help", "output="])
        except getopt.error, msg:
            raise Usage(msg)
    
        # option processing
        output = None
        for option, value in opts:
            if option == "-v":
                verbose = True
            if option in ("-h", "--help"):
                raise Usage(help_message)
            if option in ("-o", "--output"):
                output = value
			
        for arg in args:
            parseCldrFile(arg, output)
    
    except Usage, err:
        print >> sys.stderr, sys.argv[0].split("/")[-1] + ": " + str(err.msg)
        print >> sys.stderr, "\t for help use --help"
        return 2


if __name__ == "__main__":
    sys.exit(main())
