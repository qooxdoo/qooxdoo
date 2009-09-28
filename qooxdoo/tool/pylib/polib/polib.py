#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# License: MIT (see LICENSE file provided)
# vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4:

"""
**polib** allows you to manipulate, create, modify gettext files (pot, po
and mo files).  You can load existing files, iterate through it's entries,
add, modify entries, comments or metadata, etc... or create new po files
from scratch.

**polib** provides a simple and pythonic API, exporting only three
convenience functions (*pofile*, *mofile* and *detect_encoding*), and the
four core classes, *POFile*, *MOFile*, *POEntry* and *MOEntry* for creating
new files/entries.

**Basic example**:

>>> import polib
>>> # load an existing po file
>>> po = polib.pofile('tests/test_utf8.po')
>>> for entry in po:
...     # do something with entry...
...     pass
>>> # add an entry
>>> entry = polib.POEntry(msgid='Welcome', msgstr='Bienvenue')
>>> entry.occurrences = [('welcome.py', '12'), ('anotherfile.py', '34')]
>>> po.append(entry)
>>> # to save our modified po file:
>>> # po.save()
>>> # or you may want to compile the po file
>>> # po.save_as_mofile('tests/test_utf8.mo')
"""

__author__    = 'David JEAN LOUIS <izimobil@gmail.com>'
__version__   = '0.4.2'
__all__       = ['pofile', 'POFile', 'POEntry', 'mofile', 'MOFile', 'MOEntry',
                 'detect_encoding', 'escape', 'unescape']

import codecs
import struct
import textwrap

default_encoding = 'utf-8'

# function pofile() {{{

def pofile(fpath, **kwargs):
    """
    Convenience function that parse the po/pot file *fpath* and return
    a POFile instance.

    **Keyword arguments**:
      - *fpath*: string, full or relative path to the po/pot file to parse
      - *wrapwidth*: integer, the wrap width, only useful when -w option was
        passed to xgettext (optional, default to 78)
      - *autodetect_encoding*: boolean, if set to False the function will
        not try to detect the po file encoding (optional, default to True)
      - *encoding*: string, an encoding, only relevant if autodetect_encoding
        is set to False

    **Example**:

    >>> import polib
    >>> po = polib.pofile('tests/test_weird_occurrences.po')
    >>> po #doctest: +ELLIPSIS
    <POFile instance at ...>
    >>> import os, tempfile
    >>> for fname in ['test_iso-8859-15.po', 'test_utf8.po']:
    ...     orig_po = polib.pofile('tests/'+fname)
    ...     tmpf = tempfile.NamedTemporaryFile().name
    ...     orig_po.save(tmpf)
    ...     try:
    ...         new_po = polib.pofile(tmpf)
    ...         for old, new in zip(orig_po, new_po):
    ...             if old.msgid != new.msgid:
    ...                 old.msgid
    ...                 new.msgid
    ...             if old.msgstr != new.msgstr:
    ...                 old.msgid
    ...                 new.msgid
    ...     finally:
    ...         os.unlink(tmpf)
    """
    if kwargs.get('autodetect_encoding', True) == True:
        enc = detect_encoding(fpath)
    else:
        enc = kwargs.get('encoding', default_encoding)
    parser = _POFileParser(fpath, enc)
    instance = parser.parse()
    instance.wrapwidth = kwargs.get('wrapwidth', 78)
    return instance

# }}}
# function mofile() {{{

def mofile(fpath, **kwargs):
    """
    Convenience function that parse the mo file *fpath* and return
    a MOFile instance.

    **Keyword arguments**:
      - *fpath*: string, full or relative path to the mo file to parse
      - *wrapwidth*: integer, the wrap width, only useful when -w option was
        passed to xgettext to generate the po file that was used to format
        the mo file (optional, default to 78)
      - *autodetect_encoding*: boolean, if set to False the function will
        not try to detect the po file encoding (optional, default to True)
      - *encoding*: string, an encoding, only relevant if autodetect_encoding
        is set to False

    **Example**:

    >>> import polib
    >>> mo = polib.mofile('tests/test_utf8.mo')
    >>> mo #doctest: +ELLIPSIS
    <MOFile instance at ...>
    >>> import os, tempfile
    >>> for fname in ['test_iso-8859-15.mo', 'test_utf8.mo']:
    ...     orig_mo = polib.mofile('tests/'+fname)
    ...     tmpf = tempfile.NamedTemporaryFile().name
    ...     orig_mo.save(tmpf)
    ...     try:
    ...         new_mo = polib.mofile(tmpf)
    ...         for old, new in zip(orig_mo, new_mo):
    ...             if old.msgid != new.msgid:
    ...                 old.msgstr
    ...                 new.msgstr
    ...     finally:
    ...         os.unlink(tmpf)
    """
    if kwargs.get('autodetect_encoding', True) == True:
        enc = detect_encoding(fpath, True)
    else:
        enc = kwargs.get('encoding', default_encoding)
    parser = _MOFileParser(fpath, enc)
    instance = parser.parse()
    instance.wrapwidth = kwargs.get('wrapwidth', 78)
    return instance

# }}}
# function detect_encoding() {{{

def detect_encoding(fpath, binary_mode=False):
    """
    Try to detect the encoding used by the file *fpath*. The function will
    return polib default *encoding* if it's unable to detect it.

    **Keyword argument**:
      - *fpath*: string, full or relative path to the mo file to parse.

    **Examples**:

    >>> print(detect_encoding('tests/test_noencoding.po'))
    utf-8
    >>> print(detect_encoding('tests/test_utf8.po'))
    UTF-8
    >>> print(detect_encoding('tests/test_utf8.mo', True))
    UTF-8
    >>> print(detect_encoding('tests/test_iso-8859-15.po'))
    ISO_8859-15
    >>> print(detect_encoding('tests/test_iso-8859-15.mo', True))
    ISO_8859-15
    """
    import re
    rx = re.compile(r'"?Content-Type:.+? charset=([\w_\-:\.]+)')
    if binary_mode:
        mode = 'rb'
    else:
        mode = 'r'
    f = open(fpath, mode)
    for l in f.readlines():
        match = rx.search(l)
        if match:
            f.close()
            return match.group(1).strip()
    f.close()
    return default_encoding

# }}}
# function escape() {{{

def escape(st):
    """
    Escape special chars and return the given string *st*.

    **Examples**:

    >>> escape('\\t and \\n and \\r and " and \\\\')
    '\\\\t and \\\\n and \\\\r and \\\\" and \\\\\\\\'
    """
    st = st.replace('\\', r'\\')
    st = st.replace('\t', r'\t')
    st = st.replace('\r', r'\r')
    st = st.replace('\n', r'\n')
    st = st.replace('\"', r'\"')
    return st

# }}}
# function unescape() {{{

def unescape(st):
    """
    Unescape special chars and return the given string *st*.

    **Examples**:

    >>> unescape('\\\\t and \\\\n and \\\\r and \\\\" and \\\\\\\\')
    '\\t and \\n and \\r and " and \\\\'
    """
    st = st.replace(r'\"', '"')
    st = st.replace(r'\n', '\n')
    st = st.replace(r'\r', '\r')
    st = st.replace(r'\t', '\t')
    st = st.replace(r'\\', '\\')
    return st

# }}}
# class _BaseFile {{{

class _BaseFile(list):
    """
    Common parent class for POFile and MOFile classes.
    This class must **not** be instanciated directly.
    """

    def __init__(self, fpath=None, wrapwidth=78, encoding=default_encoding):
        """
        Constructor.

        **Keyword arguments**:
          - *fpath*: string, path to po or mo file
          - *wrapwidth*: integer, the wrap width, only useful when -w option
            was passed to xgettext to generate the po file that was used to
            format the mo file, default to 78 (optional).
        """
        list.__init__(self)
        # the opened file handle
        self.fpath = fpath
        # the width at which lines should be wrapped
        self.wrapwidth = wrapwidth
        # the file encoding
        self.encoding = encoding
        # header
        self.header = ''
        # both po and mo files have metadata
        self.metadata = {}
        self.metadata_is_fuzzy = 0

    def __str__(self):
        """String representation of the file."""
        ret = []
        entries = [self.metadata_as_entry()] + \
                  [e for e in self if not e.obsolete]
        for entry in entries:
            ret.append(entry.__str__(self.wrapwidth))
        for entry in self.obsolete_entries():
            ret.append(entry.__str__(self.wrapwidth))
        return '\n'.join(ret)

    def __repr__(self):
        """Return the official string representation of the object."""
        return '<%s instance at %x>' % (self.__class__.__name__, id(self))

    def metadata_as_entry(self):
        """Return the metadata as an entry"""
        e = POEntry(msgid='')
        mdata = self.ordered_metadata()
        if mdata:
            strs = []
            for name, value in mdata:
                # Strip whitespace off each line in a multi-line entry
                value = '\n'.join([v.strip() for v in value.split('\n')])
                strs.append('%s: %s' % (name, value))
            e.msgstr = '\n'.join(strs) + '\n'
        return e

    def save(self, fpath=None, repr_method='__str__'):
        """
        Save the po file to file *fpath* if no file handle exists for
        the object. If there's already an open file and no fpath is
        provided, then the existing file is rewritten with the modified
        data.

        **Keyword arguments**:
          - *fpath*: string, full or relative path to the file.
          - *repr_method*: string, the method to use for output.
        """
        if self.fpath is None and fpath is None:
            raise IOError('You must provide a file path to save() method')
        contents = getattr(self, repr_method)()
        if fpath is None:
            fpath = self.fpath
        if repr_method == 'to_binary':
            fhandle = open(fpath, 'wb')
        else:
            fhandle = codecs.open(fpath, 'w', self.encoding)
        fhandle.write(contents)
        fhandle.close()

    def find(self, st, by='msgid'):
        """
        Find entry which msgid (or property identified by the *by*
        attribute) matches the string *st*.

        **Keyword arguments**:
          - *st*: string, the string to search for
          - *by*: string, the comparison attribute

        **Examples**:

        >>> po = pofile('tests/test_utf8.po')
        >>> entry = po.find('Thursday')
        >>> entry.msgstr
        u'Jueves'
        >>> entry = po.find('Some unexistant msgid')
        >>> entry is None
        True
        >>> entry = po.find('Jueves', 'msgstr')
        >>> entry.msgid
        u'Thursday'
        """
        for e in self:
            if getattr(e, by) == st:
                return e
        return None

    def ordered_metadata(self):
        """
        Convenience method that return the metadata ordered. The return
        value is list of tuples (metadata name, metadata_value).
        """
        # copy the dict first
        metadata = self.metadata.copy()
        data_order = [
            'Project-Id-Version',
            'Report-Msgid-Bugs-To',
            'POT-Creation-Date',
            'PO-Revision-Date',
            'Last-Translator',
            'Language-Team',
            'MIME-Version',
            'Content-Type',
            'Content-Transfer-Encoding'
        ]
        ordered_data = []
        for data in data_order:
            try:
                value = metadata.pop(data)
                ordered_data.append((data, value))
            except KeyError:
                pass
        # the rest of the metadata won't be ordered there are no specs for this
        keys = metadata.keys()
        list(keys).sort()
        for data in keys:
            value = metadata[data]
            ordered_data.append((data, value))
        return ordered_data

    def to_binary(self):
        """Return the mofile binary representation."""
        import struct
        import array
        output = ''
        offsets = []
        ids = strs = ''
        entries = self.translated_entries()
        # the keys are sorted in the .mo file
        def cmp(_self, other):
            if _self.msgid > other.msgid:
                return 1
            elif _self.msgid < other.msgid:
                return -1
            else:
                return 0
        entries.sort(cmp)
        # add metadata entry
        mentry = self.metadata_as_entry()
        mentry.msgstr = mentry.msgstr.replace('\\n', '').lstrip() + '\n'
        entries = [mentry] + entries
        entries_len = len(entries)
        for e in entries:
            # For each string, we need size and file offset.  Each string is
            # NUL terminated; the NUL does not count into the size.
            msgid = e.msgid
            if e.msgid_plural:
                msgid = msgid + '\0' + e.msgid_plural
                indexes = e.msgstr_plural.keys()
                indexes.sort()
                msgstr = []
                for index in indexes:
                    msgstr.append(e.msgstr_plural[index])
                msgstr = '\0'.join(msgstr)
            else:
                msgstr = e.msgstr

            offsets.append((len(ids), len(msgid), len(strs), len(msgstr)))
            ids  += e.msgid  + '\0'
            strs += e.msgstr + '\0'
        # The header is 7 32-bit unsigned integers.
        keystart = 7*4+16*entries_len
        # and the values start after the keys
        valuestart = keystart + len(ids)
        koffsets = []
        voffsets = []
        # The string table first has the list of keys, then the list of values.
        # Each entry has first the size of the string, then the file offset.
        for o1, l1, o2, l2 in offsets:
            koffsets += [l1, o1+keystart]
            voffsets += [l2, o2+valuestart]
        offsets = koffsets + voffsets
        output = struct.pack("IIIIIII",
                             0x950412de,        # Magic number
                             0,                 # Version
                             entries_len,       # # of entries
                             7*4,               # start of key index
                             7*4+entries_len*8, # start of value index
                             0, 0)              # size and offset of hash table
        output += array.array("I", offsets).tostring()
        output += ids
        output += strs
        return output

# }}}
# class POFile {{{

class POFile(_BaseFile):
    '''
    Po (or Pot) file reader/writer.
    POFile objects inherit the list objects methods.

    **Example**:

    >>> po = POFile()
    >>> entry1 = POEntry(
    ...     msgid="Some english text",
    ...     msgstr="Un texte en anglais"
    ... )
    >>> entry1.occurrences = [('testfile', 12),('another_file', 1)]
    >>> entry1.comment = "Some useful comment"
    >>> entry2 = POEntry(
    ...     msgid="Peace in some languages",
    ...     msgstr="Pace سلام שלום Hasîtî 和平"
    ... )
    >>> entry2.occurrences = [('testfile', 15),('another_file', 5)]
    >>> entry2.comment = "Another useful comment"
    >>> entry3 = POEntry(
    ...     msgid='Some entry with quotes " \\"',
    ...     msgstr='Un message unicode avec des quotes " \\"'
    ... )
    >>> entry3.comment = "Test string quoting"
    >>> po.append(entry1)
    >>> po.append(entry2)
    >>> po.append(entry3)
    >>> po.header = "Some Header"
    >>> print(po)
    # Some Header
    msgid ""
    msgstr ""
    <BLANKLINE>
    #. Some useful comment
    #: testfile:12 another_file:1
    msgid "Some english text"
    msgstr "Un texte en anglais"
    <BLANKLINE>
    #. Another useful comment
    #: testfile:15 another_file:5
    msgid "Peace in some languages"
    msgstr "Pace سلام שלום Hasîtî 和平"
    <BLANKLINE>
    #. Test string quoting
    msgid "Some entry with quotes \\" \\""
    msgstr "Un message unicode avec des quotes \\" \\""
    <BLANKLINE>
    '''

    def __str__(self):
        """Return the string representation of the po file"""
        ret, headers = '', self.header.split('\n')
        for header in headers:
            if header[:1] in [',', ':']:
                ret += '#%s\n' % header
            else:
                ret += '# %s\n' % header
        return ret + _BaseFile.__str__(self)

    def save_as_mofile(self, fpath):
        """
        Save the binary representation of the file to *fpath*.

        **Keyword arguments**:
          - *fpath*: string, full or relative path to the file.
        """
        _BaseFile.save(self, fpath, 'to_binary')

    def percent_translated(self):
        """
        Convenience method that return the percentage of translated
        messages.

        **Example**:

        >>> import polib
        >>> po = polib.pofile('tests/test_pofile_helpers.po')
        >>> po.percent_translated()
        50
        >>> po = POFile()
        >>> po.percent_translated()
        100
        """
        total = len([e for e in self if not e.obsolete])
        if total == 0:
            return 100
        translated = len(self.translated_entries())
        return int((100.00 / float(total)) * translated)

    def translated_entries(self):
        """
        Convenience method that return a list of translated entries.

        **Example**:

        >>> import polib
        >>> po = polib.pofile('tests/test_pofile_helpers.po')
        >>> len(po.translated_entries())
        6
        """
        return [e for e in self if e.translated() and not e.obsolete]

    def untranslated_entries(self):
        """
        Convenience method that return a list of untranslated entries.

        **Example**:

        >>> import polib
        >>> po = polib.pofile('tests/test_pofile_helpers.po')
        >>> len(po.untranslated_entries())
        6
        """
        return [e for e in self if not e.translated() and not e.obsolete]

    def fuzzy_entries(self):
        """
        Convenience method that return the list of 'fuzzy' entries.

        **Example**:

        >>> import polib
        >>> po = polib.pofile('tests/test_pofile_helpers.po')
        >>> len(po.fuzzy_entries())
        2
        """
        return [e for e in self if 'fuzzy' in e.flags]

    def obsolete_entries(self):
        """
        Convenience method that return the list of obsolete entries.

        **Example**:

        >>> import polib
        >>> po = polib.pofile('tests/test_pofile_helpers.po')
        >>> len(po.obsolete_entries())
        4
        """
        return [e for e in self if e.obsolete]

    def merge(self, refpot):
        """
        XXX this could not work if encodings are different, needs thinking
        and general refactoring of how polib handles encoding...

        Convenience method that merge the current pofile with the pot file
        provided. It behaves exactly as the gettext msgmerge utility:

          - comments of this file will be preserved, but extracted comments
            and occurrences will be discarded
          - any translations or comments in the file will be discarded,
            however dot comments and file positions will be preserved

        **Keyword argument**:
          - *refpot*: object POFile, the reference catalog.

        **Example**:

        >>> import polib
        >>> refpot = polib.pofile('tests/test_merge.pot')
        >>> po = polib.pofile('tests/test_merge_before.po')
        >>> po.merge(refpot)
        >>> expected_po = polib.pofile('tests/test_merge_after.po')
        >>> unicode(po) == unicode(expected_po)
        True
        """
        for entry in refpot:
            e = self.find(entry.msgid)
            if e is None:
                e = POEntry()
                self.append(e)
            e.merge(entry)
        # ok, now we must "obsolete" entries that are not in the refpot
        # anymore
        for entry in self:
            if refpot.find(entry.msgid) is None:
                entry.obsolete = True

# }}}
# class MOFile {{{

class MOFile(_BaseFile):
    '''
    Mo file reader/writer.
    MOFile objects inherit the list objects methods.

    **Example**:

    >>> mo = MOFile()
    >>> entry1 = POEntry(
    ...     msgid="Some english text",
    ...     msgstr="Un texte en anglais"
    ... )
    >>> entry2 = POEntry(
    ...     msgid="I need my dirty cheese",
    ...     msgstr="Je veux mon sale fromage"
    ... )
    >>> entry3 = MOEntry(
    ...     msgid='Some entry with quotes " \\"',
    ...     msgstr='Un message unicode avec des quotes " \\"'
    ... )
    >>> mo.append(entry1)
    >>> mo.append(entry2)
    >>> mo.append(entry3)
    >>> print(mo)
    msgid ""
    msgstr ""
    <BLANKLINE>
    msgid "Some english text"
    msgstr "Un texte en anglais"
    <BLANKLINE>
    msgid "I need my dirty cheese"
    msgstr "Je veux mon sale fromage"
    <BLANKLINE>
    msgid "Some entry with quotes \\" \\""
    msgstr "Un message unicode avec des quotes \\" \\""
    <BLANKLINE>
    '''

    def __init__(self, *args, **kwargs):
        """
        MOFile constructor. Mo files have two other properties:
            - magic_number: the magic_number of the binary file,
            - version: the version of the mo spec.
        """
        _BaseFile.__init__(self, *args, **kwargs)
        self.magic_number = None
        self.version = 0

    def save_as_pofile(self, fpath):
        """
        Save the string representation of the file to *fpath*.

        **Keyword argument**:
          - *fpath*: string, full or relative path to the file.
        """
        _BaseFile.save(self, fpath)

    def save(self, fpath):
        """
        Save the binary representation of the file to *fpath*.

        **Keyword argument**:
          - *fpath*: string, full or relative path to the file.
        """
        _BaseFile.save(self, fpath, 'to_binary')

    def percent_translated(self):
        """
        Convenience method to keep the same interface with POFile instances.
        """
        return 100

    def translated_entries(self):
        """
        Convenience method to keep the same interface with POFile instances.
        """
        return self

    def untranslated_entries(self):
        """
        Convenience method to keep the same interface with POFile instances.
        """
        return []

    def fuzzy_entries(self):
        """
        Convenience method to keep the same interface with POFile instances.
        """
        return []

    def obsolete_entries(self):
        """
        Convenience method to keep the same interface with POFile instances.
        """
        return []

# }}}
# class _BaseEntry {{{

class _BaseEntry(object):
    """
    Base class for POEntry or MOEntry objects.
    This class must *not* be instanciated directly.
    """

    def __init__(self, *args, **kwargs):
        """Base Entry constructor."""
        self.msgid = kwargs.get('msgid', '')
        self.msgstr = kwargs.get('msgstr', '')
        self.msgid_plural = kwargs.get('msgid_plural', '')
        self.msgstr_plural = kwargs.get('msgstr_plural', {})
        self.obsolete = kwargs.get('obsolete', False)
        self.encoding = kwargs.get('encoding', default_encoding)

    def __repr__(self):
        """Return the official string representation of the object."""
        return '<%s instance at %x>' % (self.__class__.__name__, id(self))

    def __str__(self, wrapwidth=78):
        """
        Common string representation of the POEntry and MOEntry
        objects.
        """
        if self.obsolete:
            delflag = '#~ '
        else:
            delflag = ''
        # write the msgid
        ret = []
        ret += self._str_field("msgid", delflag, "", self.msgid)
        # write the msgid_plural if any
        if self.msgid_plural:
            ret += self._str_field("msgid_plural", delflag, "", self.msgid_plural)
        if self.msgstr_plural:
            # write the msgstr_plural if any
            msgstrs = self.msgstr_plural
            keys = list(msgstrs)
            keys.sort()
            for index in keys:
                msgstr = msgstrs[index]
                plural_index = '[%s]' % index
                ret += self._str_field("msgstr", delflag, plural_index, msgstr)
        else:
            # otherwise write the msgstr
            ret += self._str_field("msgstr", delflag, "", self.msgstr)
        ret.append('')
        return '\n'.join(ret)

    def _str_field(self, fieldname, delflag, plural_index, field):
        lines = field.splitlines(True) # keep line breaks in strings
        # potentially, we could do line-wrapping here, but textwrap.wrap
        # treats whitespace too carelessly for us to use it.
        if len(lines) > 1:
            lines = ['']+lines # start with initial empty line
        else:
            lines = [field] # needed for the empty string case
        ret = ['%s%s%s "%s"' % (delflag, fieldname, plural_index,
                                escape(lines.pop(0)))]
        for mstr in lines:
            ret.append('%s"%s"' % (delflag, escape(mstr)))
        return ret

# }}}
# class POEntry {{{

class POEntry(_BaseEntry):
    """
    Represents a po file entry.

    **Examples**:

    >>> entry = POEntry(msgid='Welcome', msgstr='Bienvenue')
    >>> entry.occurrences = [('welcome.py', 12), ('anotherfile.py', 34)]
    >>> print(entry)
    #: welcome.py:12 anotherfile.py:34
    msgid "Welcome"
    msgstr "Bienvenue"
    <BLANKLINE>
    >>> entry = POEntry()
    >>> entry.occurrences = [('src/some-very-long-filename-that-should-not-be-wrapped-even-if-it-is-larger-than-the-wrap-limit.c', 32), ('src/eggs.c', 45)]
    >>> entry.comment = 'A plural translation. This is a very very very long line please do not wrap, this is just for testing comment wrapping...'
    >>> entry.tcomment = 'A plural translation. This is a very very very long line please do not wrap, this is just for testing comment wrapping...'
    >>> entry.flags.append('c-format')
    >>> entry.msgid = 'I have spam but no egg !'
    >>> entry.msgid_plural = 'I have spam and %d eggs !'
    >>> entry.msgstr_plural[0] = "J'ai du jambon mais aucun oeuf !"
    >>> entry.msgstr_plural[1] = "J'ai du jambon et %d oeufs !"
    >>> print(entry)
    #. A plural translation. This is a very very very long line please do not
    #. wrap, this is just for testing comment wrapping...
    # A plural translation. This is a very very very long line please do not wrap,
    # this is just for testing comment wrapping...
    #: src/some-very-long-filename-that-should-not-be-wrapped-even-if-it-is-larger-than-the-wrap-limit.c:32
    #: src/eggs.c:45
    #, c-format
    msgid "I have spam but no egg !"
    msgid_plural "I have spam and %d eggs !"
    msgstr[0] "J'ai du jambon mais aucun oeuf !"
    msgstr[1] "J'ai du jambon et %d oeufs !"
    <BLANKLINE>
    """

    def __init__(self, *args, **kwargs):
        """POEntry constructor."""
        _BaseEntry.__init__(self, *args, **kwargs)
        self.comment = kwargs.get('comment', '')
        self.tcomment = kwargs.get('tcomment', '')
        self.occurrences = kwargs.get('occurrences', [])
        self.flags = kwargs.get('flags', [])

    def __str__(self, wrapwidth=78):
        """
        Return the string representation of the entry.
        """
        if self.obsolete:
            return _BaseEntry.__str__(self)
        ret = []
        # comment first, if any (with text wrapping as xgettext does)
        if self.comment != '':
            for comment in self.comment.split('\n'):
                if wrapwidth > 0 and len(comment) > wrapwidth-3:
                    ret += textwrap.wrap(comment, wrapwidth,
                                         initial_indent='#. ',
                                         subsequent_indent='#. ',
                                         break_long_words=False)
                else:
                    ret.append('#. %s' % comment)
        # translator comment, if any (with text wrapping as xgettext does)
        if self.tcomment != '':
            for tcomment in self.tcomment.split('\n'):
                if wrapwidth > 0 and len(tcomment) > wrapwidth-2:
                    ret += textwrap.wrap(tcomment, wrapwidth,
                                         initial_indent='# ',
                                         subsequent_indent='# ',
                                         break_long_words=False)
                else:
                    ret.append('# %s' % tcomment)
        # occurrences (with text wrapping as xgettext does)
        if self.occurrences:
            filelist = []
            for fpath, lineno in self.occurrences:
                if lineno:
                    filelist.append('%s:%s' % (fpath, lineno))
                else:
                    filelist.append(fpath)
            filestr = ' '.join(filelist)
            if wrapwidth > 0 and len(filestr)+3 > wrapwidth:
                # XXX textwrap split words that contain hyphen, this is not 
                # what we want for filenames, so the dirty hack is to 
                # temporally replace hyphens with a char that a file cannot 
                # contain, like "*"
                lines = textwrap.wrap(filestr.replace('-', '*'),
                                      wrapwidth,
                                      initial_indent='#: ',
                                      subsequent_indent='#: ',
                                      break_long_words=False)
                # end of the replace hack
                for line in lines:
                    ret.append(line.replace('*', '-'))
            else:
                ret.append('#: '+filestr)
        # flags
        if self.flags:
            flags = []
            for flag in self.flags:
                flags.append(flag)
            ret.append('#, %s' % ', '.join(flags))
        ret.append(_BaseEntry.__str__(self))
        return '\n'.join(ret)

    def __cmp__(self, other):
        '''
        Called by comparison operations if rich comparison is not defined.

        **Tests**:
        >>> a  = POEntry(msgid='a', occurrences=[('b.py', 1), ('b.py', 3)])
        >>> b  = POEntry(msgid='b', occurrences=[('b.py', 1), ('b.py', 3)])
        >>> c1 = POEntry(msgid='c1', occurrences=[('a.py', 1), ('b.py', 1)])
        >>> c2 = POEntry(msgid='c2', occurrences=[('a.py', 1), ('a.py', 3)])
        >>> po = POFile()
        >>> po.append(a)
        >>> po.append(b)
        >>> po.append(c1)
        >>> po.append(c2)
        >>> po.sort()
        >>> print(po)
        # 
        msgid ""
        msgstr ""
        <BLANKLINE>
        #: a.py:1 a.py:3
        msgid "c2"
        msgstr ""
        <BLANKLINE>
        #: a.py:1 b.py:1
        msgid "c1"
        msgstr ""
        <BLANKLINE>
        #: b.py:1 b.py:3
        msgid "a"
        msgstr ""
        <BLANKLINE>
        #: b.py:1 b.py:3
        msgid "b"
        msgstr ""
        <BLANKLINE>
        '''
        def compare_occurrences(a, b):
            """
            Compare an entry occurrence with another one.
            """
            if a[0] != b[0]:
                return a[0] < b[0]
            if a[1] != b[1]:
                return a[1] < b[1]
            return 0

        # First: Obsolete test
        if self.obsolete != other.obsolete:
            if self.obsolete:
                return -1
            else:
                return 1
        # Work on a copy to protect original
        occ1 = self.occurrences[:]
        occ2 = other.occurrences[:]
        # Sorting using compare method
        occ1.sort(compare_occurrences)
        occ2.sort(compare_occurrences)
        # Comparing sorted occurrences
        pos = 0
        for entry1 in occ1:
            try:
                entry2 = occ2[pos]
            except IndexError:
                return 1
            pos = pos + 1
            if entry1[0] != entry2[0]:
                if entry1[0] > entry2[0]:
                    return 1
                else:
                    return -1
            if entry1[1] != entry2[1]:
                if entry1[1] > entry2[1]:
                    return 1
                else:
                    return -1
        # Finally: Compare message ID
        if self.msgid > other.msgid: return 1
        else: return -1

    def translated(self):
        """
        Return True if the entry has been translated or False.
        """
        if self.obsolete or 'fuzzy' in self.flags:
            return False
        if self.msgstr != '':
            return True
        if self.msgstr_plural:
            for pos in self.msgstr_plural:
                if self.msgstr_plural[pos] == '':
                    return False
            return True
        return False

    def merge(self, other):
        """
        Merge the current entry with the given pot entry.
        """
        self.msgid        = other.msgid
        self.occurrences  = other.occurrences
        self.comment      = other.comment
        self.flags        = other.flags
        self.msgid_plural = other.msgid_plural
        if other.msgstr_plural:
            for pos in other.msgstr_plural:
                try:
                    # keep existing translation at pos if any
                    self.msgstr_plural[pos]
                except KeyError:
                    self.msgstr_plural[pos] = ''

# }}}
# class MOEntry {{{

class MOEntry(_BaseEntry):
    """
    Represents a mo file entry.

    **Examples**:

    >>> entry = MOEntry()
    >>> entry.msgid  = 'translate me !'
    >>> entry.msgstr = 'traduisez moi !'
    >>> print(entry)
    msgid "translate me !"
    msgstr "traduisez moi !"
    <BLANKLINE>
    """

    def __str__(self, wrapwidth=78):
        """
        Return the string representation of the entry.
        """
        return _BaseEntry.__str__(self, wrapwidth)

# }}}
# class _POFileParser {{{

class _POFileParser(object):
    """
    A finite state machine to parse efficiently and correctly po
    file format.
    """

    def __init__(self, fpath, enc=default_encoding):
        """
        Constructor.

        **Keyword argument**:
          - *fpath*: string, path to the po file
        """
        try:
            self.fhandle = codecs.open(fpath, 'rU', enc)
        except LookupError:
            enc = default_encoding
            self.fhandle = codecs.open(fpath, 'rU', enc)
        self.instance = POFile(fpath=fpath, encoding=enc)
        self.transitions = {}
        self.current_entry = POEntry()
        self.current_state = 'ST'
        self.current_token = None
        # two memo flags used in handlers
        self.msgstr_index = 0
        self.entry_obsolete = 0
        # Configure the state machine, by adding transitions.
        # Signification of symbols:
        #     * ST: Beginning of the file (start)
        #     * HE: Header
        #     * TC: a translation comment
        #     * GC: a generated comment
        #     * OC: a file/line occurence
        #     * FL: a flags line
        #     * MI: a msgid
        #     * MP: a msgid plural
        #     * MS: a msgstr
        #     * MX: a msgstr plural
        #     * MC: a msgid or msgstr continuation line
        all_ = ['ST', 'HE', 'GC', 'OC', 'FL', 'TC', 'MS', 'MP', 'MX', 'MI']

        self.add('TC', ['ST', 'HE'],                                     'HE')
        self.add('TC', ['GC', 'OC', 'FL', 'TC', 'MS', 'MP', 'MX', 'MI'], 'TC')
        self.add('GC', all_,                                             'GC')
        self.add('OC', all_,                                             'OC')
        self.add('FL', all_,                                             'FL')
        self.add('MI', ['ST', 'HE', 'GC', 'OC', 'FL', 'TC', 'MS', 'MX'], 'MI')
        self.add('MP', ['TC', 'GC', 'MI'],                               'MP')
        self.add('MS', ['MI', 'MP', 'TC'],                               'MS')
        self.add('MX', ['MI', 'MX', 'MP', 'TC'],                         'MX')
        self.add('MC', ['MI', 'MP', 'MS', 'MX'],                         'MC')

    def parse(self):
        """
        Run the state machine, parse the file line by line and call process()
        with the current matched symbol.
        """
        i, lastlen = 1, 0
        for line in self.fhandle:
            line = line.strip()
            if line == '':
                i = i+1
                continue
            if line[:3] == '#~ ':
                line = line[3:]
                self.entry_obsolete = 1
            else:
                self.entry_obsolete = 0
            self.current_token = line
            if line[:2] == '#:':
                # we are on a occurrences line
                self.process('OC', i)
            elif line[:7] == 'msgid "':
                # we are on a msgid
                self.process('MI', i)
            elif line[:8] == 'msgstr "':
                # we are on a msgstr
                self.process('MS', i)
            elif line[:1] == '"':
                # we are on a continuation line or some metadata
                self.process('MC', i)
            elif line[:14] == 'msgid_plural "':
                # we are on a msgid plural
                self.process('MP', i)
            elif line[:7] == 'msgstr[':
                # we are on a msgstr plural
                self.process('MX', i)
            elif line[:3] == '#, ':
                # we are on a flags line
                self.process('FL', i)
            elif line[:2] == '# ' or line == '#':
                if line == '#': line = line + ' '
                # we are on a translator comment line
                self.process('TC', i)
            elif line[:2] == '#.':
                # we are on a generated comment line
                self.process('GC', i)
            i = i+1

        if self.current_entry:
            # since entries are added when another entry is found, we must add
            # the last entry here (only if there are lines)
            self.instance.append(self.current_entry)
        # before returning the instance, check if there's metadata and if 
        # so extract it in a dict
        firstentry = self.instance[0]
        if firstentry.msgid == '': # metadata found
            # remove the entry
            firstentry = self.instance.pop(0)
            self.instance.metadata_is_fuzzy = firstentry.flags
            key = None
            for msg in firstentry.msgstr.splitlines():
                try:
                    key, val = msg.split(':', 1)
                    self.instance.metadata[key] = val.strip()
                except:
                    if key is not None:
                        self.instance.metadata[key] += '\n'+ msg.strip()
        # close opened file
        self.fhandle.close()
        return self.instance

    def add(self, symbol, states, next_state):
        """
        Add a transition to the state machine.
        Keywords arguments:

        symbol     -- string, the matched token (two chars symbol)
        states     -- list, a list of states (two chars symbols)
        next_state -- the next state the fsm will have after the action
        """
        for state in states:
            action = getattr(self, 'handle_%s' % next_state.lower())
            self.transitions[(symbol, state)] = (action, next_state)

    def process(self, symbol, linenum):
        """
        Process the transition corresponding to the current state and the
        symbol provided.

        Keywords arguments:
        symbol  -- string, the matched token (two chars symbol)
        linenum -- integer, the current line number of the parsed file
        """
        try:
            (action, state) = self.transitions[(symbol, self.current_state)]
            if action():
                self.current_state = state
        except Exception, exc:
            raise IOError('Syntax error in po file (line %s)' % linenum)

    # state handlers

    def handle_he(self):
        """Handle a header comment."""
        if self.instance.header != '':
            self.instance.header += '\n'
        self.instance.header += self.current_token[2:]
        return 1

    def handle_tc(self):
        """Handle a translator comment."""
        if self.current_state in ['MC', 'MS', 'MX']:
            self.instance.append(self.current_entry)
            self.current_entry = POEntry()
        if self.current_entry.tcomment != '':
            self.current_entry.tcomment += '\n'
        self.current_entry.tcomment += self.current_token[2:]
        return True

    def handle_gc(self):
        """Handle a generated comment."""
        if self.current_state in ['MC', 'MS', 'MX']:
            self.instance.append(self.current_entry)
            self.current_entry = POEntry()
        if self.current_entry.comment != '':
            self.current_entry.comment += '\n'
        self.current_entry.comment += self.current_token[3:]
        return True

    def handle_oc(self):
        """Handle a file:num occurence."""
        if self.current_state in ['MC', 'MS', 'MX']:
            self.instance.append(self.current_entry)
            self.current_entry = POEntry()
        occurrences = self.current_token[3:].split()
        for occurrence in occurrences:
            if occurrence != '':
                try:
                    fil, line = occurrence.split(':')
                    if not line.isdigit():
                        fil  = fil + line
                        line = ''
                    self.current_entry.occurrences.append((fil, line))
                except:
                    self.current_entry.occurrences.append((occurrence, ''))
        return True

    def handle_fl(self):
        """Handle a flags line."""
        if self.current_state in ['MC', 'MS', 'MX']:
            self.instance.append(self.current_entry)
            self.current_entry = POEntry()
        self.current_entry.flags += self.current_token[3:].split(', ')
        return True

    def handle_mi(self):
        """Handle a msgid."""
        if self.current_state in ['MC', 'MS', 'MX']:
            self.instance.append(self.current_entry)
            self.current_entry = POEntry()
        self.current_entry.obsolete = self.entry_obsolete
        self.current_entry.msgid = unescape(self.current_token[7:-1])
        return True

    def handle_mp(self):
        """Handle a msgid plural."""
        self.current_entry.msgid_plural = unescape(self.current_token[14:-1])
        return True

    def handle_ms(self):
        """Handle a msgstr."""
        self.current_entry.msgstr = unescape(self.current_token[8:-1])
        return True

    def handle_mx(self):
        """Handle a msgstr plural."""
        index, value = self.current_token[7], self.current_token[11:-1]
        self.current_entry.msgstr_plural[index] = unescape(value)
        self.msgstr_index = index
        return True

    def handle_mc(self):
        """Handle a msgid or msgstr continuation line."""
        if self.current_state == 'MI':
            self.current_entry.msgid += unescape(self.current_token[1:-1])
        elif self.current_state == 'MP':
            self.current_entry.msgid_plural += \
                unescape(self.current_token[1:-1])
        elif self.current_state == 'MS':
            self.current_entry.msgstr += unescape(self.current_token[1:-1])
        elif self.current_state == 'MX':
            msgstr = self.current_entry.msgstr_plural[self.msgstr_index] +\
                unescape(self.current_token[1:-1])
            self.current_entry.msgstr_plural[self.msgstr_index] = msgstr
        # don't change the current state
        return False

# }}}
# class _MOFileParser {{{

class _MOFileParser(object):
    """
    A class to parse binary mo files.
    """
    BIG_ENDIAN    = 0xde120495
    LITTLE_ENDIAN = 0x950412de

    def __init__(self, fpath, enc=default_encoding):
        """_MOFileParser constructor."""
        self.fhandle = open(fpath, 'rb')
        self.instance = MOFile(fpath=fpath, encoding=enc)

    def parse_magicnumber(self):
        """
        Parse the magic number and raise an exception if not valid.
        """

    def parse(self):
        """
        Build the instance with the file handle provided in the
        constructor.
        """
        magic_number = self._readbinary('<I', 4)
        if magic_number == self.LITTLE_ENDIAN:
            ii = '<II'
        elif magic_number == self.BIG_ENDIAN:
            ii = '>II'
        else:
            raise IOError('Invalid mo file, magic number is incorrect !')
        self.instance.magic_number = magic_number
        # parse the version number and the number of strings
        self.instance.version, numofstrings = self._readbinary(ii, 8)
        # original strings and translation strings hash table offset
        msgids_hash_offset, msgstrs_hash_offset = self._readbinary(ii, 8)
        # move to msgid hash table and read length and offset of msgids
        self.fhandle.seek(msgids_hash_offset)
        msgids_index = []
        for i in range(numofstrings):
            msgids_index.append(self._readbinary(ii, 8))
        # move to msgstr hash table and read length and offset of msgstrs
        self.fhandle.seek(msgstrs_hash_offset)
        msgstrs_index = []
        for i in range(numofstrings):
            msgstrs_index.append(self._readbinary(ii, 8))
        # build entries
        for i in range(numofstrings):
            self.fhandle.seek(msgids_index[i][1])
            msgid = self.fhandle.read(msgids_index[i][0])
            self.fhandle.seek(msgstrs_index[i][1])
            msgstr = self.fhandle.read(msgstrs_index[i][0])
            if i == 0: # metadata
                raw_metadata, metadata = msgstr.split('\n'), {}
                for line in raw_metadata:
                    tokens = line.split(':', 1)
                    if tokens[0] != '':
                        try:
                            metadata[tokens[0]] = tokens[1].strip()
                        except IndexError:
                            metadata[tokens[0]] = ''
                self.instance.metadata = metadata
                continue
            entry = MOEntry(msgid=msgid, msgstr=msgstr)
            self.instance.append(entry)
        # close opened file
        self.fhandle.close()
        return self.instance

    def _readbinary(self, fmt, numbytes):
        """
        Private method that unpack n bytes of data using format <fmt>.
        It returns a tuple or a mixed value if the tuple length is 1.
        """
        bytes = self.fhandle.read(numbytes)
        tup = struct.unpack(fmt, bytes)
        if len(tup) == 1:
            return tup[0]
        return tup

# }}}
# __main__ {{{

if __name__ == '__main__':
    """
    **Main function**::
      - to **test** the module just run: *python polib.py [-v]*
      - to **profile** the module: *python polib.py -p <some_pofile.po>*
    """
    import sys
    if len(sys.argv) > 2 and sys.argv[1] == '-p':
        def test(f):
            if f.endswith('po'):
                p = pofile(f)
            else:
                p = mofile(f)
            s = str(p)
        import profile
        profile.run('test("'+sys.argv[2]+'")')
    else:
        import doctest
        doctest.testmod()

# }}}
