"""py.test plugin configuration."""

import glob
import os.path
import re

import pytest

FILES_DIR = os.path.relpath(os.path.join(os.path.dirname(__file__), 'files'))

# Globals, yuck!  Populated below.
test_file_tuples = None
test_file_ids = None
def pytest_configure(config):
    """Scan for test files.  Done here because other hooks tend to run once
    *per test*, and there's no reason to do this work more than once.
    """
    global test_file_tuples
    global test_file_ids

    include_ruby = config.getoption('include_ruby')
    test_file_filter = config.getoption('test_file_filter')
    if test_file_filter:
        file_filters = [
            re.compile(filt)
            for filt in test_file_filter.split(',')
        ]
    else:
        file_filters = []

    # Tuples are 3-tuples of the form (scss filename, css filename, pytest
    # marker).  That last one is used to carry xfail/skip, and is None for
    # regular tests.
    # "ids" are just names for the tests, in a parellel list.  We just use
    # relative paths to the input file.
    test_file_tuples = []
    test_file_ids = []
    for fn in glob.glob(os.path.join(FILES_DIR, '*/*.scss')):
        relfn = os.path.relpath(fn, FILES_DIR)
        pytest_trigger = None

        if not include_ruby and (
                relfn.startswith('from-sassc/')
                or relfn.startswith('from-ruby/')):
            pytest_trigger = pytest.skip

        elif relfn.startswith('xfail/'):
            pytest_trigger = pytest.xfail

        if file_filters and not any(rx.search(relfn) for rx in file_filters):
            pytest_trigger = pytest.skip

        test_file_tuples.append((fn, fn[:-5] + '.css', pytest_trigger))
        test_file_ids.append(fn)

def pytest_generate_tests(metafunc):
    """Inject the test files as parametrizations.

    Relies on the command-line option `--test-file-filter`, set by the root
    conftest.py.
    """

    if 'scss_file_pair' in metafunc.fixturenames:
        metafunc.parametrize('scss_file_pair', test_file_tuples, ids=test_file_ids)
