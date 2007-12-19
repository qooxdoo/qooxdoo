#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# License: MIT (see LICENSE file provided)
# vim600: fdm=marker tabstop=4 shiftwidth=4 expandtab ai

# Description {{{
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
# }}}

__author__    = 'David JEAN LOUIS <izimobil@gmail.com>'
__version__   = '0.3.1'


# dependencies {{{
try:
    import struct
    import textwrap
    import warnings
except ImportError, exc:
    raise ImportError('polib requires python 2.3 or later with the standard' \
        ' modules "struct", "textwrap" and "warnings" (details: %s)' % exc)
# }}}

__all__ = ['pofile', 'POFile', 'POEntry', 'mofile', 'MOFile', 'MOEntry',
           'detect_encoding', 'quote', 'unquote']

# shortcuts for performance improvement {{{
# yes, yes, this is quite ugly but *very* efficient
_dictget    = dict.get
_listappend = list.append
_listpop    = list.pop
_strjoin    = str.join
_strsplit   = str.split
_strstrip   = str.strip
_strreplace = str.replace
_textwrap   = textwrap.wrap
# }}}

encoding = 'utf-8'

def pofile(fpath, wrapwidth=78, autodetect_encoding=True):
    """
    Convenience function that parse the po/pot file *fpath* and return
    a POFile instance.

    **Keyword arguments**:
      - *fpath*: string, full or relative path to the po/pot file to parse
      - *wrapwidth*: integer, the wrap width, only useful when -w option was
        passed to xgettext, default to 78 (optional)
      - *autodetect_encoding*: boolean, if set to False the function will
        not try to detect the po file encoding

    **Example**:

    >>> import polib
    >>> po = polib.pofile('tests/test_utf8.po')
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
    # pofile {{{
    if autodetect_encoding == True:
        global encoding
        encoding = detect_encoding(fpath)
    parser = _POFileParser(fpath)
    instance = parser.parse()
    instance.wrapwidth = wrapwidth
    return instance
    # }}}


def mofile(fpath, wrapwidth=78, autodetect_encoding=True):
    """
    Convenience function that parse the mo file *fpath* and return
    a MOFile instance.

    **Keyword arguments**:
      - *fpath*: string, full or relative path to the mo file to parse
      - *wrapwidth*: integer, the wrap width, only useful when -w option was
        passed to xgettext to generate the po file that was used to format
        the mo file, default to 78 (optional)
      - *autodetect_encoding*: boolean, if set to False the function will
        not try to detect the po file encoding

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
    # mofile {{{
    if autodetect_encoding == True:
        global encoding
        encoding = detect_encoding(fpath)
    parser = _MOFileParser(fpath)
    instance = parser.parse()
    instance.wrapwidth = wrapwidth
    return instance
    # }}}


def detect_encoding(fpath):
    """
    Try to detect the encoding used by the file *fpath*. The function will
    return polib default *encoding* if it's unable to detect it.

    **Keyword argument**:
      - *fpath*: string, full or relative path to the mo file to parse.

    **Examples**:

    >>> print detect_encoding('tests/test_noencoding.po')
    utf-8
    >>> print detect_encoding('tests/test_utf8.po')
    UTF-8
    >>> print detect_encoding('tests/test_utf8.mo')
    UTF-8
    >>> print detect_encoding('tests/test_iso-8859-15.po')
    ISO_8859-15
    >>> print detect_encoding('tests/test_iso-8859-15.mo')
    ISO_8859-15
    """
    # detect_encoding {{{
    import re
    global encoding
    encoding = 'utf-8'
    e = None
    rx = re.compile(r'"?Content-Type:.+? charset=([\w_\-:\.]+)')
    f = open(fpath)
    for l in f:
        match = rx.search(l)
        if match:
            e = _strstrip(match.group(1))
            break
    f.close()
    if e is not None:
        return e
    return encoding
    # }}}


def quote(st):
    """
    Quote and return the given string *st*.

    **Examples**:

    >>> quote('\\t and \\n and \\r and " and \\\\')
    '\\\\t and \\\\n and \\\\r and \\\\" and \\\\\\\\'
    """
    # quote {{{
    st = _strreplace(st, '\\', r'\\')
    st = _strreplace(st, '\t', r'\t')
    st = _strreplace(st, '\r', r'\r')
    st = _strreplace(st, '\n', r'\n')
    st = _strreplace(st, '\"', r'\"')
    return st
    # }}}


def unquote(st):
    """
    Unquote and return the given string *st*.

    **Examples**:

    >>> unquote('\\\\t and \\\\n and \\\\r and \\\\" and \\\\\\\\')
    '\\t and \\n and \\r and " and \\\\'
    """
    # unquote {{{
    st = _strreplace(st, r'\"', '"')
    st = _strreplace(st, r'\n', '\n')
    st = _strreplace(st, r'\r', '\r')
    st = _strreplace(st, r'\t', '\t')
    st = _strreplace(st, r'\\', '\\')
    return st
    # }}}


class _BaseFile(list):
    """
    Common parent class for POFile and MOFile classes.
    This class must **not** be instanciated directly.
    """
    # class _BaseFile {{{


    def __init__(self, fpath=None, wrapwidth=78):
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
            _listappend(ret, entry.__str__(self.wrapwidth))
        for entry in self.obsolete_entries():
            _listappend(ret, entry.__str__(self.wrapwidth))
        return _strjoin('\n', ret)

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
                value = _strjoin('\n', [_strstrip(v)
                                        for v in _strsplit(value, '\n')])
                _listappend(strs, '%s: %s' % (name, value))
            e.msgstr = _strjoin('\n', strs) + '\n'
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
        mode = 'w'
        if repr_method == 'to_binary':
            mode += 'b'
        fhandle = open(fpath, mode)
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
        'Jueves'
        >>> entry = po.find('Some unexistant msgid')
        >>> entry is None
        True
        >>> entry = po.find('Jueves', 'msgstr')
        >>> entry.msgid
        'Thursday'
        """
        try:
            return [e for e in self if getattr(e, by) == st][0]
        except IndexError:
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
                _listappend(ordered_data, (data, value))
            except KeyError:
                pass
        # the rest of the metadata won't be ordered there are no specs for this
        keys = metadata.keys()
        keys.sort()
        for data in keys:
            value = metadata[data]
            _listappend(ordered_data, (data, value))
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
        mentry.msgstr = _strreplace(mentry.msgstr, '\\n', '').lstrip() + '\n'
        entries = [mentry] + entries
        entries_len = len(entries)
        for e in entries:
            # For each string, we need size and file offset.  Each string is
            # NUL terminated; the NUL does not count into the size.
            msgid = e._decode(e.msgid)
            msgstr = e._decode(e.msgstr)
            offsets.append((len(ids), len(msgid), len(strs), len(msgstr)))
            ids  += msgid  + '\0'
            strs += msgstr + '\0'
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
        output = struct.pack("Iiiiiii",
                             0x950412de,        # Magic number
                             0,                 # Version
                             entries_len,       # # of entries
                             7*4,               # start of key index
                             7*4+entries_len*8, # start of value index
                             0, 0)              # size and offset of hash table
        output += array.array("i", offsets).tostring()
        output += ids
        output += strs
        return output
    # }}}


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
    ...     msgid="I need my dirty cheese",
    ...     msgstr="Je veux mon sale fromage"
    ... )
    >>> entry2.occurrences = [('testfile', 15),('another_file', 5)]
    >>> entry2.comment = "Another useful comment"
    >>> entry3 = POEntry(
    ...     msgid='Some entry with quotes " \\"',
    ...     msgstr=u'Un message unicode avec des quotes " \\"'
    ... )
    >>> entry3.comment = "Test string quoting"
    >>> po.append(entry1)
    >>> po.append(entry2)
    >>> po.append(entry3)
    >>> po.header = "Some Header"
    >>> print po
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
    msgid "I need my dirty cheese"
    msgstr "Je veux mon sale fromage"
    <BLANKLINE>
    #. Test string quoting
    msgid "Some entry with quotes \\" \\""
    msgstr "Un message unicode avec des quotes \\" \\""
    <BLANKLINE>
    '''
    # class POFile {{{

    def __str__(self):
        """Return the string representation of the po file"""
        ret, headers = '', _strsplit(self.header, '\n')
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
        """
        total = len([e for e in self if not e.obsolete])
        translated = len(self.translated_entries())
        return int((100.00 / float(total)) * translated)

    def translated_entries(self):
        """
        Convenience method that return a list of translated entries.

        **Example**:

        >>> import polib
        >>> po = polib.pofile('tests/test_pofile_helpers.po')
        >>> len(po.translated_entries())
        5
        """
        return [e for e in self if e.translated() and not e.obsolete]

    def untranslated_entries(self):
        """
        Convenience method that return a list of untranslated entries.

        **Example**:

        >>> import polib
        >>> po = polib.pofile('tests/test_pofile_helpers.po')
        >>> len(po.untranslated_entries())
        5
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
          * comments of this file will be preserved, but extracted comments
            and occurrences  will  be  discarded.
          * any  translations or comments in the file will be discarded,
            however dot comments and file positions will  be  preserved.

        **Keyword argument**:
          - *refpot*: object POFile, the reference catalog.

        **Example**:

        >>> import polib
        >>> refpot = polib.pofile('tests/test_merge.pot')
        >>> po = polib.pofile('tests/test_merge_before.po')
        >>> po.merge(refpot)
        >>> expected_po = polib.pofile('tests/test_merge_after.po')
        >>> str(po) == str(expected_po)
        True
        """
        for entry in refpot:
            e = self.find(entry.msgid)
            if e is None:
                # entry is not in the po file, we must add it
                # entry is created with msgid, occurrences and comment
                self.append(POEntry(
                    msgid=entry.msgid,
                    occurrences=entry.occurrences,
                    comment=entry.comment
                ))
            else:
                # entry found, we update it...
                e.occurrences = entry.occurrences
                e.comment = entry.comment
        # ok, now we must "obsolete" entries that are not in the refpot
        # anymore
        for entry in self:
            if refpot.find(entry.msgid) is None:
                entry.obsolete = True
    # }}}


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
    ...     msgstr=u'Un message unicode avec des quotes " \\"'
    ... )
    >>> mo.append(entry1)
    >>> mo.append(entry2)
    >>> mo.append(entry3)
    >>> print mo
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
    # class MOFile {{{

    def __init__(self, fpath=None, wrapwidth=78):
        """
        MOFile constructor.
        See _BaseFile.__construct.
        """
        _BaseFile.__init__(self, fpath, wrapwidth)
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


class _BaseEntry(object):
    """
    Base class for POEntry or MOEntry objects.
    This class must *not* be instanciated directly.
    """
    # class _BaseEntry {{{

    def __init__(self, *args, **kwargs):
        """Base Entry constructor."""
        self.msgid = _dictget(kwargs, 'msgid', '')
        self.msgstr = _dictget(kwargs, 'msgstr', '')
        self.msgid_plural = _dictget(kwargs, 'msgid_plural', '')
        self.msgstr_plural = _dictget(kwargs, 'msgstr_plural', {})
        self.obsolete = _dictget(kwargs, 'obsolete', False)

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
            keys = msgstrs.keys()
            keys.sort()
            for index in keys:
                msgstr = msgstrs[index]
                plural_index = '[%s]' % index
                ret += self._str_field("msgstr", delflag, plural_index, msgstr)
        else:
            # otherwise write the msgstr
            ret += self._str_field("msgstr", delflag, "", self.msgstr)
        _listappend(ret, '')
        return _strjoin('\n', ret)

    def _str_field(self, fieldname, delflag, plural_index, field):
        field = self._decode(field)
        lines = field.splitlines(True) # keep line breaks in strings
        # potentially, we could do line-wrapping here, but textwrap.wrap
        # treats whitespace too carelessly for us to use it.
        if len(lines) > 1:
            lines = ['']+lines # start with initial empty line
        else:
            lines = [field] # needed for the empty string case
        ret = ['%s%s%s "%s"' % (delflag, fieldname, plural_index,
                                quote(_listpop(lines, 0)))]
        for mstr in lines:
            _listappend(ret, '%s"%s"' % (delflag, quote(mstr)))
        return ret

    def _decode(self, st):
        if isinstance(st, unicode):
            return st.encode(encoding)
        return st
    # }}}


class POEntry(_BaseEntry):
    """
    Represents a po file entry.

    **Examples**:

    >>> entry = POEntry(msgid='Welcome', msgstr='Bienvenue')
    >>> entry.occurrences = [('welcome.py', 12), ('anotherfile.py', 34)]
    >>> print entry
    #: welcome.py:12 anotherfile.py:34
    msgid "Welcome"
    msgstr "Bienvenue"
    <BLANKLINE>
    >>> entry = POEntry()
    >>> entry.occurrences = [('src/spam.c', 32), ('src/eggs.c', 45)]
    >>> entry.tcomment = 'A plural translation'
    >>> entry.flags.append('c-format')
    >>> entry.msgid = 'I have spam but no egg !'
    >>> entry.msgid_plural = 'I have spam and %d eggs !'
    >>> entry.msgstr_plural[0] = "J'ai du jambon mais aucun oeuf !"
    >>> entry.msgstr_plural[1] = "J'ai du jambon et %d oeufs !"
    >>> print entry
    # A plural translation
    #: src/spam.c:32 src/eggs.c:45
    #, c-format
    msgid "I have spam but no egg !"
    msgid_plural "I have spam and %d eggs !"
    msgstr[0] "J'ai du jambon mais aucun oeuf !"
    msgstr[1] "J'ai du jambon et %d oeufs !"
    <BLANKLINE>
    """
    # class POEntry {{{

    def __init__(self, *args, **kwargs):
        """POEntry constructor."""
        _BaseEntry.__init__(self, *args, **kwargs)
        self.comment = _dictget(kwargs, 'comment', '')
        self.tcomment = _dictget(kwargs, 'tcomment', '')
        self.occurrences = _dictget(kwargs, 'occurrences', [])
        # XXX will be removed in next version
        if _dictget(kwargs, 'occurences') is not None:
            self.occurences = _dictget(kwargs, 'occurences')
        self.flags = _dictget(kwargs, 'flags', [])

    def __str__(self, wrapwidth=78):
        """
        Return the string representation of the entry.
        """
        if self.obsolete:
            return _BaseEntry.__str__(self)
        ret = []
        # comment first, if any (with text wrapping as xgettext does)
        if self.comment != '':
            comments = _strsplit(self._decode(self.comment), '\n')
            for comment in comments:
                if wrapwidth > 0 and len(comment) > wrapwidth-3:
                    lines = _textwrap(comment, wrapwidth,
                                      initial_indent='#. ',
                                      subsequent_indent='#. ',
                                      break_long_words=False)
                    _listappend(ret, lines)
                else:
                    _listappend(ret, '#. %s' % comment)
        # translator comment, if any (with text wrapping as xgettext does)
        if self.tcomment != '':
            tcomments = _strsplit(self._decode(self.tcomment), '\n')
            for tcomment in tcomments:
                if wrapwidth > 0 and len(tcomment) > wrapwidth-2:
                    lines = _textwrap(tcomment, wrapwidth,
                                      initial_indent='# ',
                                      subsequent_indent='# ',
                                      break_long_words=False)
                    _listappend(ret, lines)
                else:
                    _listappend(ret, '# %s' % tcomment)
        # occurrences (with text wrapping as xgettext does)
        if self.occurrences:
            filelist = []
            for fpath, lineno in self.occurrences:
                _listappend(filelist, '%s:%s' % (self._decode(fpath), lineno))
            filestr = _strjoin(' ', filelist)
            if wrapwidth > 0 and len(filestr)+3 > wrapwidth:
                # XXX textwrap split words that contain hyphen, this is not
                # what we want for filenames, so the dirty hack is to
                # temporally replace hyphens with a char that a file cannot
                # contain, like "*"
                lines = _strreplace(filestr, '-', '*')
                lines = _textwrap(filestr, wrapwidth,
                                  initial_indent='#: ',
                                  subsequent_indent='#: ',
                                  break_long_words=False)
                # end of the replace hack
                for line in lines:
                    _listappend(ret, _strreplace(line, '*', '-'))
            else:
                _listappend(ret, '#: '+filestr)
        # flags
        if self.flags:
            flags = []
            for flag in self.flags:
                _listappend(flags, flag)
            _listappend(ret, '#, %s' % _strjoin(', ', flags))
        _listappend(ret, _BaseEntry.__str__(self))
        return _strjoin('\n', ret)

    def __cmp__(self, other):
        """ Called by comparison operations if rich comparison is not defined. """
        def compareOccurrences(a, b):
            """
            Compare an entry occurrence with another one.
            """
            # compareOccurrences {{{
            if a[0] != b[0]:
                if a[0] > b[0]: return 1
                else: return -1

            if a[1] != b[1]:
                if int(a[1]) > int(b[1]): return 1
                else: return -1

            return 0
            # }}}

        # First: Obsolete test
        if self.obsolete != other.obsolete:
            if self.obsolete: return -1
            else: return 1

        # Work on a copy to protect original
        occ1 = self.occurrences[:]
        occ2 = other.occurrences[:]

        # Sorting using compare method
        occ1.sort(compareOccurrences)
        occ2.sort(compareOccurrences)

        # Comparing sorted occurrences
        pos = 0
        for entry1 in occ1:
            try:
                entry2 = occ2[pos]
            except IndexError:
                break

            if entry1[0] != entry2[0]:
                if entry1[0] > entry2[0]: return 1
                else: return -1

            if entry1[1] != entry2[1]:
                if int(entry1[1]) > int(entry2[1]): return 1
                else: return -1

            pos += 1

        # Finally: Compare message ID
        if self.msgid > other.msgid: return 1
        else: return -1

    def translated(self):
        """Return True if the entry has been translated or False"""
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

    def __getattr__(self, name):
        if name == 'occurences':
            warnings.warn(
                '"occurences" property is deprecated (it was a typo), '\
                'please use "occurrences" instead'
            )
            return self.occurrences
        return object.__getattr__(self, name)

    def __setattr__(self, name, value):
        if name == 'occurences':
            warnings.warn(
                '"occurences" property is deprecated (it was a typo), '\
                'please use "occurrences" instead'
            )
            self.occurrences = value
        else:
            object.__setattr__(self, name, value)

    # }}}


class MOEntry(_BaseEntry):
    """
    Represents a mo file entry.

    **Examples**:

    >>> entry = MOEntry()
    >>> entry.msgid  = 'translate me !'
    >>> entry.msgstr = 'traduisez moi !'
    >>> print entry
    msgid "translate me !"
    msgstr "traduisez moi !"
    <BLANKLINE>
    """
    # class MOEntry {{{

    def __str__(self, wrapwidth=78):
        """
        Return the string representation of the entry.
        """
        return _BaseEntry.__str__(self, wrapwidth)
    # }}}


class _POFileParser(object):
    """
    A finite state machine to parse efficiently and correctly po
    file format.
    """
    # class _POFileParser {{{
    def __init__(self, fpath):
        """
        Constructor.

        **Keyword argument**:
          - *fpath*: string, path to the po file
        """
        self.fhandle = open(fpath, 'r')
        self.instance = POFile(fpath=fpath)
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
            line = _strstrip(line)
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
            _listappend(self.instance, self.current_entry)
        # before returning the instance, check if there's metadata and if
        # so extract it in a dict
        firstentry = self.instance[0]
        if firstentry.msgid == '': # metadata found
            # remove the entry
            firstentry = _listpop(self.instance, 0)
            self.instance.metadata_is_fuzzy = firstentry.flags
            key = None
            for msg in firstentry.msgstr.splitlines():
                try:
                    key, val = _strsplit(msg, ':', 1)
                    self.instance.metadata[key] = _strstrip(val)
                except:
                    if key is not None:
                        self.instance.metadata[key] += '\n'+_strstrip(msg)
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
        except Exception, e:
            raise IOError('Syntax error in po file (line %s): %s' % \
                (linenum, e))

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
            _listappend(self.instance, self.current_entry)
            self.current_entry = POEntry()
        if self.current_entry.tcomment != '':
            self.current_entry.tcomment += '\n'
        self.current_entry.tcomment += self.current_token[2:]
        return True

    def handle_gc(self):
        """Handle a generated comment."""
        if self.current_state in ['MC', 'MS', 'MX']:
            _listappend(self.instance, self.current_entry)
            self.current_entry = POEntry()
        if self.current_entry.comment != '':
            self.current_entry.comment += '\n'
        self.current_entry.comment += self.current_token[3:]
        return True

    def handle_oc(self):
        """Handle a file:num occurence."""
        if self.current_state in ['MC', 'MS', 'MX']:
            _listappend(self.instance, self.current_entry)
            self.current_entry = POEntry()
        occurrences = _strsplit(self.current_token[3:])
        for occurrence in occurrences:
            if occurrence != '':
                fil, line = _strsplit(occurrence, ':')
                _listappend(self.current_entry.occurrences, (fil, line))
        return True

    def handle_fl(self):
        """Handle a flags line."""
        if self.current_state in ['MC', 'MS', 'MX']:
            _listappend(self.instance, self.current_entry)
            self.current_entry = POEntry()
        self.current_entry.flags += _strsplit(self.current_token[3:], ', ')
        return True

    def handle_mi(self):
        """Handle a msgid."""
        if self.current_state in ['MC', 'MS', 'MX']:
            _listappend(self.instance, self.current_entry)
            self.current_entry = POEntry()
        self.current_entry.obsolete = self.entry_obsolete
        self.current_entry.msgid = unquote(self.current_token[7:-1])
        return True

    def handle_mp(self):
        """Handle a msgid plural."""
        self.current_entry.msgid_plural = unquote(self.current_token[14:-1])
        return True

    def handle_ms(self):
        """Handle a msgstr."""
        self.current_entry.msgstr = unquote(self.current_token[8:-1])
        return True

    def handle_mx(self):
        """Handle a msgstr plural."""
        index, value = self.current_token[7], self.current_token[11:-1]
        self.current_entry.msgstr_plural[index] = unquote(value)
        self.msgstr_index = index
        return True

    def handle_mc(self):
        """Handle a msgid or msgstr continuation line."""
        if self.current_state == 'MI':
            self.current_entry.msgid += unquote(self.current_token[1:-1])
        elif self.current_state == 'MP':
            self.current_entry.msgid_plural += \
                unquote(self.current_token[1:-1])
        elif self.current_state == 'MS':
            self.current_entry.msgstr += unquote(self.current_token[1:-1])
        elif self.current_state == 'MX':
            msgstr = self.current_entry.msgstr_plural[self.msgstr_index] +\
                unquote(self.current_token[1:-1])
            self.current_entry.msgstr_plural[self.msgstr_index] = msgstr
        # don't change the current state
        return False
    # }}}


class _MOFileParser(object):
    """
    A class to parse binary mo files.
    """
    # class _MOFileParser {{{
    def __init__(self, fpath):
        """_MOFileParser constructor."""
        self.fhandle = open(fpath, 'rb')
        self.instance = MOFile(fpath)

    def parse_magicnumber(self):
        """
        Parse the magic number and raise an exception if not valid.
        """
        magic_number = self._readbinary(fmt='4s')
        # magic number must be 0xde120495 or 0x950412de
        if magic_number not in ['\xde\x12\x04\x95', '\x95\x04\x12\xde']:
            raise IOError('Invalid mo file, magic number is incorrect !')
        self.instance.magic_number = magic_number

    def parse(self):
        """
        Build the instance with the file handle provided in the
        constructor.
        """
        self.parse_magicnumber()
        # parse the version number
        self.instance.version = self._readbinary('L')
        # parse the number of strings
        numofstrings = self._readbinary('L')
        # original strings hash table offset
        msgids_hash_offset = self._readbinary('L')
        # translation strings hash table offset
        msgstrs_hash_offset = self._readbinary('P')
        # move to msgid hash table and read length and offset of msgids
        self.fhandle.seek(msgids_hash_offset)
        msgids_index = []
        for i in range(numofstrings):
            _listappend(msgids_index, self._readbinary('LL'))
        # move to msgstr hash table and read length and offset of msgstrs
        self.fhandle.seek(msgstrs_hash_offset)
        msgstrs_index = []
        for i in range(numofstrings):
            _listappend(msgstrs_index, self._readbinary('LL'))
        # build entries
        for i in range(numofstrings):
            self.fhandle.seek(msgids_index[i][1])
            msgid = self.fhandle.read(msgids_index[i][0])
            self.fhandle.seek(msgstrs_index[i][1])
            msgstr = self.fhandle.read(msgstrs_index[i][0])
            if i == 0: # metadata
                raw_metadata, metadata = _strsplit(msgstr, '\n'), {}
                for line in raw_metadata:
                    tokens = _strsplit(line, ':', 1)
                    if tokens[0] != '':
                        try:
                            metadata[tokens[0]] = _strstrip(tokens[1])
                        except IndexError:
                            metadata[tokens[0]] = ''
                self.instance.metadata = metadata
                continue
            entry = MOEntry(msgid=msgid, msgstr=msgstr)
            _listappend(self.instance, entry)
        # close opened file
        self.fhandle.close()
        return self.instance

    def _readbinary(self, fmt='c'):
        """
        Private method that unpack n bytes of data using format <fmt>.
        It returns a tuple or a mixed value if the tuple length is 1.
        """
        numbytes = struct.calcsize(fmt)
        bytes = self.fhandle.read(numbytes)
        tup = struct.unpack(fmt, bytes)
        if len(tup) == 1:
            return tup[0]
        return tup
    # }}}


if __name__ == '__main__':
    """
    **Main function**::
      - to **test** the module just run: *python polib.py [-v]*
      - to **profile** the module: *python polib.py -p <some_pofile.po>*
    """
    # main function {{{
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

