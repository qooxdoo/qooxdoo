"""JSON Date support

Functions for converting JSON Dates in the format
'new Date(Date.UTC(year,month[,day[,hour[,minute[,seconds[,milliseconds]]]]]))'
from and to Python date/datetime objects.

Full timezone support.

Version:     1.4
Author:      Danny W. Adair <danny@adair.net>
Last Change: 04 July 2006
"""

import datetime
import time

STDOFFSET = datetime.timedelta(seconds=-time.timezone)
DSTOFFSET = time.daylight and datetime.timedelta(seconds=-time.altzone) or STDOFFSET
DSTDIFF = DSTOFFSET - STDOFFSET


class LocalTimezone(datetime.tzinfo):
    """A class capturing the platform's idea of local time."""
    def utcoffset(self, dt):
        return self._isdst(dt) and DSTOFFSET or STDOFFSET
    def dst(self, dt):
        return self._isdst(dt) and DSTDIFF or datetime.timedelta(0)
    def tzname(self, dt):
        return time.tzname[self._isdst(dt)]
    def _isdst(self, dt):
        tt = (dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second, dt.weekday(), 0, -1)
        stamp = time.mktime(tt)
        tt = time.localtime(stamp)
        return tt.tm_isdst > 0
    def __repr__(self):
        """Show local timezone name and current offset from UTC."""
        local_now = datetime.datetime.now(self)
        local_tz_name = self.tzname(local_now)
        local_tz_utcoffset = str(local_now)[-6:]
        return '%s(UTC%s)' % (local_tz_name, local_tz_utcoffset)
local_timezone = LocalTimezone()


class UTC(datetime.tzinfo):
    """UTC time zone class."""
    def utcoffset(self, dt):
        return datetime.timedelta(0)
    def tzname(self, dt):
        return 'UTC'
    def dst(self, dt):
        return datetime.timedelta(0)
    def __repr__(self):
        return 'UTC'
utc = UTC()


class JsonDateError(Exception):
    """Exception for JSON conversion errors."""
    pass


def datetime2json(dt):
    """Convert the given date/datetime to a JSON string in UTC.
    
    If dt is a timezone-aware datetime object it will be converted to UTC first.
    If dt is a naive datetime object it will be assumed to be UTC.
    If dt is a date object it will be assumed to be midnight UTC.
    
    The returned JSON string will be in the format
    'new Date(Date.UTC(year,month,day,hour,minute,seconds,milliseconds))'
    if dt is a datetime object or
    'new Date(Date.UTC(year,month,day))'
    if dt is a date object.
    It can be directly evaluated in JavaScript (Note that month starts at 0).
    """
    if isinstance(dt, datetime.datetime):
        # Apply UTC if datetime is naive, otherwise convert to UTC
        dt = (dt.tzinfo is None) and dt.replace(tzinfo = utc) or dt.astimezone(utc)
        # Truncate (not round) to milliseconds
        milliseconds = dt.microsecond / 1000
        return 'new Date(Date.UTC(%i,%i,%i,%i,%i,%i,%i))' % (dt.year, dt.month - 1,
                                                             dt.day, dt.hour,
                                                             dt.minute, dt.second,
                                                             milliseconds)
    elif isinstance(dt, datetime.date):
        return 'new Date(Date.UTC(%i,%i,%i))' % (dt.year, dt.month - 1, dt.day)
    else:
        raise JsonDateError, 'datetime2json() argument must be a datetime or a date'


def json2datetime(json_dt, timezone = utc, date_only = False):
    """Convert a json date string to a corresponding datetime or date object.
    
    json_dt is expected to be in the format
    'new Date(Date.UTC(year,month[,day[,hour[,minute[,seconds[,milliseconds]]]]]))'
    (month starts at 0, the optional day defaults to 1, the optional time
    components default to 0)
    or
    'null'
    
    A JsonDateError exception is raised if it isn't.
    Empty strings also raise this exception; use JavaScript's 'null' to indicate
    no date. 'null' will return None.
    
    The json datetime string must start with 'new Date(Date.UTC(' and must end
    in '))' but may contain spaces before or after the enclosed date components.
    
    timezone can be a tzinfo object or None. If timezone is a tzinfo object, the
    datetime object will be converted from UTC to the specified timezone.
    If timezone is None, a naive datetime object will be returned.
    
    If date_only is True, a date object will be returned instead of a datetime
    object. Note that timezone conversions are still applied.
    If date_only is False, a datetime object will be returned, even if the
    JSON string did not contain any time components.
    """
    if not json_dt:
        raise JsonDateError, "Empty date - use 'null' to indicate no date"
    elif json_dt=='null':
        return None
    
    try:
        assert json_dt.startswith('new Date(Date.UTC(') and json_dt.endswith('))')
    except AssertionError:
        raise JsonDateError, 'Invalid date format'
    
    # Parse JSON string
    try:
        parts = [int(part) for part in json_dt[18:-2].split(',')]
        num_parts = len(parts)
    except (IndexError, ValueError):
        raise JsonDateError, 'Invalid date format'
    if num_parts < 2:
        raise JsonDateError, 'Not enough arguments'
    elif num_parts > 7:
        raise JsonDateError, 'Too many arguments'
    
    # datetime constructor will expect month starting at 1, not 0
    parts[1] += 1
    
    if num_parts == 2:
        # datetime constructor will need a day
        parts.append(1)
    elif num_parts == 7:
        # datetime constructor will take microseconds, not milliseconds
        parts[6] *= 1000
    
    # Construct a timezone-aware UTC datetime
    try:
        # The specified date could be invalid (29 Feb in non-leap year etc.)
        dt = datetime.datetime(tzinfo=utc, *parts)
    except ValueError, msg:
        raise JsonDateError, 'Invalid date: %s' % msg
    
    # Convert to specified timezone
    if timezone is None:
        dt = dt.replace(tzinfo = None)
    elif timezone!=utc:
        dt = dt.astimezone(timezone)
    
    return date_only and datetime.date(dt.year, dt.month, dt.day) or dt
