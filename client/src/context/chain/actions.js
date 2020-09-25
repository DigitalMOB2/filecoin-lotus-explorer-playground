import { getChain, getChainLoadMore, saveNodeOriginalPositions, getSetHeights } from './helper'
import { toast } from 'react-toastify'
import { constants } from '../../utils'

export const skipFetch = (dispatch, payload) => {
  dispatch({ type: 'SKIP_FETCH', payload });
};

export const fetchGraph = async (dispatch, payload) => {
  dispatch({ type: 'CHANGE_LOADING', payload: true })

  try {
    const chain = await getChain(payload)

    const originalPositions = saveNodeOriginalPositions(chain);
    if (originalPositions.length > 1) {
      dispatch({ type: 'STORE_ORIGINAL_POSITIONS', payload: originalPositions })
    }

    if (payload.startDate && payload.endDate) {
      const heights = getSetHeights(chain);
      const range = [Number(heights[0]), Number(heights[heights.length - 1])];
      dispatch({ type: 'CHANGE_RANGE', payload: { range } });
    }
    dispatch({ type: 'CHANGE_CHAIN', payload: chain })
  } catch (error) {
    console.error('Error in request', error)

    toast.error('An error has occurred while fetching node chain.')
  }

  dispatch({ type: 'CHANGE_LOADING', payload: false })
}

export const loadMoreData = async (dispatch, previousChain, originalPositions, payload) => {
  dispatch({ type: 'CHANGE_LOADING', payload: true });
  try {
    const localPayload = { ...payload, blockRange: [payload.blockRange[0], payload.blockRange[1]] };
    let totalEpochs = 0;
    const newRange = [payload.blockRange[0], payload.blockRange[1]];

    if (payload.up) {
      localPayload.blockRange[0] = localPayload.blockRange[1];
      localPayload.blockRange[1] = localPayload.blockRange[1] + constants.initialBlockRangeLimit;
      localPayload.blockRange[1] = localPayload.blockRange[1] > payload.maxBlock ? payload.maxBlock : localPayload.blockRange[1];

      newRange[0] = payload.blockRange[0];
      newRange[1] = localPayload.blockRange[1];
      totalEpochs = newRange[1] - newRange[0];
    } else {
      localPayload.blockRange[1] = localPayload.blockRange[0];
      const min = localPayload.blockRange[0] - constants.initialBlockRangeLimit;
      localPayload.blockRange[0] = min < 0 ? 0 : min;

      newRange[0] = localPayload.blockRange[0];
      newRange[1] = payload.blockRange[1];
      totalEpochs = newRange[1] - newRange[0];
    }

    dispatch({ type: 'CHANGE_RANGE', payload: { range: newRange } });
    dispatch({ type: 'CHANGE_FILTERS', payload: { blockRange: newRange } });

    const chain = await getChainLoadMore(previousChain, originalPositions, localPayload, payload.up, totalEpochs / constants.initialBlockRangeLimit);

    const newOriginalPositions = saveNodeOriginalPositions(chain);
    if (newOriginalPositions.length > 1) {
      dispatch({ type: 'STORE_ORIGINAL_POSITIONS', payload: newOriginalPositions })
    }

    dispatch({ type: 'CHANGE_CHAIN', payload: chain })
  } catch (error) {
    console.error('Error in request', error);

    toast.error('An error has occurred while fetching node chain.')
  }

  dispatch({ type: 'CHANGE_LOADING', payload: false })
}
