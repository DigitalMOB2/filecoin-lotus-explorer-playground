import debounce from 'lodash/debounce'
import findIndex from 'lodash/findIndex'
import findLastIndex from 'lodash/findLastIndex'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { getBlockHeight } from '../../../api'
import { fetchGraph, loadMoreData, skipFetch as skipFetchAction } from '../../../context/chain/actions'
import { closeNodeModal, openNodeModal } from '../../../context/node-modal/actions'
import { selectNode } from '../../../context/selected-node/actions'
import { store } from '../../../context/store'
import { changeFilters } from '../../../context/filter/actions';
import { changeRange } from "../../../context/range/actions";
import ElGrapho from '../../../vendor/elgrapho/ElGrapho'
import { Loader } from '../../shared/Loader'
import {
  LaGrapha,
  LaGraphaWrapper,
  SaveGraph,
  // LoadMore,
  ZoomPlus,
  ZoomMinus,
  ResetZoom,
} from './la-grapha.styled'
import { NodeModal } from './NodeModal/NodeModal'
import { tooltip } from './tooltip'
import { constants } from '../../../utils'
import { config } from '../../../config'

const LaGraphaComponent = ({ maxBlock }) => {
  const { state, dispatch } = useContext(store);
  const { chain, originalPositions, loading: loadingData, filter, selectedNode, isNodeModalOpen, skipFetch } = state;
  const { blockRange, startDate, endDate, miner, cid, showHeightRuler } = filter;

  const [loadingGraph, setLoading] = useState(false);
  const [cidToSelect, setCidToSelect] = useState(null);
  //old export canvas as png
  //const [buildingSvg, setBuildingSvg] = useState(false)

  const loading = loadingData || loadingGraph;
  const graphRendered = !!document.getElementsByClassName('concrete-scene-canvas')[0];

  const laGraphaRef = useRef(null);

  const { nodes, edges } = chain.chain;

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

  useEffect(() => {
    if (!cidToSelect || loading) {
      return;
    }

    const index = findIndex(model.nodes, { blockCid: cidToSelect });
    if (index >= 0) {
      window.graphInstance.fire('select-node', { index });
      window.graphInstance.fire('zoom-to-node', { nodeY: model.nodes[index].y, initialPanY: y });
      setCidToSelect(null);
    }
  }, [loading, cidToSelect, model.nodes, y]);

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

      const toastId = toast.info(
        <div>
          This node is not in your current range. <br />
          <br />
          Change your range to include the height of <strong>{blockWithHeight.height}</strong>.
          <br />
          <br />
          <button
            onClick={() => {
              const newRange = changeRange(
                dispatch,
                state.range,
                [
                  Math.max(0, Number(blockWithHeight.height) - constants.initialBlockRangeLimit),
                  Math.max(Number(blockWithHeight.height), constants.initialBlockRangeLimit),
                ]
              );
              changeFilters(dispatch, { startDate: null, endDate: null, blockRange: newRange });
              toast.dismiss(toastId);
              setCidToSelect(cid);
            }}
            style={{ padding: '4px 8px' }}
          >
            Change now
          </button>
        </div>,
        { closeOnClick: false }
      );

      return
    }

    // y for pan is calculated as the desired y midpoint minus the current y midpoint. the 0.95 is because have to account for 5% padding
    window.graphInstance.fire('select-node', { index });
    // @todo: update to use current zoom and adjust for position currently in graph
    window.graphInstance.fire('zoom-to-node', { nodeY: model.nodes[index].y, initialPanY: y })
  };

  useEffect(() => {
    const handleResize = debounce(() => {
      buildGraph()
    }, 500);

    // @todo: make graph acessible outside so we can remove this logic from here

    window.addEventListener('resize', handleResize);
    window.addEventListener('select-node', onSelectNode);
    window.addEventListener('select-miners', onSelectMiners);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('select-node', onSelectNode);
      window.removeEventListener('select-miners', onSelectMiners)
    }
  });

  useEffect(() => {
    if (!blockRange[1] || skipFetch) return;
    fetchGraph(dispatch, { blockRange, startDate, endDate, miner, cid })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockRange, startDate, endDate, miner, cid]);

  useEffect(() => {
    buildGraph()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, showHeightRuler]);

  /*
  old export canvas as png
  const exportGraph = async () => {
    if (buildingSvg) return

    setBuildingSvg(true)

    const canvas = document.getElementsByClassName('concrete-scene-canvas')[0]

    const data = canvas.toDataURL()
    const blob = dataURItoBlob(data)

    download(blob, 'graph.png', laGraphaRef.current)

    setBuildingSvg(false)
  }
  */

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

    const onLoadMoreData = ({ up }) => {
      const payload = { blockRange, startDate, endDate, miner, cid, up, maxBlock };
      skipFetchAction(dispatch, true);
      loadMoreData(dispatch, chain, originalPositions, payload);
      skipFetchAction(dispatch, false);
    };

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
          hasTopLoadMoreButton: state.filter.blockRange[1] < state.filter.maxBlock,
          hasBottomLoadMoreButton: state.filter.blockRange[0] > state.filter.minBlock,
          callback: () => setLoading(false),
          onLoadMoreUp: () => onLoadMoreData({ up: true }),
          onLoadMoreDown: () => onLoadMoreData({ up: false }),
        })
      } catch (error) {
        console.error('Error building graph', error);

        setLoading(false)
      }

      window.graphInstance.tooltipTemplate = (index, el) => {
        const data = nodes[index];
        const tooltipTable = tooltip(data);

        if (tooltipTable) {
          while (el.firstChild) {
            el.removeChild(el.firstChild)
          }

          el.appendChild(tooltipTable)
        }
      };

      if (numEpochsDisplayed === constants.initialBlockRangeLimit) {
        window.graphInstance.fire('zoom-to-point', { y, zoomY })
      } else {
        if (window.graphInstance.model.nodes.length >= 3) {
          window.graphInstance.fire('zoom-to-node-fct', { nodeY: window.graphInstance.model.nodes[window.graphInstance.model.nodes.length - 3].y, initialPanY: y, zoomY });
        }
      }

      window.graphInstance.on('node-click', ({ node }) => {
        selectNode(dispatch, node);
        openNodeModal(dispatch)
      })
    }
  };

  const resetZoom = () => {
    const height = window.innerHeight;
    const numEpochsDisplayed = blockRange[1] - blockRange[0];
    const desiredInitialRange = 15;
    const zoomY = numEpochsDisplayed / desiredInitialRange;
    // y for pan is calculated as the desired y midpoint minus the current y midpoint. the 0.95 is because have to account for 5% padding
    const y = (desiredInitialRange * ((height * 0.95) / numEpochsDisplayed)) / 2 - (height * 0.95) / 2;

    //needs to be reworked, the zoomY factor needs to take into account current zoom factor
    window.graphInstance.fire('reset');
    setTimeout(() => {
      window.graphInstance.fire('zoom-to-point', {y, zoomY })
    }, 300);
  };

  return (
    <LaGraphaWrapper>
      {loading && <Loader light={graphRendered} />}
      <LaGrapha ref={laGraphaRef} />
      {!loading && (
        <div>
          <SaveGraph onClick={() => {
            window.open(`${config.apiUrl}/chain/saveAsSvg?startBlock=${blockRange[0]}&endBlock=${blockRange[1]}`);
          }}>
            Save Graph
          </SaveGraph>
          <ZoomPlus onClick={() => { window.graphInstance.fire('zoom-in'); }}>+</ZoomPlus>
          <ZoomMinus onClick={() => { window.graphInstance.fire('zoom-out'); }}>-</ZoomMinus>
          <ResetZoom onClick={() => { resetZoom(); }}>Reset</ResetZoom>
        </div>
      )}
      {isNodeModalOpen && <NodeModal node={selectedNode} close={() => closeNodeModal(dispatch)} />}
    </LaGraphaWrapper>
  )
};

export { LaGraphaComponent as LaGrapha }
