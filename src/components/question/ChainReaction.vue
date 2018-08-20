<template>
  <div>
    <h4 class="center">Chain Reaction</h4>
    <div id="reaction-tree">
    </div>
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import arrayToTree from 'array-to-tree'
import rename from 'deep-rename-keys'
import * as d3 from 'd3'

export default {
  props: {
    ListOfNodes: {
      type: Array,
      default () {
        return [{"displayName":"Elton Lin","finished":true,"retired":true,"submitted":true,"submittedTime":0.5,"teacher":"Feynman","uid":"tV4cmAAs4lZ8xTRkQHKvXg3qQmB2"},{"displayName":"Nathan Cheung","finished":false,"teacher":"Elton Lin","uid":"RSdcyx9CZwOFaxo3qi7sVPQQwFk1"},{"displayName":"Rachida Kernis","finished":true,"retired":false,"teacher":"Elton Lin","uid":"4y1lACMaGxR0e0UVQhiZw6CD4vn1"},{"displayName":"Elnard Utiushev","finished":false,"submitted":false,"submittedTime":0,"teacher":"Rachida Kernis","uid":"amzrmJ5wvMhl5eP91KpYxg8tgrP2"},{"displayName":"Patrick Wahl","finished":false,"teacher":"Elnard Utiushev","uid":"yoKyuKWWOnhPdXSvcVj7eY5MUk42"},{"displayName":"Karisa Tzeng","finished":true,"submitted":true,"submittedTime":2,"teacher":"Rachida Kernis","uid":"UQAV20zHt8ZD1Z4a6pFNhPFxQMu2"},{"displayName":"Rishab Nayak","finished":false,"submitted":false,"submittedTime":0,"teacher":"Rachida Kernis","uid":"FTN51WIKTPM4lXz8be6SQI4AE8C3"},{"displayName":"Thomas Xiong","finished":false,"submitted":false,"submittedTime":0,"teacher":"Elnard Utiushev","uid":"6ykdkaVaYyQByube2iTYAEMoWJG2"}]
      }
    }
  },
  watch: {
    ListOfNodes () {
      this.update(this.root)
    }
  },
  data () {
    return {
      question: [],
      loading: true,
    }
  },
  computed: {
    treeData () {
      var participants = this.ListOfNodes
      if (!participants) { 
        return 
      }
      participants = arrayToTree(participants, {
        parentProperty: 'teacher',
        customID: 'uid'
      })
      participants = rename(participants, key => {
        if (key === 'child') {
          return 'children'
        } else if (key === 'displayName') {
          return 'name'
        }
      })
      return participants[0]
    },
    root () {
      var margin = {top: 20, right: 90, bottom: 30, left: 90}
      var height = 500 - margin.top - margin.bottom
      var root = d3.hierarchy(this.treeData, d => d.children)
      root.x0 = height / 2 // height 
      root.y0 = 0 // depth 
      return root 
    }
  },
  mounted () {
    this.update(this.root)
  },
  data () {
    return {
      firstTime: true,
      svg: null
    }
  },
  methods: {
    update (source) {
        // redeclare so svgs can use it 
        var margin = {top: 20, right: 90, bottom: 30, left: 90}
        var width = 960 - margin.left - margin.right
        var height = 500 - margin.top - margin.bottom

        var svg 
        if (this.firstTime) {
            svg = d3.select("#reaction-tree")
            .append('svg')
              .attr('width', width + margin.right + margin.left)
              .attr('height', height + margin.top + margin.bottom)
            .append('g')
              .attr('transform', `translate(${margin.left}, ${margin.top})`)
          this.svg = svg
          this.firstTime = false 
        } else {
          svg = this.svg
        }
          var i = 0
          var duration = 800
  
          var treemap = d3.tree().size([height, width])
          var root
          root = d3.hierarchy(this.treeData, d => d.children)
          root.x0 = height / 2 // height 
          root.y0 = 0 // depth 

          // Assigns the x and y position for the nodes
          var treeData = treemap(root)

          // Compute the new tree layout.
          var nodes = treeData.descendants(),
              links = treeData.descendants().slice(1)

          // Normalize for fixed-depth.
          nodes.forEach(d => { 
            d.y = d.depth * 180
          })

          // ****************** Nodes section ***************************

          // Update the nodes...
          var node = svg.selectAll('g.node')
              // short circuit 
              // ++ i is the value of i after increment 
              .data(nodes, d => d.id || (d.id = ++i))

          // Enter any new nodes at the parent's/source's previous position.
          var nodeEnter = node.enter().append('g')
              .attr('class', 'node')
              .attr('transform', d => `translate(${source.y0}, ${source.x0})`)
              .on('click', toggleExpand)

          // Add Circle for the nodes
          nodeEnter.append('circle')
              .attr('class', 'node')
              .attr('r', 1e-6)
              .style('fill', d => d._children ? "lightsteelblue" : "#fff")

          // Add labels for the nodes
          nodeEnter.append('text')
              .attr('dy', '.25em')
              .attr('x', d => d.children || d._children ? -13 : 13)
              .attr('text-anchor', d => d.children || d._children ? 'end' : 'start')
              .text(d => d.data.name )

            // UPDATE
            var nodeUpdate = nodeEnter.merge(node);

            // Transition to the proper position for the node
            nodeUpdate.transition()
              .duration(duration)
              .attr('transform', d => `translate(${d.y}, ${d.x})`)

            // Update the node attributes and style
            nodeUpdate.select('circle.node')
              .attr('r', 10)
              .style("fill", d => {
                  return d._children ? "lightsteelblue" : "#fff"
              })
              .attr('cursor', 'pointer')

            var nodeExit = node.exit().transition()
                .duration(duration)
                // disappears into it's parent's location
                .attr('transform', d => `translate(${source.y}, ${source.x})`)
                .remove();

            // On exit reduce the node circles size to 0
            nodeExit.select('circle')
              .attr('r', 1e-6)

            // On exit reduce the opacity of text labels
            nodeExit.select('text')
              .style('fill-opacity', 1e-6)

            // ****************** links section ***************************

            // Update the links...
            var link = svg.selectAll('path.link')
                .data(links, d => d.id)

            // Enter any new links at the parent's previous position.
            var linkEnter = link.enter().insert('path', 'g')
                .attr('class', 'link')
                .attr('d', d => {
                  var o = {x: source.x0, y: source.y0}
                  return diagonal(o, o)
                })

            // UPDATE
            var linkUpdate = linkEnter.merge(link);

            // Transition back to the parent element position
            linkUpdate.transition()
                .duration(duration)
                .attr('d', d => diagonal(d, d.parent))

            // Remove any exiting links
            var linkExit = link.exit().transition()
                .duration(duration)
                .attr('d', function(d) {
                  var o = {x: source.x, y: source.y}
                  return diagonal(o, o)
                })
                .remove()

            // Store the old positions for transition.
            nodes.forEach(d => {
              d.x0 = d.x
              d.y0 = d.y
            })

            // Creates a curved (diagonal) path from parent to the children nodes
            function diagonal(s, d) {
              const path = `M ${s.y} ${s.x}
                      C ${(s.y + d.y) / 2} ${s.x},
                        ${(s.y + d.y) / 2} ${d.x},
                        ${d.y} ${d.x}`
              return path
            }
            
            // you want to leave it alone, it's a monster of complexity 
            var update = this.update
            function toggleExpand(d) {
              // cache the 'children' into the _children variable
              // now that 'children' is null, no children will be displayed
              // upon re-clicking, repopulate 'children'
              if (d.children) {
                d._children = d.children 
                d.children = null
              } else {
                d.children = d._children
                d._children = null
              }
              update(d) // this works 
            }
          }
        }
}
</script>

<style>
.node circle {
  fill: #fff;
  stroke: steelblue;
  stroke-width: 3px;
}

.node text {
  font: 12px sans-serif;
  color: white;
}

.link {
  fill: none;
  stroke: #ccc;
  stroke-width: 2px;
}

#reaction-tree {
  background-color: rgb(247, 243, 243);
}
</style>