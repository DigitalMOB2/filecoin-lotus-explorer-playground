import { getChain, getChainLoadMore, saveNodeOriginalPositions } from './helper'
import { toast } from 'react-toastify'
import { constants } from '../../utils'

export const fetchGraph = async (dispatch, payload) => {
  dispatch({ type: 'CHANGE_LOADING', payload: true })

  try {
    const chain = await getChain(payload)

    const originalPositions = saveNodeOriginalPositions(chain);
    if (originalPositions.length > 1) {
      dispatch({ type: 'STORE_ORIGINAL_POSITIONS', payload: originalPositions })
    }

    dispatch({ type: 'CHANGE_CHAIN', payload: chain })
  } catch (error) {
    console.error('Error in request', error)

    toast.error('An error has occurred while fetching node chain.')
  }

  dispatch({ type: 'CHANGE_LOADING', payload: false })
}

export const loadMoreData = async (dispatch, previousChain, originalPositions, payload) => {
  dispatch({ type: 'CHANGE_LOADING', payload: true })
  try {
    const localPayload = { ...payload, blockRange: [payload.blockRange[0], payload.blockRange[1]] };
    localPayload.blockRange[1] = localPayload.blockRange[0];
    localPayload.blockRange[0] = localPayload.blockRange[0] - constants.initialBlockRangeLimit;

    dispatch({ type: 'CHANGE_RANGE', payload: { range: [localPayload.blockRange[0], payload.blockRange[1]] } })
    dispatch({ type: 'CHANGE_FILTER', payload: { key: 'blockRange', value: [localPayload.blockRange[0], payload.blockRange[1]] } })

    const chain = await getChainLoadMore(previousChain, originalPositions, localPayload)

    const newOriginalPositions = saveNodeOriginalPositions(chain);
    if (newOriginalPositions.length > 1) {
      dispatch({ type: 'STORE_ORIGINAL_POSITIONS', payload: newOriginalPositions })
    }

    dispatch({ type: 'CHANGE_CHAIN', payload: chain })
  } catch (error) {
    console.error('Error in request', error)

    toast.error('An error has occurred while fetching node chain.')
  }

  dispatch({ type: 'CHANGE_LOADING', payload: false })
}
