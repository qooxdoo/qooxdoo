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
Accessibility algorithms.

@sort: accessibility, connected_components, cut_edges, cut_nodes, mutual_accessibility
"""


# Transitive-closure

def accessibility(graph):
    """
    Accessibility matrix (transitive closure).

    @type  graph: graph
    @param graph: Graph.

    @rtype:  dictionary
    @return: Accessibility information for each node.
    """
    accessibility = {}        # Accessibility matrix

    # For each node i, mark each node j if that exists a path from i to j.
    for each in graph:
        access = {}
        # Perform DFS to explore all reachable nodes
        _dfs(graph, access, 1, each)
        accessibility[each] = access.keys()
    return accessibility


# Strongly connected components

def mutual_accessibility(graph):
    """
    Mutual-accessibility matrix (strongly connected components).

    @type  graph: graph
    @param graph: Graph.

    @rtype:  dictionary
    @return: Mutual-accessibility information for each node.
    """
    mutual_access = {}
    access = graph.accessibility()

    for i in graph:
        mutual_access[i] = []
        for j in graph:
            if (i in access[j] and j in access[i]):
                mutual_access[i].append(j)

    return mutual_access


# Connected components

def connected_components(graph):
    """
    Connected components.

    @attention: Indentification of connected components is meaningful only for non-directed graphs.

    @type  graph: graph
    @param graph: Graph.

    @rtype:  dictionary
    @return: Pairing that associates each node to its connected component.
    """
    visited = {}
    count = 1

    # For 'each' node not found to belong to a connected component, find its connected component.
    for each in graph:
        if (each not in visited):
            _dfs(graph, visited, count, each)
            count = count + 1
    
    return visited


# Limited DFS implementations used by algorithms here

def _dfs(graph, visited, count, node):
    """
    Depht-first search subfunction adapted for accessibility algorithms.
    
    @type  graph: graph
    @param graph: Graph.

    @type  visited: dictionary
    @param visited: List of nodes (visited nodes are marked non-zero).

    @type  count: number
    @param count: Counter of connected components.

    @type  node: node
    @param node: Node to be explored by DFS.
    """
    visited[node] = count
    # Explore recursively the connected component
    for each in graph[node]:
        if (each not in visited):
            _dfs(graph, visited, count, each)


# Cut-Edge and Cut-Vertex identification

def cut_edges(graph):
    """
    Return the cut-edges of the given graph.
    
    @rtype:  list
    @return: List of cut-edges.
    """
    pre = {}
    low = {}
    spanning_tree = {}
    reply = []
    pre[None] = 0

    for each in graph:
        if (not pre.has_key(each)):
            spanning_tree[each] = None
            _cut_dfs(graph, spanning_tree, pre, low, reply, each)
    return reply


def cut_nodes(graph):
    """
    Return the cut-nodes of the given graph.
    
    @rtype:  list
    @return: List of cut-nodes.
    """
    pre = {}    # Pre-ordering
    low = {}    # Lowest pre[] reachable from this node going down the spanning tree + one backedge
    reply = {}
    spanning_tree = {}
    pre[None] = 0
    
    # Create spanning trees, calculate pre[], low[]
    for each in graph:
        if (not pre.has_key(each)):
            spanning_tree[each] = None
            _cut_dfs(graph, spanning_tree, pre, low, [], each)

    # Find cuts
    for each in graph:
        # If node is not a root
        if (spanning_tree[each] is not None):
            for other in graph[each]:
                # If there is no back-edge from descendent to a ancestral of each
                if (low[other] >= pre[each] and spanning_tree[other] == each):
                    reply[each] = 1
        # If node is a root
        else:
            children = 0
            for other in graph:
                if (spanning_tree[other] == each):
                    children = children + 1
            # root is cut-vertex iff it has two or more children
            if (children >= 2):
                reply[each] = 1

    return reply.keys()


def _cut_dfs(graph, spanning_tree, pre, low, reply, node):
    """
    Depth first search adapted for identification of cut-edges and cut-nodes.
    
    @type  graph: graph
    @param graph: Graph
    
    @type  spanning_tree: dictionary
    @param spanning_tree: Spanning tree being built for the graph by DFS.

    @type  pre: dictionary
    @param pre: Graph's preordering.
    
    @type  low: dictionary
    @param low: Associates to each node, the preordering index of the node of lowest preordering
    accessible from the given node.

    @type  reply: list
    @param reply: List of cut-edges.
    
    @type  node: node
    @param node: Node to be explored by DFS.
    """
    pre[node] = pre[None]
    low[node] = pre[None]
    pre[None] = pre[None] + 1
    
    for each in graph[node]:
        if (not pre.has_key(each)):
            spanning_tree[each] = node
            _cut_dfs(graph, spanning_tree, pre, low, reply, each)
            if (low[node] > low[each]):
                low[node] = low[each]
            if (low[each] == pre[each]):
                reply.append((node, each))
        elif (low[node] > pre[each] and spanning_tree[node] != each):
            low[node] = pre[each]
