import { data as data1 } from './data1';
import { data as data2 } from './data2';
import { chain } from '../../routes/chain';

export const mockData1 = () => {
    return data1;
}

export const mockData2 = () => {
    return data2;
}

export const mockData3 = () => {
    return JSON.stringify(mergeDataSets(JSON.parse(data1), JSON.parse(data2)));
}

const mergeDataSets = (set1, set2) => {
    const edgeNodeCID = {};
    set1.chain.edges.forEach((edge, index) => {
        if (set1.chain.nodes[edge.from].id && set1.chain.nodes[edge.to].id)
        edgeNodeCID[`set1${index}`] = {
            fromId: set1.chain.nodes[edge.from].id,
            toId: set1.chain.nodes[edge.to].id,
        }
    });

    set2.chain.edges.forEach((edge, index) => {
        if (set2.chain.nodes[edge.from].id && set2.chain.nodes[edge.to].id)
        edgeNodeCID[`set2${index}`] = {
            fromId: set2.chain.nodes[edge.from].id,
            toId: set2.chain.nodes[edge.to].id,
        }
    });

    //remove last epoch in set 2
    let lastEpochInSet2 = 0;
    set2.chain.nodes.forEach(node => {
        if (lastEpochInSet2 < node.height) lastEpochInSet2 = node.height;
    });

    //rewrite using filter
    const set2FilteredNodes = [];
    for (let i = 0; i < set2.chain.nodes.length; i++) {
        if (set2.chain.nodes[i].height && set2.chain.nodes[i].height !== lastEpochInSet2) {
            set2FilteredNodes.push(set2.chain.nodes[i]);
        }
    }

    const set1FilteredNodes = [];
    for (let i = 0; i < set1.chain.nodes.length; i++) {
        if (set1.chain.nodes[i].height) {
            set1FilteredNodes.push(set1.chain.nodes[i]);
        }
    }

    const set2Processed = { ...set2 };
    set2Processed.chain.nodes = set2FilteredNodes;

    const set1Processed = { ...set1 };
    set1Processed.chain.nodes = set1FilteredNodes;

    let yOffset = 0;

    set1.chain.nodes.forEach(node => {
        if (yOffset < node.y) yOffset = node.y;
    });

    set1Processed.chain.nodes.forEach(node => {
        node.y = node.y + yOffset;
    });

    let result = {
        chain: {
            nodes: set1Processed.chain.nodes,
            edges: [],
            miners: set1Processed.chain.miners
        },
        orphans: set1Processed.orphans.concat(set2Processed.orphans)
    };

    Object.keys(set2Processed.chain.miners).forEach ( minerId => {
        if (result.chain.miners[minerId]) {
            result.chain.miners[minerId] += set2Processed.chain.miners[minerId];
        } else {
            result.chain.miners[minerId] = set2Processed.chain.miners[minerId];
        }
    });

    result.chain.nodes = result.chain.nodes.concat(set2Processed.chain.nodes);
    const newNodeIndexes = {};
    result.chain.nodes.forEach( (node, index) => { newNodeIndexes[node.id] = index});
    console.log(newNodeIndexes);
    set1Processed.chain.edges.forEach( (edge, index) => {
        if (edgeNodeCID[`set1${index}`]){
            edge.from = newNodeIndexes[edgeNodeCID[`set1${index}`].fromId];
            edge.to = newNodeIndexes[edgeNodeCID[`set1${index}`].toId];
            result.chain.edges.push(edge);
        }
    });
    set2Processed.chain.edges.forEach( (edge, index) => {
        if (edgeNodeCID[`set2${index}`]){
            edge.from = newNodeIndexes[edgeNodeCID[`set2${index}`].fromId];
            edge.to = newNodeIndexes[edgeNodeCID[`set2${index}`].toId];
            result.chain.edges.push(edge);
        }
    });

    return result;
}