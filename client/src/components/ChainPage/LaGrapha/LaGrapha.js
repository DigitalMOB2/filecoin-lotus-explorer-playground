import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import debounce from 'lodash/debounce'
import findIndex from 'lodash/findIndex'
import findLastIndex from 'lodash/findLastIndex'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { getBlockHeight } from '../../../api'
import { fetchGraph, loadMoreData } from '../../../context/chain/actions'
import { closeNodeModal, openNodeModal } from '../../../context/node-modal/actions'
import { selectNode } from '../../../context/selected-node/actions'
import { store } from '../../../context/store'
import ElGrapho from '../../../vendor/elgrapho/ElGrapho'
import { Loader } from '../../shared/Loader'
import { LaGrapha, LaGraphaWrapper, SaveGraph, LoadMore, ZoomPlus, ZoomMinus, ResetZoom } from './la-grapha.styled'
import { NodeModal } from './NodeModal/NodeModal'
import { tooltip } from './tooltip'
import { GraphView } from 'react-digraph';
import xmlserializer from 'xmlserializer';


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

const prepareNodes = (nodes) => {
  const tempNodes = [];
  nodes.forEach(node => {
    if (node.id) {
      const tempNode = {};
      tempNode.id = node.id;
      tempNode.title = node.label;
      tempNode.x = node.x*1500;
      tempNode.y = node.y*-1000;
      tempNode.type = 'empty';
      tempNode.weirdTime = node.weirdTime;
      tempNode.minerColor = node.minerColor;
      tempNode.tipset = node.tipset;

      tempNodes.push(tempNode);
    }
  });
  return tempNodes;
};

const prepareEdges = (edges, nodes) => {
  const tempEdges = [];
  edges.forEach(edge => {
    const tempEdge = {};
    tempEdge.source = nodes[edge.from].id;
    tempEdge.target = nodes[edge.to].id;
    tempEdge.type = 'emptyEdge';

    tempEdges.push(tempEdge);
  });
  return tempEdges;
};

const LaGraphaComponent = () => {
  const { state, dispatch } = useContext(store);
  const { chain, originalPositions, loading: loadingData, filter, selectedNode, isNodeModalOpen } = state;
  const { blockRange, startDate, endDate, miner, cid, showHeightRuler } = filter;

  const [loadingGraph, setLoading] = useState(false);
  const [buildingSvg, setBuildingSvg] = useState(false);

  const loading = loadingData || loadingGraph;
  const graphRendered = !!document.getElementsByClassName('concrete-scene-canvas')[0];

  const laGraphaRef = useRef();

  const { nodes, edges } = chain.chain;

  console.log(nodes);

  const preparedNodes = prepareNodes(nodes);
  const preparedEdges = prepareEdges(edges, nodes);

  const GraphConfig = {
    NodeTypes: {
      empty: { // required to show empty nodes
        typeText: "None",
        shapeId: "#empty", // relates to the type property of a node
        shape: (
          <symbol viewBox="0 0 100 100" id="empty" key="0">
            <circle cx="50" cy="50" r="38" fill="#ff0000"/>
          </symbol>
        )
      },
      custom: { // required to show empty nodes
        typeText: "Custom",
        shapeId: "#custom", // relates to the type property of a node
        shape: (
          <symbol viewBox="0 0 50 25" id="custom" key="0">
            <ellipse cx="50" cy="25" rx="50" ry="25" />
          </symbol>
        )
      }
    },
    NodeSubtypes: {},
    EdgeTypes: {
      emptyEdge: {  // required to show empty edges
        shapeId: "#emptyEdge",
        shape: (
         <symbol/>
        )
      }
    }
  };

  const NODE_KEY = "id";

  const NodeTypes = GraphConfig.NodeTypes;
  const NodeSubtypes = GraphConfig.NodeSubtypes;
  const EdgeTypes = GraphConfig.EdgeTypes;

  const model = {
    nodes,
    edges,
    showRuler: showHeightRuler,
  };

  const height = window.innerHeight;
  const numEpochsDisplayed = blockRange[1] - blockRange[0];
  const desiredInitialRange = 15;

  const y = (desiredInitialRange * ((height * 0.95) / numEpochsDisplayed)) / 2 - (height * 0.95) / 2;

  const onSelectMiners = (e) => {
    // can basically simulate clicking on node to see all miners, choose first node in model to have this miner to zoom to
    const minerId = e.detail;
    const index = findLastIndex(model.nodes, { miner: minerId });

    if (index < 0) {
      toast.warn('Miner not found.');

      return
    }

    window.graphInstance.fire('select-group', { index, group: 'colors' });
    // @todo: update to use current zoom and adjust for position currently in graph
    window.graphInstance.fire('zoom-to-node', { nodeY: model.nodes[index].y, initialPanY: y })
  };

  const onSelectNode = async (e) => {
    const cid = e.detail;
    const index = findIndex(model.nodes, { id: cid });

    if (index < 0) {
      let blockWithHeight;

      try {
        blockWithHeight = await getBlockHeight({ cid })
      } catch (error) {
        console.error('Error when fetching node', error);
        toast.error('An error has occurred while fetching node.');

        return
      }

      if (!blockWithHeight) {
        toast.error('This node was not found in our database.');

        return
      }

      toast.info(
        <div>
          This node is not in your current range. <br />
          <br />
          Change your range to include the height of <strong>{blockWithHeight.height}</strong>.
        </div>,
      );

      return
    }

    // y for pan is calculated as the desired y midpoint minus the current y midpoint. the 0.95 is because have to account for 5% padding
    window.graphInstance.fire('select-node', { index });
    // @todo: update to use current zoom and adjust for position currently in graph
    window.graphInstance.fire('zoom-to-node', { nodeY: model.nodes[0].y, initialPanY: y });
    console.log('selected');
  };

  useEffect(() => {
    const handleResize = debounce(() => {
      buildGraph()
    }, 500);

    // @todo: make graph accessible outside so we can remove this logic from here

    window.addEventListener('resize', handleResize);
    window.addEventListener('select-node', onSelectNode);
    window.addEventListener('select-miners', onSelectMiners);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('select-node', onSelectNode);
      window.removeEventListener('select-miners', onSelectMiners);
    }
  });

  useEffect(() => {
    if (!blockRange[1]) return;
    fetchGraph(dispatch, { blockRange, startDate, endDate, miner, cid })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockRange, startDate, endDate, miner, cid]);

  useEffect(() => {
    buildGraph()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, showHeightRuler]);

  const exportGraph = () => {
    if (buildingSvg) return;

    setBuildingSvg(true);

    const svgElement = (document.getElementsByClassName('graph')[0]);
    let source = (xmlserializer.serializeToString(svgElement));
    if(!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)){
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if(!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)){
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    let svgBlob = new Blob([source], {type:"image/svg+xml;charset=utf-8"});
    let svgUrl = URL.createObjectURL(svgBlob);
    let downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = "graph.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setBuildingSvg(false)
  };

  const buildGraph = () => {
    setLoading(true);

    const height = window.innerHeight;
    const width = window.innerWidth - 306;
    const numEpochsDisplayed = blockRange[1] - blockRange[0];
    const desiredInitialRange = 15;

    const zoomY = numEpochsDisplayed / desiredInitialRange;

    // y for pan is calculated as the desired y midpoint minus the current y midpoint. the 0.95 is because have to account for 5% padding
    const y = (desiredInitialRange * ((height * 0.95) / numEpochsDisplayed)) / 2 - (height * 0.95) / 2;
    const { nodes } = chain.chain;

    if (nodes.length > 0) {
      try {
        window.graphInstance = new ElGrapho({
          container: laGraphaRef.current,
          model,
          labelSize: 0.5,
          height,
          width,
          edgeSize: 0.3,
          nodeSize: 1,
          nodeOutline: false,
          darkMode: 1,
          callback: () => {
            setLoading(false)
          },
        })
      } catch (error) {
        console.error('Error building graph', error);

        setLoading(false)
      }

      window.graphInstance.tooltipTemplate = (index, el) => {
        const data = nodes[index];
        const tooltipTable = tooltip(data);

        while (el.firstChild) {
          el.removeChild(el.firstChild)
        }

        el.appendChild(tooltipTable)
      };

      if (numEpochsDisplayed === desiredInitialRange) {
        window.graphInstance.fire('zoom-to-point', { y, zoomY })
      } else {
        window.graphInstance.fire('zoom-to-node-fct', { nodeY: window.graphInstance.model.nodes[5].y, initialPanY: y, zoomY });
      }

      window.graphInstance.on('node-click', ({ node }) => {
        selectNode(dispatch, node);
        openNodeModal(dispatch)
      })
    }
  };

  return (
    <LaGraphaWrapper>
      {loading && <Loader light={graphRendered} />}
      <LaGrapha ref={laGraphaRef} />
      {!loading && (
        <div>
          <SaveGraph disabled={buildingSvg} onClick={exportGraph}>
            {buildingSvg && <FontAwesomeIcon icon={faCircleNotch} spin />}
            Save Graph
          </SaveGraph>
          <LoadMore
            onClick={() => {
              loadMoreData(dispatch, chain, originalPositions, {
                blockRange,
                startDate,
                endDate,
                miner,
                cid,
              });
            }}
          >
            Load More
          </LoadMore>
          <ZoomPlus
            onClick={() => {
              window.graphInstance.fire("zoom-in");
            }}
          >
            +
          </ZoomPlus>
          <ZoomMinus
            onClick={() => {
              window.graphInstance.fire("zoom-out");
            }}
          >
            -
          </ZoomMinus>
          <ResetZoom
            onClick={() => {
              window.graphInstance.fire("reset");
            }}
          >
            Reset
          </ResetZoom>
        </div>
      )}
      {nodes.length > 0 && (
        <div style={{width: "50%"}}>
        <GraphView
          // ref='GraphView'
          nodeKey={NODE_KEY}
          nodes={preparedNodes}
          edges={preparedEdges}
          selected={null}
          nodeTypes={NodeTypes}
          nodeSubtypes={NodeSubtypes}
          edgeTypes={EdgeTypes}
          edgeArrowSize={-10}
          gridDotSize={0}
          onSelectNode={() => { }}
          onCreateNode={() => { }}
          onUpdateNode={() => { }}
          onDeleteNode={() => { }}
          onSelectEdge={() => { }}
          onCreateEdge={() => { }}
          onSwapEdge={() => { }}
          onDeleteEdge={() => { }}
          renderNode =  {(
            nodeRef,
            data,
          ) => {return <g>
          <circle r="38" x={data.x} y={data.y} fill={getGlowColor(data)} fillOpacity={0.6}/>
          <circle r="14" x={data.x} y={data.y} fill={getOutlineColor(data)} fillOpacity={1}/>
          <circle r="10" x={data.x} y={data.y} fill={getMinerColor(data)} fillOpacity={1}/>
        </g>}}
        />
        </div>
      )}
      {isNodeModalOpen && (
        <NodeModal node={selectedNode} close={() => closeNodeModal(dispatch)} />
      )}
    </LaGraphaWrapper>
  );
};

export { LaGraphaComponent as LaGrapha }
