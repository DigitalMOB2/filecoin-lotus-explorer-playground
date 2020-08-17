import D3Node from 'd3-node';
import _ from 'lodash';

export const exportSvg = (data) => {
    const d3n = new D3Node();
    const d3 = d3n.d3;
    const NODE_GAP = 150;
    const EPOCH_GAP = 120;
    const nodes = data.chain.nodes;
    const edges = data.chain.edges;
    var epochs = {};

    const getGlowColor = (node) => {
        const colorsArray = ['#3366CC', '#DC3912', '#FF9900', '#109618',
            '#990099', '#3B3EAC', '#0099C6', '#DD4477'];
        return colorsArray[node.tipset % 8];
    };

    const getOutlineColor = (node) => {
        const colorsArray = ['#3c3c3c', '#109618', '#990099', '#FF9900',
            '#DC3912'];
        return colorsArray[node.weirdTime % 5];
    };

    const getMinerColor = (node) => {
        const colorsArray = ['#3366CC', '#DC3912', '#FF9900', '#109618',
            '#990099', '#3B3EAC', '#0099C6', '#DD4477'];
        return colorsArray[node.minerColor % 8];
    };

    const getX = (passedNodes, index) => {
        if (passedNodes.length === maxNodesInEpoch) {
            return index * NODE_GAP;
        } else {
            if (passedNodes.length % 2 === 0) {
                if (index < passedNodes.length / 2) {
                    return graphWidth / 2 - ((passedNodes.length / 2 - index) * NODE_GAP) // done
                } else {
                    return graphWidth / 2 + ((index - passedNodes.length / 2) * NODE_GAP) // done
                }
            } else {
                if (index <= passedNodes.length / 2) {
                    return graphWidth / 2 - ((Math.floor(passedNodes.length / 2) - index) * NODE_GAP) - (NODE_GAP / 2); // done
                } else {
                    return graphWidth / 2 + ((index - (Math.floor(passedNodes.length) / 2)) * NODE_GAP) // done
                }
            }
        }
    };

    nodes.forEach(node => {
        if (node.height) {
            if (epochs[node.height]) {
                epochs[node.height].nodes.push(node);
            } else {
                epochs[node.height] = {};
                epochs[node.height].nodes = [];
                epochs[node.height].nodes.push(node);
            }
        }
    });

    var maxNodesInEpoch = 0;
    Object.keys(epochs).reverse().forEach(key => {

        epochs[key].nodes = _.orderBy(epochs[key].nodes, 'x', 'asc');

        if (epochs[key].nodes.length > maxNodesInEpoch) {
            maxNodesInEpoch = epochs[key].nodes.length;
        }
    });

    var graphWidth = maxNodesInEpoch * NODE_GAP;

    const svg = d3n.createSVG().attr('class', 'svg')
        .attr('viewbox', `0 0 ${graphWidth + 36} ${Object.keys(epochs).length * EPOCH_GAP + 32}`)
        .append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "black");

    d3.select(d3n.document.querySelector('.svg')).append('g')
        .attr('class', 'wrapper')
        .append('g')
        .attr('class', 'edges');


    Object.keys(epochs).reverse().forEach((key, epochIndex) => {
        var epochNodes = epochs[key].nodes;
        d3.select(d3n.document.querySelector('.wrapper')).append('text') // draw ruler
            .text(epochNodes[0].height)
            .attr('x', graphWidth - 40)
            .attr('y', epochIndex * EPOCH_GAP + 64)
            .attr('font-size', 14)
            .attr('fill', 'white');
        epochNodes.forEach((node, nodeIndex) => { // draw nodes

            if (node.miner) {
                d3.select(d3n.document.querySelector('.wrapper')).append('circle')
                    .attr('r', 38)
                    .attr('fill', getGlowColor(node))
                    .attr('cx', 42 + getX(epochNodes, nodeIndex))
                    .attr('cy', epochIndex * EPOCH_GAP + 64)
                    .attr('fill-opacity', 0.4);
                d3.select(d3n.document.querySelector('.wrapper')).append('circle')
                    .attr('r', 14)
                    .attr('fill', getOutlineColor(node))
                    .attr('cx', 42 + getX(epochNodes, nodeIndex))
                    .attr('cy', epochIndex * EPOCH_GAP + 64);
                d3.select(d3n.document.querySelector('.wrapper')).append('circle')
                    .attr('r', 10)
                    .attr('fill', getMinerColor(node))
                    .attr('cx', 42 + getX(epochNodes, nodeIndex))
                    .attr('cy', epochIndex * EPOCH_GAP + 64)
                    .attr('id', node.id);
                d3.select(d3n.document.querySelector('.wrapper')).append('text')
                    .attr('fill', 'white')
                    .attr('x', 24 + getX(epochNodes, nodeIndex))
                    .attr('y', epochIndex * EPOCH_GAP + 48)
                    .attr('font-size', 12)
                    .text(node.miner)
            } else { // orphan node
                d3.select(d3n.document.querySelector('.wrapper')).append('circle')
                    .attr('r', 10)
                    .attr('fill', 'white')
                    .attr('cx', 42 + getX(epochNodes, nodeIndex))
                    .attr('cy', epochIndex * EPOCH_GAP + 64)
                    .attr('id', node.id);
                d3.select(d3n.document.querySelector('.wrapper')).append('text')
                    .attr('fill', 'white')
                    .attr('x', 24 + getX(epochNodes, nodeIndex))
                    .attr('y', epochIndex * EPOCH_GAP + 48)
                    .attr('font-size', 12)
                    .text("skipped")
            }
        });
    });

    // draw edges

    edges.forEach(edge => {
        var fromId = edge.key.split('-')[0];
        var toId = edge.key.split('-')[1];
        var x1 = d3.select(d3n.document.querySelector(`#${fromId}`)).attr('cx');
        var y1 = d3.select(d3n.document.querySelector(`#${fromId}`)).attr('cy');
        var x2 = d3.select(d3n.document.querySelector(`#${toId}`)).attr('cx');
        var y2 = d3.select(d3n.document.querySelector(`#${toId}`)).attr('cy');

        d3.select(d3n.document.querySelector('.edges')).append('line')
            .style("stroke", "gray")
            .style("stroke-width", 2)
            .attr('x1', x1)
            .attr('x2', x2)
            .attr('y1', y1)
            .attr('y2', y2)
    });

    return d3n.svgString();
}