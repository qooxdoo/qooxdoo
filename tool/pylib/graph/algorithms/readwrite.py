# Copyright (c) 2007-2009 Pedro Matiello <pmatiello@gmail.com>
#
# Permission is hereby granted, free of charge, to any person
# obtaining a copy of this software and associated documentation
# files (the "Software"), to deal in the Software without
# restriction, including without limitation the rights to use,
# copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the
# Software is furnished to do so, subject to the following
# conditions:

# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
# OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
# HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
# WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
# OTHER DEALINGS IN THE SOFTWARE.


"""
Functions for reading and writing graphs.

@sort: read_xml, write_xml, write_dot_graph, write_dot_digraph, write_dot_hypergraph
"""


# Imports
from xml.dom.minidom import Document, parseString


# Values
colors = ['aquamarine4', 'blue4', 'brown4', 'cornflowerblue', 'cyan4',
            'darkgreen', 'darkorange3', 'darkorchid4', 'darkseagreen4', 'darkslategray',
            'deeppink4', 'deepskyblue4', 'firebrick3', 'hotpink3', 'indianred3',
            'indigo', 'lightblue4', 'lightseagreen', 'lightskyblue4', 'magenta4',
            'maroon', 'palevioletred3', 'steelblue', 'violetred3']


# XML

def write_xml(graph):
    """
    Return a string specifying the given graph as a XML document.
    
    @type  graph: graph
    @param graph: Graph.

    @rtype:  string
    @return: String specifying the graph as a XML document.
    """

    # Document root
    grxml = Document()
    grxmlr = grxml.createElement('graph')
    grxml.appendChild(grxmlr)

    # Each node...
    for each_node in graph.nodes():
        node = grxml.createElement('node')
        node.setAttribute('id',str(each_node))
        grxmlr.appendChild(node)
        for each_attr in graph.get_node_attributes(each_node):
            attr = grxml.createElement('attribute')
            attr.setAttribute('attr', each_attr[0])
            attr.setAttribute('value', each_attr[1])
            node.appendChild(attr)

    # Each edge...
    for edge_from, edge_to in graph.edges():
        edge = grxml.createElement('edge')
        edge.setAttribute('from',str(edge_from))
        edge.setAttribute('to',str(edge_to))
        edge.setAttribute('wt',str(graph.get_edge_weight(edge_from, edge_to)))
        edge.setAttribute('label',str(graph.get_edge_label(edge_from, edge_to)))
        grxmlr.appendChild(edge)
        for attr_name, attr_value in graph.get_edge_attributes(edge_from, edge_to):
            attr = grxml.createElement('attribute')
            attr.setAttribute('attr', attr_name)
            attr.setAttribute('value', attr_value)
            edge.appendChild(attr)

    return grxml.toprettyxml()


def write_xml_hypergraph(hypergraph):
    """
    Return a string specifying the given hypergraph as a XML document.
    
    @type  hypergraph: hypergraph
    @param hypergraph: Hypergraph.

    @rtype:  string
    @return: String specifying the graph as a XML document.
    """

    # Document root
    grxml = Document()
    grxmlr = grxml.createElement('hypergraph')
    grxml.appendChild(grxmlr)

    # Each node...
    nodes = hypergraph.nodes()
    hyperedges = hypergraph.get_hyperedges()
    for each_node in (nodes + hyperedges):
        if (each_node in nodes):
            node = grxml.createElement('node')
        else:
            node = grxml.createElement('hyperedge')
        node.setAttribute('id',str(each_node))
        grxmlr.appendChild(node)

        # and its outgoing edge
        for each_edge in hypergraph.get_links(each_node):
            edge = grxml.createElement('link')
            edge.setAttribute('to',str(each_edge))
            node.appendChild(edge)

    return grxml.toprettyxml()


def read_xml(graph, string):
    """
    Read a graph from a XML document. Nodes and edges specified in the input will be added to the current graph.
    
    @type  graph: graph
    @param graph: Graph

    @type  string: string
    @param string: Input string in XML format specifying a graph.
    """
    dom = parseString(string)
    
    # Read nodes...
    for each_node in dom.getElementsByTagName("node"):
        graph.add_node(each_node.getAttribute('id'))
        for each_attr in each_node.getElementsByTagName("attribute"):
            graph.add_node_attribute(each_node.getAttribute('id'), (each_attr.getAttribute('attr'),
                each_attr.getAttribute('value')))

    # Read edges...
    for each_edge in dom.getElementsByTagName("edge"):
        graph.add_edge(each_edge.getAttribute('from'), each_edge.getAttribute('to'), \
            wt=float(each_edge.getAttribute('wt')), label=each_edge.getAttribute('label'))
        for each_attr in each_edge.getElementsByTagName("attribute"):
            attr_tuple = (each_attr.getAttribute('attr'), each_attr.getAttribute('value'))
            if (attr_tuple not in graph.get_edge_attributes(each_edge.getAttribute('from'), \
                each_edge.getAttribute('to'))):
                graph.add_edge_attribute(each_edge.getAttribute('from'), \
                    each_edge.getAttribute('to'), attr_tuple)


def read_xml_hypergraph(hypergraph, string):
    """
    Read a graph from a XML document. Nodes and hyperedges specified in the input will be added to the current graph.
    
    @type  hypergraph: hypergraph
    @param hypergraph: Hypergraph

    @type  string: string
    @param string: Input string in XML format specifying a graph.
    """
    dom = parseString(string)
    for each_node in dom.getElementsByTagName("node"):
        hypergraph.add_nodes(each_node.getAttribute('id'))
    for each_node in dom.getElementsByTagName("hyperedge"):
        hypergraph.add_hyperedges(each_node.getAttribute('id'))
    dom = parseString(string)
    for each_node in dom.getElementsByTagName("node"):
        for each_edge in each_node.getElementsByTagName("link"):
            hypergraph.link(each_node.getAttribute('id'), each_edge.getAttribute('to'))


# DOT Language

def _dot_node_str(graph, node, wt):
    line = '\t"%s" [ ' % str(node)
    attrlist = graph.get_node_attributes(node)
    for each in attrlist:
        attr = '%s="%s" ' % (each[0], each[1])
        line = line + attr
    line = line + ']\n'
    return line


def _dot_edge_str(graph, u, v, wt):
    line = '\t"%s" -- "%s" [ ' % (str(u), str(v))
    attrlist = graph.get_edge_attributes(u, v) + [('label',graph.get_edge_label(u, v))]
    for each in attrlist:
        attr = '%s="%s" ' % (each[0], each[1])
        line = line + attr
    line = line + ']\n'
    return line


def _dot_arrow_str(graph, u, v, wt):
    line = '\t"%s" -> "%s" [ ' % (str(u), str(v))
    attrlist = graph.get_edge_attributes(u, v) + [('label',graph.get_edge_label(u, v))]
    for each in attrlist:
        attr = '%s="%s" ' % (each[0], each[1])
        line = line + attr
    line = line + ']\n'
    return line


def write_dot_graph(graph, wt):
    """
    Return a string specifying the given graph in DOT Language.
    
    @type  graph: graph
    @param graph: Graph.

    @type  wt: boolean
    @param wt: Whether edges should be labelled with its weight.

    @rtype:  string
    @return: String specifying the graph in DOT Language.
    """
    doc = 'graph graphname \n{\n'
    for node in graph:
        doc = doc + _dot_node_str(graph, node, wt)
        for edge in graph[node]:
            if (node >= edge):
                doc = doc + _dot_edge_str(graph, node, edge, wt)
    doc = doc + '}'
    return doc


def write_dot_digraph(graph, wt):
    """
    Return a string specifying the given digraph in DOT Language.
    
    @type  graph: graph
    @param graph: Graph.

    @type  wt: boolean
    @param wt: Whether arrows should be labelled with its weight.

    @rtype:  string
    @return: String specifying the graph in DOT Language.
    """
    doc = 'digraph graphname \n{\n'
    for node in graph:
        doc = doc + _dot_node_str(graph, node, wt)
        for edge in graph[node]:
            doc = doc + _dot_arrow_str(graph, node, edge, wt)
    doc = doc + '}'
    return doc


def write_dot_hypergraph(hypergraph, coloured=False):
    """
    Return a string specifying the given hypergraph in DOT Language.
    
    @type  hypergraph: hypergraph
    @param hypergraph: Hypergraph.
    
    @type  coloured: boolean
    @param coloured: Whether hyperedges should be coloured.

    @rtype:  string
    @return: String specifying the hypergraph in DOT Language.
    """
    # Start document
    doc = ""
    doc = doc + "graph graphname" + "\n{\n"
    colortable = {}
    colorcount = 0


    # Add hyperedges
    color = ''
    for each_hyperedge in hypergraph.hyperedges():
        colortable[each_hyperedge] = colors[colorcount % len(colors)]
        colorcount = colorcount + 1
        if (coloured):
            color = " color=%s" % colortable[each_hyperedge]
        vars = {
            'hyperedge' : str(each_hyperedge),
            'color' : color
        }
        doc = doc + '\t"%(hyperedge)s" [shape=point %(color)s]\n' % vars
    
    color = "\n"
    # Add nodes and links
    for each_node in hypergraph.nodes():
        doc = doc + "\t\"%s\"\n" % str(each_node)
        for each_link in hypergraph.links(each_node):
            if (coloured):
                color = " [color=%s]\n" % colortable[each_link]
            linkvars = {
                'node' : str(each_node),
                'hyperedge' : str(each_link)
            }
            doc = doc + '\t %(node)s -- %(hyperedge)s' % linkvars + color

    doc = doc + "}"
    return doc
