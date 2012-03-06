# Copyright (c) 2008-2009 Pedro Matiello <pmatiello@gmail.com>
#                         Christian Muise <christian.muise@gmail.com>
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
Hypergraph class
"""


# Imports
from Graph import *


class hypergraph (object):
    """
    Hypergraph class.
    
    Hypergraphs are a generalization of graphs where an edge (called hyperedge) can connect more
    than two nodes.
    
    @sort: __init__, __len__, __str__, add_hyperedge, add_hyperedges, add_node,    add_nodes, has_node,
    hyperedges, link, links, nodes, unlink, read, write, accessibility,    connected_components,
    cut_hyperedges, cut_nodes
    """


    def __init__(self):
        """
        Initialize a hypergraph.
        """
        self.node_links = {}    # Pairing: Node -> Hyperedge
        self.edge_links = {}     # Pairing: Hyperedge -> Node
        self.graph = graph()    # Ordinary graph


    def __str__(self):
        """
        Return a string representing the hypergraph when requested by str() (or print).

        @rtype:  string
        @return: String representing the hypergraph.
        """
        return "<hypergraph object " + str(self.nodes()) + " " + str(self.edge_links) + ">"


    def __len__(self):
        """
        Return the size of the hypergraph when requested by len().

        @rtype:  number
        @return: Size of the hypergraph.
        """
        return len(self.node_links)


    def read(self, string, fmt='xml'):
        """
        Read a hypergraph from a string. Nodes and hyperedges specified in the input will be added
        to the current graph.
        
        @type  string: string
        @param string: Input string specifying a graph.

        @type  fmt: string
        @param fmt: Input format. Possible formats are:
            1. 'xml' - XML (default)
        """
        if (fmt == 'xml'):
            readwrite.read_xml_hypergraph(self, string)


    def write(self, fmt='xml'):
        """
        Write the hypergraph to a string. Depending of the output format, this string can be used by
        read() to rebuild the graph.
        
        @type  fmt: string
        @param fmt: Output format. Possible formats are:
            1. 'xml' - XML (default)
            2. 'dot' - DOT Language (for GraphViz)
            3. 'dotclr' - DOT Language, coloured

        @rtype:  string
        @return: String specifying the graph.
        """
        if (fmt == 'xml'):
            return readwrite.write_xml_hypergraph(self)
        elif (fmt == 'dot'):
            return readwrite.write_dot_hypergraph(self)
        elif (fmt == 'dotclr'):
            return readwrite.write_dot_hypergraph(self, coloured=True)
    

    def nodes(self):
        """
        Return node list.
        
        @rtype:  list
        @return: Node list.
        """
        return self.node_links.keys()


    def hyperedges(self):
        """
        Return hyperedge list.

        @rtype:  list
        @return: List of hyperedges linked to the given node.
        """
        return self.edge_links.keys()


    def links(self, obj):
        """
        Return all objects linked to the given one.
        
        If given a node, linked hyperedges will be returned. If given a hyperedge, linked nodes will
        be returned.
        
        @type  obj: node or hyperedge
        @param obj: Object identifier.
        
        @rtype:  list
        @return: List of objects linked to the given one.
        """
        if (obj in self.node_links):
            return self.node_links[obj]
        else:
            return self.edge_links[obj]


    def has_node(self, node):
        """
        Return whether the requested node exists.

        @type  node: node
        @param node: Node identifier

        @rtype:  boolean
        @return: Truth-value for node existence.
        """
        return self.node_links.has_key(node)


    def add_node(self, node):
        """
        Add given node to the hypergraph.
        
        @attention: While nodes can be of any type, it's strongly recommended to use only numbers
        and single-line strings as node identifiers if you intend to use write().

        @type  node: node
        @param node: Node identifier.
        """
        if (not node in self.node_links):
            self.node_links[node] = []
            self.graph.add_node((node,'n'))


    def add_nodes(self, nodelist):
        """
        Add given nodes to the hypergraph.
        
        @attention: While nodes can be of any type, it's strongly recommended to use only numbers
        and single-line strings as node identifiers if you intend to use write().

        @type  nodelist: list
        @param nodelist: List of nodes to be added to the graph.
        """
        for each in nodelist:
            self.add_node(each)


    def add_hyperedge(self, hyperedge):
        """
        Add given hyperedge to the hypergraph.

        @attention: While hyperedge-nodes can be of any type, it's strongly recommended to use only
        numbers and single-line strings as node identifiers if you intend to use write().
        
        @type  hyperedge: hyperedge
        @param hyperedge: Hyperedge identifier.
        """
        if (not hyperedge in self.edge_links):
            self.edge_links[hyperedge] = []
            self.graph.add_node((hyperedge,'h'))


    def add_hyperedges(self, edgelist):
        """
        Add given hyperedges to the hypergraph.

        @attention: While hyperedge-nodes can be of any type, it's strongly recommended to use only
        numbers and single-line strings as node identifiers if you intend to use write().
        
        @type  edgelist: list
        @param edgelist: List of hyperedge-nodes to be added to the graph.
        """
        for each in edgelist:
            self.add_hyperedge(each)


    def link(self, node, hyperedge):
        """
        Link given node and hyperedge.

        @type  node: node
        @param node: Node.

        @type  hyperedge: node
        @param hyperedge: Hyperedge.
        """
        if (hyperedge not in self.node_links[node]):
            self.node_links[node].append(hyperedge)
            self.edge_links[hyperedge].append(node)
            self.graph.add_edge((node,'n'), (hyperedge,'h'))


    def unlink(self, node, hyperedge):
        """
        Unlink given node and hyperedge.

        @type  node: node
        @param node: Node.

        @type  hyperedge: hyperedge
        @param hyperedge: Hyperedge.
        """
        self.node_links[node].remove(hyperedge)
        self.edge_links[hyperedge].remove(node)


    def accessibility(self):
        """
        Accessibility matrix (transitive closure).

        @rtype:  dictionary
        @return: Accessibility information for each node.
        """
        access_ = accessibility.accessibility(self.graph)
        access = {}
        
        for each in access_.keys():
            if (each[1] == 'n'):
                access[each[0]] = []
                for other in access_[each]:
                    if (other[1] == 'n'):
                        access[each[0]].append(other[0])
        
        return access

    
    def connected_components(self):
        """
        Connected components.

        @rtype:  dictionary
        @return: Pairing that associates each node to its connected component.
        """
        components_ = accessibility.connected_components(self.graph)
        components = {}
        
        for each in components_.keys():
            if (each[1] == 'n'):
                components[each[0]] = components_[each]
        
        return components

    
    def cut_nodes(self):
        """
        Return the cut-nodes of the given hypergraph.
        
        @rtype:  list
        @return: List of cut-nodes.
        """
        cut_nodes_ = accessibility.cut_nodes(self.graph)
        cut_nodes = []
        
        for each in cut_nodes_:
            if (each[1] == 'n'):
                cut_nodes.append(each[0])
        
        return cut_nodes


    def cut_hyperedges(self):
        """
        Return the cut-hyperedges of the given hypergraph.
        
        @rtype:  list
        @return: List of cut-nodes.
        """
        cut_nodes_ = accessibility.cut_nodes(self.graph)
        cut_nodes = []
        
        for each in cut_nodes_:
            if (each[1] == 'h'):
                cut_nodes.append(each[0])
        
        return cut_nodes
        
    def rank(self):
        """
        Return the rank of the given hypergraph.
        
        @rtype:  int
        @return: Rank of graph.
        """
        max_rank = 0
        
        for each in hyperedges:
            if len(each) > max_rank:
                max_rank = len(each)
                
        return max_rank
