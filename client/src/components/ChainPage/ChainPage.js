import React, { useContext, useEffect } from 'react'
import { toast } from 'react-toastify'
import { getBlockRange } from '../../api'
import { changeFilters as changeFiltersAction } from '../../context/filter/actions'
import { store } from '../../context/store'
import { constants } from '../../utils'
import { ChainPage, ChartAndRange, RangeContainer } from './chain-page.styled'
import { Controls } from './Controls'
import { LaGrapha } from './LaGrapha'
import { Range } from './Range'

const ChainPageComponent = () => {
  const { state, dispatch } = useContext(store)
  const { startDate, endDate, blockRange, miner, minBlock, maxBlock } = state.filter

  const changeFilter = (payload) => {
    changeFiltersAction(dispatch, payload)
  }

  useEffect(() => {
    const fetchBlockRange = async () => {
      try {
        const res = await getBlockRange()

        if (res && res.minHeight) {
          if (res.minHeight) {
            changeFilter({ minBlock: Number(res.minHeight) })
          }

          if (res.maxHeight) {
            const _maxBlock = Number(res.maxHeight)

            changeFilter({
              maxBlock: _maxBlock,
              blockRange: [Math.max(0, _maxBlock - constants.initialBlockRangeLimit), _maxBlock],
            })
          }
        }
      } catch (error) {
        console.error('Error when fetching range', error)
        toast.error('An error has occurred while fetching block range.')
      }
    }

    fetchBlockRange()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ChainPage id="main">
      <ChartAndRange>
        <LaGrapha blockRange={blockRange} maxBlock={maxBlock} startDate={startDate} endDate={endDate} miner={miner} />
        <RangeContainer>
          <Range minBlock={minBlock} maxBlock={maxBlock} />
        </RangeContainer>
      </ChartAndRange>
      <Controls minBlock={minBlock} maxBlock={maxBlock} />
      <div className="d3-tooltip" />
    </ChainPage>
  )
}

export { ChainPageComponent as ChainPage }
