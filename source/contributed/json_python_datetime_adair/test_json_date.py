"""Tests for JSON Date support

Due to sparse use of assertion checks, these are more demos than tests.

Version:     1.4
Author:      Danny W. Adair <danny@adair.net>
Last Change: 04 July 2006
"""

import datetime
import sys
import time
import traceback

from json_date import utc, local_timezone
from json_date import JsonDateError
from json_date import datetime2json, json2datetime

LABEL_WIDTH = 23

def test():
    starttime = time.time()
    
    print 'Naive datetime <-> JSON'
    print '(UTC is applied to naive datetimes)'
    
    naive_now = datetime.datetime.now()
    print 'Naive now:'.ljust(LABEL_WIDTH), naive_now
    json_naive_now = datetime2json(naive_now)
    print 'JSON UTC:'.ljust(LABEL_WIDTH), json_naive_now
    utc_now = json2datetime(json_naive_now)
    print 'UTC now from JSON:'.ljust(LABEL_WIDTH), utc_now
    json_utc_now = datetime2json(utc_now)
    print 'JSON UTC:'.ljust(LABEL_WIDTH), json_utc_now
    print
    assert json_naive_now == json_utc_now
    
    print 'Local timezone-aware datetime <-> JSON'
    print '(converted from %s to UTC)' % local_timezone
    
    local_now = datetime.datetime.now(local_timezone)
    print 'Local now:'.ljust(LABEL_WIDTH), local_now
    json_local_now = datetime2json(local_now)
    print 'JSON UTC:'.ljust(LABEL_WIDTH), json_local_now
    utc_now = json2datetime(json_local_now)
    print 'UTC now from JSON:'.ljust(LABEL_WIDTH), utc_now
    json_utc_now = datetime2json(utc_now)
    print 'JSON UTC:'.ljust(LABEL_WIDTH), json_utc_now
    print
    assert json_local_now == json_utc_now
    
    print 'Local date <-> JSON'
    
    # Confusing: datetime.date.today() returns a datetime object;
    # construct date object manually
    local_today = datetime.date(local_now.year, local_now.month, local_now.day)
    print 'Local today:'.ljust(LABEL_WIDTH), local_today
    json_local_today = datetime2json(local_today)
    print 'JSON UTC today:', json_local_today
    utc_today = json2datetime(json_local_today,
                              date_only=True)
    print 'UTC today from JSON:'.ljust(LABEL_WIDTH), utc_today
    assert local_today == utc_today
    local_today_from_utc = json2datetime(json_local_today,
                                         timezone=local_timezone,
                                         date_only=True)
    print 'Local today from JSON:'.ljust(LABEL_WIDTH), local_today_from_utc
    print
    
    def test_json(input, **kw):
        print 'Input:'.ljust(12), repr(input)
        if kw:
            print 'Parameters: '.ljust(12), repr(kw)
        print 'Output:'.ljust(12),
        try:
            print repr(json2datetime(input, **kw))
        except:
            exc_class, exc_value, exc_tb = sys.exc_info()
            # Don't be verbose with handled errors
            if exc_class!=JsonDateError:
                traceback.print_tb(exc_tb)
            print '%s: %s' % (exc_class.__name__, exc_value)
        print '-' * 30
    
    print 'Various JSON -> datetime'
    test_json('')
    test_json('null')
    test_json('hum(bug(')
    test_json('new Date(Date.UTC(')
    test_json('new Date(Date.UTC())')
    test_json('new Date(Date.UTC(()))')
    test_json('new Date(Date.UTC(humbug))')
    test_json('new Date(Date.UTC(2006))')
    test_json('new Date(Date.UTC(2006, 6))')
    test_json('new Date(Date.UTC(2006, 6, 20))')
    test_json('new Date(Date.UTC(-2006, 6, 20))')
    test_json('new Date(Date.UTC(2006, 1, 30))')
    test_json('new Date(Date.UTC(2006, 13, 1))')
    test_json('new Date(Date.UTC(2006, 6, 20)))))))')
    test_json('new Date(Date.UTC(2006, 6, x))')
    test_json('new Date(Date.UTC(2006,6,20,13)')
    test_json('new Date(Date.UTC(2006,6,20,13))')
    test_json('new Date(Date.UTC(2006,6,31,13,55,12,123))')
    test_json('new Date( Date.UTC(2006,6,20, 13,55,12,123) )')
    test_json('new Date(Date.UTC(2006,6,20, 13,55,12,123))')
    test_json('new Date(Date.UTC(1870,6,20, 13,55,12,123))')
    test_json('new Date(Date.UTC(2006, 6))', timezone=None)
    test_json(json_utc_now, timezone=local_timezone)
    test_json(json_utc_now, date_only=True)
    test_json(json_utc_now, timezone=None, date_only = True)
    test_json(json_utc_now, timezone=utc, date_only = True)
    test_json(json_utc_now, timezone=local_timezone, date_only=True)
    print
    
    print '(%s seconds)' % (str(time.time() - starttime))

if __name__ == '__main__':
    test()
