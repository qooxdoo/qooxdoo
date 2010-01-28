# Copyright (c) 2007-2009 Pedro Matiello <pmatiello@gmail.com>
#                         Rhys Ulerich <rhys.ulerich@gmail.com>
#                         Roy Smith <roy@panix.com>
#                         Salim Fadhley <sal@stodge.org>
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
Minimization and maximization algorithms.

@sort: heuristic_search, minimal_spanning_tree, shortest_path, _first_unvisited, _lightest_edge,
_reconstruct_path
"""

from heapq import heappush, heappop
from exceptions import unreachable

# Minimal spanning tree

def minimal_spanning_tree(graph, root=None):
    """
    Minimal spanning tree.

    @attention: Minimal spanning tree meaningful only for weighted graphs.

    @type  graph: graph
    @param graph: Graph.
    
    @type  root: node
    @param root: Optional root node (will explore only root's connected component)

    @rtype:  dictionary
    @return: Generated spanning tree.
    """
    visited = []            # List for marking visited and non-visited nodes
    spanning_tree = {}        # MInimal Spanning tree

    # Initialization
    if (root is not None):
        visited.append(root)
        nroot = root
        spanning_tree[root] = None
    else:
        nroot = 1
    
    # Algorithm loop
    while (nroot is not None):
        ledge = _lightest_edge(graph, visited)
        if (ledge == (-1, -1)):
            if (root is not None):
                break
            nroot = _first_unvisited(graph, visited)
            if (nroot is not None):
                spanning_tree[nroot] = None
            visited.append(nroot)
        else:
            spanning_tree[ledge[1]] = ledge[0]
            visited.append(ledge[1])

    return spanning_tree


def _first_unvisited(graph, visited):
    """
    Return first unvisited node.
    
    @type  graph: graph
    @param graph: Graph.

    @type  visited: list
    @param visited: List of nodes.
    
    @rtype:  node
    @return: First unvisited node.
    """
    for each in graph:
        if (each not in visited):
            return each
    return None


def _lightest_edge(graph, visited):
    """
    Return the lightest edge in graph going from a visited node to an unvisited one.
    
    @type  graph: graph
    @param graph: Graph.

    @type  visited: list
    @param visited: List of nodes.

    @rtype:  tuple
    @return: Lightest edge in graph going from a visited node to an unvisited one.
    """
    lightest_edge = (-1, -1)
    weight = -1
    for each in visited:
        for other in graph[each]:
            if (other not in visited):
                w = graph.get_edge_weight(each, other)
                if (w < weight or weight < 0):
                    lightest_edge = (each, other)
                    weight = w
    return lightest_edge


# Shortest Path
# Code donated by Rhys Ulerich

def shortest_path(graph, source):
    """
    Return the shortest path distance between source and all other nodes using Dijkstra's algorithm.
    
    @attention: All weights must be nonnegative.

    @type  graph: graph
    @param graph: Graph.

    @type  source: node
    @param source: Node from which to start the search.

    @rtype:  tuple
    @return: A tuple containing two dictionaries, each keyed by target nodes.
        1. Shortest path spanning tree
        2. Shortest distance from given source to each target node
    Inaccessible target nodes do not appear in either dictionary.
    """
    # Initialization
    dist     = { source: 0 }
    previous = { source: None}
    q = graph.nodes()

    # Algorithm loop
    while q:
        # examine_min process performed using O(nodes) pass here.
        # May be improved using another examine_min data structure.
        u = q[0]
        for node in q[1:]:
            if ((not dist.has_key(u)) 
                or (dist.has_key(node) and dist[node] < dist[u])):
                u = node
        q.remove(u)

        # Process reachable, remaining nodes from u
        if (dist.has_key(u)):
            for v in graph[u]:
                if v in q:
                    alt = dist[u] + graph.get_edge_weight(u, v)
                    if (not dist.has_key(v)) or (alt < dist[v]):
                        dist[v] = alt
                        previous[v] = u

    return previous, dist


def heuristic_search(graph, start, goal, heuristic):
    """
    A* search algorithm.
    
    A set of heuristics is available under C{graph.heuristics}. User-created heuristics are
    allowed too.
    
    @type graph: graph
    @param graph: Graph
    
    @type start: node
    @param start: Start node
    
    @type goal: node
    @param goal: Goal node
    
    @type heuristic: function
    @param heuristic: Heuristic function
    
    @rtype: list
    @return: Optimized path from start to goal node 
    """
    
    # The queue stores priority, node, cost to reach, and parent.
    queue = [ (0, start, 0, None) ]

    # This dictionary maps queued nodes to distance of discovered paths
    # and the computed heuristics to goal. We avoid to compute the heuristics
    # more than once and to insert too many times the node in the queue.
    g = {}

    # This maps explored nodes to parent closest to the start
    explored = {}
    
    while queue:
        _, current, dist, parent = heappop(queue)
        
        if current == goal:
            path = [current] + [ n for n in _reconstruct_path( parent, explored ) ]
            path.reverse()
            return path

        if current in explored:
            continue

        explored[current] = parent

        for neighbor in graph[current]:
            if neighbor in explored:
                continue
            
            ncost = dist + graph.get_edge_weight(current, neighbor)

            if neighbor in g:
                qcost, h = g[neighbor]
                if qcost <= ncost:
                    continue
                # if ncost < qcost, a longer path to neighbor remains
                # g. Removing it would need to filter the whole
                # queue, it's better just to leave it there and ignore
                # it when we visit the node a second time.
            else:
                h = heuristic(neighbor, goal)
            
            g[neighbor] = ncost, h
            heappush(queue, (ncost + h, neighbor, ncost, current))

    raise unreachable( start, goal )

def _reconstruct_path(node, parents):
    while node is not None:
        yield node
        node = parents[ node ]
