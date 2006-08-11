package org.json;

/*
Copyright (c) 2002 JSON.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

The Software shall be used for Good, not Evil.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import java.text.ParseException;

/**
 * The XMLTokener extends the JSONTokener to provide additional methods
 * for the parsing of XML texts.
 * @author JSON.org
 * @version 0.1
 */
public class XMLTokener extends JSONTokener {


   /** The table of entity values. It initially contains Character values for
    * amp, apos, gt, lt, quot.
    */
   public static final java.util.HashMap entity;

   static {
       entity = new java.util.HashMap(8);
       entity.put("amp",  XML.AMP);
       entity.put("apos", XML.APOS);
       entity.put("gt",   XML.GT);
       entity.put("lt",   XML.LT);
       entity.put("quot", XML.QUOT);
   }

    /**
     * Construct an XMLTokener from a string.
     * @param s A source string.
     */
    public XMLTokener(String s) {
        super(s);
    }


    /**
     * Get the next XML outer token, trimming whitespace. There are two kinds
     * of tokens: the '<' character which begins a markup tag, and the content
     * text between markup tags.
     *
     * @return  A string, or a '<' Character, or null if there is no more
     * source text.
     * @throws ParseException
     */
    public Object nextContent() throws ParseException {
        char         c;
        StringBuffer sb;
        do {
            c = next();
        } while (Character.isWhitespace(c));
        if (c == 0) {
            return null;
        }
        if (c == '<') {
            return XML.LT;
        }
        sb = new StringBuffer();
        while (true) {
            if (c == '<' || c == 0) {
                back();
                return sb.toString().trim();
            }
            if (c == '&') {
                sb.append(nextEntity(c));
            } else {
                sb.append(c);
            }
            c = next();
        }
    }


    /**
     * Return the next entity. These entities are translated to Characters:
     *     &amp;  &apos;  &gt;  &lt;  &quot;
     * @param a An ampersand character.
     * @return  A Character or an entity String if the entity is not recognized.
     * @throws ParseException Missing ';' in XML entity
     */
    public Object nextEntity(char a) throws ParseException {
        StringBuffer sb = new StringBuffer();
        while (true) {
            char c = next();
            if (Character.isLetter(c)) {
                sb.append(Character.toLowerCase(c));
            } else if (c == ';') {
                break;
            } else {
                throw syntaxError("Missing ';' in XML entity: &" + sb);
            }
        }
        String s = sb.toString();
        Object e = entity.get(s);
        return e != null ? e : a + s + ";";
    }


    /**
     * Returns the next XML meta token. This is used for skipping over <!...>
     * and <?...?> structures.
     * @return Syntax characters (< > / = ! ?) are returned as Character, and
     * strings and names are returned as Boolean. We don't care what the
     * values actually are.
     * @throws ParseException
     */
    public Object nextMeta() throws ParseException {
        char c;
        char q;
        do {
            c = next();
        } while (Character.isWhitespace(c));
        switch (c) {
        case 0:
            throw syntaxError("Misshaped meta tag.");
        case '<':
            return XML.LT;
        case '>':
            return XML.GT;
        case '/':
            return XML.SLASH;
        case '=':
            return XML.EQ;
        case '!':
            return XML.BANG;
        case '?':
            return XML.QUEST;
        case '"':
        case '\'':
            q = c;
            while (true) {
                c = next();
                if (c == 0) {
                    throw syntaxError("Unterminated string.");
                }
                if (c == q) {
                    return Boolean.TRUE;
                }
            }
        default:
            while (true) {
                c = next();
                if (Character.isWhitespace(c)) {
                    return Boolean.TRUE;
                }
                switch (c) {
                case 0:
                case '<':
                case '>':
                case '/':
                case '=':
                case '!':
                case '?':
                case '"':
                case '\'':
                    back();
                    return Boolean.TRUE;
                }
            }
        }
    }


    /**
     * Get the next XML Token. These tokens are found inside of angle
     * brackets. It may be one of these characters: / > = ! ? or it may be a
     * string wrapped in single quotes or double quotes, or it may be a name.
     * @return a String or a Character.
     * @throws ParseException
     */
    public Object nextToken() throws ParseException {
        char c;
        char q;
        StringBuffer sb;
        do {
            c = next();
        } while (Character.isWhitespace(c));
        switch (c) {
        case 0:
            throw syntaxError("Misshaped element.");
        case '<':
            throw syntaxError("Misplaced '<'.");
        case '>':
            return XML.GT;
        case '/':
            return XML.SLASH;
        case '=':
            return XML.EQ;
        case '!':
            return XML.BANG;
        case '?':
            return XML.QUEST;

// Quoted string

        case '"':
        case '\'':
            q = c;
            sb = new StringBuffer();
            while (true) {
                c = next();
                if (c == 0) {
                    throw syntaxError("Unterminated string.");
                }
                if (c == q) {
                    return sb.toString();
                }
                if (c == '&') {
                    sb.append(nextEntity(c));
                } else {
                    sb.append(c);
                }
            }
        default:

// Name

            sb = new StringBuffer();
            while (true) {
                sb.append(c);
                c = next();
                if (Character.isWhitespace(c)) {
                    return sb.toString();
                }
                switch (c) {
                case 0:
                case '>':
                case '/':
                case '=':
                case '!':
                case '?':
                    back();
                    return sb.toString();
                case '<':
                case '"':
                case '\'':
                    throw syntaxError("Bad character in a name.");
                }
            }
        }
    }
}
