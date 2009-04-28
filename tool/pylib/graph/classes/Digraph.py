# Copyright (c) 2007-2009 Pedro Matiello <pmatiello@gmail.com>
#                         Nathan Davis <davisn90210@gmail.com>
#                         Zsolt Haraszti <zsolt@drawwell.net>
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
Digraph class
"""


# Imports
from graph import *
from graph.algorithms import filters

class digraph (object):
    """
    Digraph class.
    
    Digraphs are built of nodes and directed edges.

    @sort: __init__, __getitem__, __iter__, __len__, __str__, add_edge, add_edge_attribute,
    add_graph, add_node, add_node_attribute, add_nodes, add_spanning_tree, complete, degree,
    del_edge, del_node, edges, get_edge_attributes, get_edge_label, get_edge_weight,
    get_node_attributes, has_edge, has_node, incidents, inverse, neighbors, nodes, order,
    set_edge_label, set_edge_weight, traversal, generate, read, write, accessibility,
    breadth_first_search, cut_edges, cut_nodes, depth_first_search, heuristic_search,
    minimal_spanning_tree, mutual_accessibility, shortest_path, topological_sorting
    """


    def __init__(self):
        """
        Initialize a digraph.
        """
        self.node_neighbors = {}    # Pairing: Node -> Neighbors
        self.edge_properties = {}    # Pairing: Edge -> (Label, Weight)
        self.node_incidence = {}    # Pairing: Node -> Incident nodes
        self.node_attr = {}            # Pairing: Node -> Attributes
        self.edge_attr = {}            # Pairing: Edge -> Attributes


    def __str__(self):
        """
        Return a string representing the digraph when requested by str() (or print).

        @rtype:  string
        @return: String representing the graph.
        """
        return "<graph object " + str(self.nodes()) + " " + str(self.edges()) + ">"


    def __len__(self):
        """
        Return the order of the digraph when requested by len().

        @rtype:  number
        @return: Size of the graph.
        """
        return len(self.node_neighbors)


    def __iter__(self):
        """
        Return a iterator passing through all nodes in the digraph.
        
        @rtype:  iterator
        @return: Iterator passing through all nodes in the digraph.
        """
        for each in self.node_neighbors.iterkeys():
            yield each


    def __getitem__(self, node):
        """
        Return a iterator passing through all neighbors of the given node.
        
        @rtype:  iterator
        @return: Iterator passing through all neighbors of the given node.
        """
        for each in self.node_neighbors[node]:
            yield each


    def read(self, string, fmt='xml'):
        """
        Read a graph from a string. Nodes and edges specified in the input will be added to the
        current graph.
        
        @type  string: string
        @param string: Input string specifying a graph.

        @type  fmt: string
        @param fmt: Input format. Possible formats are:
            1. 'xml' - XML (default)
        """
        if (fmt == 'xml'):
            readwrite.read_xml(self, string)


    def write(self, fmt='xml'):
        """
        Write the graph to a string. Depending of the output format, this string can be used by
        read() to rebuild the graph.
        
        @type  fmt: string
        @param fmt: Output format. Possible formats are:
            1. 'xml' - XML (default)
            2. 'dot' - DOT Language (for GraphViz)
            3. 'dotwt' - DOT Language with weight information

        @rtype:  string
        @return: String specifying the graph.
        """
        if (fmt == 'xml'):
            return readwrite.write_xml(self)
        elif (fmt == 'dot'):
            return readwrite.write_dot_digraph(self, False)
        elif (fmt == 'dotwt'):
            return readwrite.write_dot_digraph(self, True)


    def generate(self, num_nodes, num_edges, weight_range=(1, 1)):
        """
        Add nodes and random edges to the graph.
        
        @type  num_nodes: number
        @param num_nodes: Number of nodes.
        
        @type  num_edges: number
        @param num_edges: Number of edges.

        @type  weight_range: tuple
        @param weight_range: tuple of two integers as lower and upper limits on randomly generated
        weights (uniform distribution).
        """
        generators.generate(self, num_nodes, num_edges, weight_range)


    def nodes(self):
        """
        Return node list.

        @rtype:  list
        @return: Node list.
        """
        return self.node_neighbors.keys()


    def neighbors(self, node):
        """
        Return all nodes that are directly accessible from given node.

        @type  node: node
        @param node: Node identifier

        @rtype:  list
        @return: List of nodes directly accessible from given node.
        """
        return self.node_neighbors[node]
    
    
    def incidents(self, node):
        """
        Return all nodes that are incident to the given node.
        
        @type  node: node
        @param node: Node identifier

        @rtype:  list
        @return: List of nodes directly accessible from given node.    
        """
        return self.node_incidence[node]
        
    
    
    def edges(self):
        """
        Return all edges in the graph.
        
        @rtype:  list
        @return: List of all edges in the graph.
        """
        return self.edge_properties.keys()


    def has_node(self, node):
        """
        Return whether the requested node exists.

        @type  node: node
        @param node: Node identifier

        @rtype:  boolean
        @return: Truth-value for node existence.
        """
        return self.node_neighbors.has_key(node)


    def add_node(self, node, attrs=[]):
        """
        Add given node to the graph.
        
        @attention: While nodes can be of any type, it's strongly recommended to use only numbers
        and single-line strings as node identifiers if you intend to use write().

        @type  node: node
        @param node: Node identifier.
        
        @type  attrs: list
        @param attrs: List of node attributes specified as (attribute, value) tuples.
        """
        if (node not in self.node_neighbors):
            self.node_neighbors[node] = []
            self.node_incidence[node] = []
            self.node_attr[node] = attrs


    def add_nodes(self, nodelist):
        """
        Add given nodes to the graph.
        
        @attention: While nodes can be of any type, it's strongly recommended to use only numbers
        and single-line strings as node identifiers if you intend to use write().

        @type  nodelist: list
        @param nodelist: List of nodes to be added to the graph.
        """
        for each in nodelist:
            self.add_node(each)


    def add_edge(self, u, v, wt=1, label='', attrs=[]):
        """
        Add an directed edge (u,v) to the graph connecting nodes u to v.

        @type  u: node
        @param u: One node.

        @type  v: node
        @param v: Other node.
        
        @type  wt: number
        @param wt: Edge weight.
        
        @type  label: string
        @param label: Edge label.
        
        @type  attrs: list
        @param attrs: List of node attributes specified as (attribute, value) tuples.
        """
        if (v not in self.node_neighbors[u]):
            self.node_neighbors[u].append(v)
            self.node_incidence[v].append(u)
            self.edge_properties[(u, v)] = [label, wt]
            self.edge_attr[(u, v)] = attrs


    def del_node(self, node):
        """
        Remove a node from the graph.
        
        @type  node: node
        @param node: Node identifier.
        """
        for each in list(self.incidents(node)):
            self.del_edge(each, node)
        for each in list(self.neighbors(node)):
            self.del_edge(node, each)
        del(self.node_neighbors[node])
        del(self.node_incidence[node])
        del(self.node_attr[node])


    def del_edge(self, u, v):
        """
        Remove an directed edge (u, v) from the graph.

        @type  u: node
        @param u: One node.

        @type  v: node
        @param v: Other node.
        """
        self.node_neighbors[u].remove(v)
        self.node_incidence[v].remove(u)
        del(self.edge_properties[(u,v)])
        del(self.edge_attr[(u,v)])


    def get_edge_weight(self, u, v):
        """
        Get the weight of an edge.

        @type  u: node
        @param u: One node.

        @type  v: node
        @param v: Other node.
        
        @rtype:  number
        @return: Edge weight.
        """
        return self.edge_properties[(u, v)][1]


    def set_edge_weight(self, u, v, wt):
        """
        Set the weight of an edge.

        @type  u: node
        @param u: One node.

        @type  v: node
        @param v: Other node.

        @type  wt: number
        @param wt: Edge weight.
        """
        self.edge_properties[(u, v)][1] = wt


    def get_edge_label(self, u, v):
        """
        Get the label of an edge.

        @type  u: node
        @param u: One node.

        @type  v: node
        @param v: Other node.
        
        @rtype:  string
        @return: Edge label
        """
        return self.edge_properties[(u, v)][0]


    def set_edge_label(self, u, v, label):
        """
        Set the label of an edge.

        @type  u: node
        @param u: One node.

        @type  v: node
        @param v: Other node.

        @type  label: string
        @param label: Edge label.
        """
        self.edge_properties[(u, v)][0] = label
    
    
    def add_node_attribute(self, node, attr):
        """
        Add attribute to the given node.

        @type  node: node
        @param node: Node identifier

        @type  attr: tuple
        @param attr: Node attribute specified as a tuple in the form (attribute, value).
        """
        self.node_attr[node] = self.node_attr[node] + [attr]


    def get_node_attributes(self, node):
        """
        Return the attributes of the given node.

        @type  node: node
        @param node: Node identifier

        @rtype:  list
        @return: List of attributes specified tuples in the form (attribute, value).
        """
        return self.node_attr[node]


    def add_edge_attribute(self, u, v, attr):
        """
        Add attribute to the given edge.

        @type  u: node
        @param u: One node.

        @type  v: node
        @param v: Other node.

        @type  attr: tuple
        @param attr: Node attribute specified as a tuple in the form (attribute, value).
        """
        self.edge_attr[(u,v)] = self.edge_attr[(u,v)] + [attr]


    def get_edge_attributes(self, u, v):
        """
        Return the attributes of the given edge.

        @type  u: node
        @param u: One node.

        @type  v: node
        @param v: Other node.

        @rtype:  list
        @return: List of attributes specified tuples in the form (attribute, value).
        """
        return self.edge_attr[(u,v)]


    def has_edge(self, u, v):
        """
        Return whether an edge between nodes u and v exists.

        @type  u: node
        @param u: One node.

        @type  v: node
        @param v: Other node.

        @rtype:  boolean
        @return: Truth-value for edge existence.
        """
        return self.edge_properties.has_key((u,v))

    
    def order(self, node):
        """
        Return the order of the given node.
        
        @rtype:  number
        @return: Order of the given node.
        """
        return len(self.neighbors(node))


    def degree(self, node):
        """
        Return the degree of the given node.
        
        @rtype:  number
        @return: Order of the given node.
        """
        return len(self.node_incidence[node])


    def complete(self):
        """
        Make the graph a complete graph.
        
        @attention: This will modify the current graph.
        """
        for each in self.nodes():
            for other in self.nodes():
                if (each != other):
                    self.add_edge(each, other)


    def inverse(self):
        """
        Return the inverse of the graph.
        
        @rtype:  graph
        @return: Complement graph for the graph.
        """
        inv = digraph()
        inv.add_nodes(self.nodes())
        inv.complete()
        for each in self.edges():
            inv.del_edge(each[0], each[1])
        return inv


    def add_graph(self, graph):
        """
        Add other graph to the graph.
        
        @attention: Attributes and labels are not preserved.
        
        @type  graph: graph
        @param graph: Graph
        """
        self.add_nodes(graph.nodes())
        for each_node in graph.nodes():
            for each_edge in graph.neighbors(each_node):
                self.add_edge(each_node, each_edge)


    def add_spanning_tree(self, st):
        """
        Add a spanning tree to the graph.
        
        @type  st: dictionary
        @param st: Spanning tree.
        """
        self.add_nodes(st.keys())
        for each in st:
            if (st[each] is not None):
                self.add_edge(st[each], each)


    def traversal(self, node, order='pre'):
        """
        Graph traversal iterator.

        @type  node: node
        @param node: Node.
        
        @type  order: string
        @param order: traversal ordering. Possible values are:
            2. 'pre' - Preordering (default)
            1. 'post' - Postordering
        
        @rtype:  iterator
        @return: Traversal iterator.
        """
        for each in traversal.traversal(self, node, order):
            yield each


    def depth_first_search(self, root=None, filter=filters.null()):
        """
        Depht-first search.
        
        @type  root: node
        @param root: Optional root node (will explore only root's connected component)

        @rtype:  tuple
        @return:  tupple containing a dictionary and two lists:
            1. Generated spanning tree
            2. Graph's preordering
            3. Graph's postordering
        """
        return searching.depth_first_search(self, root, filter)


    def accessibility(self):
        """
        Accessibility matrix (transitive closure).

        @rtype:  dictionary
        @return: Accessibility information for each node.
        """
        return accessibility.accessibility(self)


    def breadth_first_search(self, root=None, filter=filters.null()):
        """
        Breadth-first search.

        @type  root: node
        @param root: Optional root node (will explore only root's connected component)

        @rtype:  dictionary
        @return: A tuple containing a dictionary and a list.
            1. Generated spanning tree
            2. Graph's level-based ordering
        """
        return searching.breadth_first_search(self, root, filter=filter)


    def mutual_accessibility(self):
        """
        Mutual-accessibility matrix (strongly connected components).

        @rtype:  list
        @return: Mutual-accessibility information for each node.
        """
        return accessibility.mutual_accessibility(self)


    def topological_sorting(self):
        """
        Topological sorting.

        @attention: Topological sorting is meaningful only for directed acyclic graphs.

        @rtype:  list
        @return: Topological sorting for the graph.
        """
        return sorting.topological_sorting(self)


    def minimal_spanning_tree(self, root=None):
        """
        Minimal spanning tree.

        @type  root: node
        @param root: Optional root node (will explore only root's connected component)

        @attention: Minimal spanning tree meaningful only for weighted graphs.

        @rtype:  list
        @return: Generated spanning tree.
        """
        return minmax.minimal_spanning_tree(self, root)


    def shortest_path(self, source):
        """
        Return the shortest path distance between source node and all other nodes using Dijkstra's
        algorithm.
        
        @attention: All weights must be nonnegative.

        @type  source: node
        @param source: Node from which to start the search.

        @rtype:  tuple
        @return: A tuple containing two dictionaries, each keyed by target nodes.
            1. Shortest path spanning tree
            2. Shortest distance from given source to each target node
        Inaccessible target nodes do not appear in either dictionary.
        """
        return minmax.shortest_path(self, source)


    def heuristic_search(self, start, goal, heuristic):
        """
        A* search algorithm.
        
        A set of heuristics is available under C{graph.heuristics}. User-created heuristics are
        allowed too.
        
        @type start: node
        @param start: Start node
        
        @type goal: node
        @param goal: Goal node
        
        @type heuristic: function
        @param heuristic: Heuristic function
        
        @rtype: list
        @return: Optimized path from start to goal node 
        """
        return minmax.heuristic_search(self, start, goal, heuristic)

    
    def cut_edges(self):
        """
        Return the cut-edges of the given graph.
        
        @rtype:  list
        @return: List of cut-edges.
        """
        return accessibility.cut_edges(self)


    def cut_nodes(self):
        """
        Return the cut-nodes of the given graph.
        
        @rtype:  list
        @return: List of cut-nodes.
        """
        return accessibility.cut_nodes(self)


    def find_cycle(self):
        """
        Find a cycle in the digraph.
        
        This function will return a list of nodes which form a cycle in the graph or an empty list if
        no cycle exists.

        @rtype: list
        @return: List of nodes. 
        """
        return cycles.find_cycle(self, directed=True)
