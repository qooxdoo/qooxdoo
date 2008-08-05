#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2008 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Fabian Jakobs (fjakobs)
#    * Sebastian Werner (swerner)
#
################################################################################

from elementtree import ElementTree

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
    	for monthWidth in monthContext.findall("monthWidth"):
    		monthType = monthWidth.attrib["type"]
    		for month in monthWidth.findall("month"):
    			if month.attrib.has_key("alt"): continue
    			data["cldr_month_%s_%s" % (monthType, month.attrib["type"])] = month.text
    return data


def extractDay(calendarElement):
    data = {}
    for dayWidth in calendarElement.findall(".//dayWidth"):
    	dayType = dayWidth.attrib["type"]
    	for day in dayWidth.findall("day"):
    		if day.attrib.has_key("alt"): continue
    		data['cldr_day_%s_%s' % (dayType, day.attrib["type"])] = day.text
    return data


def extractQuarter(calendarElement):
    return {'': ''}


def extractAmPm(calendarElement):
    data = {}

    amNode = calendarElement.find(".//am")
    if amNode != None:
    	data['cldr_am'] = amNode.text

    pmNode = calendarElement.find(".//pm")
    if pmNode != None:
    	data["cldr_pm"] = pmNode.text

    return data


def extractDateFormat(calendarElement):
    data = {}
    for dateFormatLength in calendarElement.findall(".//dateFormatLength"):
    	dateType = dateFormatLength.attrib["type"]
    	for dateFormat in dateFormatLength.findall("dateFormat/pattern"):
    		if dateFormat.attrib.has_key("alt"): continue
    		data['cldr_date_format_%s'% dateType] = dateFormat.text
    return data


def extractTimeFormat(calendarElement):
    data = {}
    for timeFormatLength in calendarElement.findall(".//timeFormatLength"):
    	timeType = timeFormatLength.attrib["type"]
    	for timeFormat in timeFormatLength.findall("timeFormat/pattern"):
    		if timeFormat.attrib.has_key("alt"): continue
    		data['cldr_time_format_%s' % timeType] = timeFormat.text
    return data


def extractDateTimeFormat(calendarElement):
    data = {}
    for dateTimeFormat in calendarElement.findall(".//dateFormatItem"):
    	data["cldr_date_time_format_%s" % dateTimeFormat.attrib["id"]] = dateTimeFormat.text
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

    decimalSeparatorNode = tree.find("numbers/symbols/decimal")
    if decimalSeparatorNode != None:
    	data['cldr_number_decimal_separator'] = decimalSeparatorNode.text

    groupSeparator = ","
    groupSeparatorNode = tree.find("numbers/symbols/group")
    if groupSeparatorNode != None:
    	data['cldr_number_group_separator'] = groupSeparatorNode.text

    percentFormatNode = tree.find("numbers/percentFormats/percentFormatLength/percentFormat/pattern")
    if percentFormatNode != None:
    	data['cldr_number_percent_format'] = percentFormatNode.text

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
    	data.update(extractAmPm(cal))
    	data.update(extractDateFormat(cal))
    	data.update(extractTimeFormat(cal))
    	data.update(extractDateTimeFormat(cal))
    	data.update(extractFields(cal))

    data.update(extractDelimiter(tree))
    data.update(extractNumber(tree))

    return data
    
