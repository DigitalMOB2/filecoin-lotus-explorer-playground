import { getChainData } from '../../api'
import { palette } from '../../utils/palette'

export const getChain = async ({ blockRange, startDate, endDate, miner, cid }) => {
  const { chain, orphans } = await getChainData({
    blockRange: [blockRange[0], blockRange[1]],
    startDate,
    endDate,
    miner,
    cid,
  })

  const miners = mapMiners(chain)
  const timeToReceive = mapTimeToReceive(chain)

  return {
    chain,
    total: chain.nodes.length,
    miners,
    orphans,
    timeToReceive,
  }
}

export const getChainLoadMore = async (crtChainData, originalPositions, { blockRange, startDate, endDate, miner, cid }) => {
  const newChainData = await getChainData({
    blockRange: [blockRange[0], blockRange[1]],
    startDate,
    endDate,
    miner,
    cid,
  })

  crtChainData.chain.nodes.forEach((node, index) => {
    node.x = originalPositions[index].x;
    node.y = originalPositions[index].y;
  });


  const { chain, orphans } = mergeDataSets(crtChainData, newChainData);
  const miners = mapMiners(chain);
  const timeToReceive = mapTimeToReceive(chain);

  return {
    chain,
    total: chain.nodes.length,
    miners,
    orphans,
    timeToReceive,
  }
}

const mapTimeToReceive = (chain) => {
  const table = {
    under3: {
      total: 0,
      percentage: 0,
      nodes: [],
    },
    between3and6: {
      total: 0,
      percentage: 0,
      nodes: [],
    },
    between6and15: {
      total: 0,
      percentage: 0,
      nodes: [],
    },
    above15: {
      total: 0,
      percentage: 0,
      nodes: [],
    },
  }

  chain.nodes.forEach((node) => {
    if (node.timeToReceiveRaw < 3000) {
      table.under3.nodes.push(node)
    } else if (node.timeToReceiveRaw >= 3000 && node.timeToReceiveRaw < 6000) {
      table.between3and6.nodes.push(node)
    } else if (node.timeToReceiveRaw >= 6000 && node.timeToReceiveRaw < 15000) {
      table.between6and15.nodes.push(node)
    } else {
      table.above15.nodes.push(node)
    }
  })

  const total = chain.nodes.length

  Object.keys(table).forEach((key) => {
    table[key].total = table[key].nodes.length
    table[key].percentage = toDecimal((table[key].total * 100) / total)
  })

  table.total = total

  return table
}

const toDecimal = (n) => Math.round(n * 100) / 100

const mapMiners = (chain) => {
  const total = Object.values(chain.miners).reduce((total, current) => total + current, 0)

  const mMiners = Object.keys(chain.miners).map((key) => {
    const value = chain.miners[key]

    return {
      name: key,
      total: value,
      percentage: toDecimal((100 * value) / total),
    }
  })

  const sortedMiners = mMiners.sort((a, b) => b.total - a.total)

  let paletteIndex = 0
  const minersWithColor = sortedMiners.map((miner) => {
    if (paletteIndex >= palette.length) paletteIndex = 0

    const currentPalette = palette[paletteIndex++]
    return {
      ...miner,
      color: currentPalette.color,
      fontColor: currentPalette.isDark ? '#fff' : '#212121',
    }
  })

  return minersWithColor
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
    if (lastEpochInSet2*1 < node.height*1) lastEpochInSet2 = node.height;
  });

  //rewrite using filter
  const set2FilteredNodes = [];
  for (let i = 0; i < set2.chain.nodes.length; i++) {
    if (set2.chain.nodes[i].height !== lastEpochInSet2) {
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

  let ymax = 0;
  let ymin = 0;

  set1.chain.nodes.forEach(node => {
    if (ymax < node.y) ymax = node.y;
    if (ymin > node.y) ymin = node.y;
  });

  //yOffset = ymax - ymin;
  yOffset = 1;
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
  result.chain.nodes.forEach((node, index) => {
    newNodeIndexes[node.id] = index;
    //node.x = 0
  });

  set1Processed.chain.edges.forEach((edge, index) => {
    if (edgeNodeCID[`set1${index}`]) {
      if (newNodeIndexes[edgeNodeCID[`set1${index}`].fromId] >= 0 && newNodeIndexes[edgeNodeCID[`set1${index}`].toId] >= 0) {
        edge.from = newNodeIndexes[edgeNodeCID[`set1${index}`].fromId];
        edge.to = newNodeIndexes[edgeNodeCID[`set1${index}`].toId];
        result.chain.edges.push(edge);
      }
    }
  });
  set2Processed.chain.edges.forEach((edge, index) => {
    if (edgeNodeCID[`set2${index}`]) {
      if (newNodeIndexes[edgeNodeCID[`set2${index}`].fromId] >= 0 && newNodeIndexes[edgeNodeCID[`set2${index}`].toId] >= 0) {
        edge.from = newNodeIndexes[edgeNodeCID[`set2${index}`].fromId];
        edge.to = newNodeIndexes[edgeNodeCID[`set2${index}`].toId];
        result.chain.edges.push(edge);
      }
    }
  });

  return result;
}

export const saveNodeOriginalPositions = (chain) => {
  const nodeOriginalPositions = [];
  if (chain.chain.nodes) {
    chain.chain.nodes.forEach(node => {
      nodeOriginalPositions.push({ x: node.x, y: node.y });
    })
  }
  return nodeOriginalPositions;
}