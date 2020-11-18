import debounce from 'lodash/debounce'
import React, { Fragment, useContext, useEffect } from 'react'
import { toast } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css'
import { getBlockRangeByDate } from '../../../api';
import { changeFilters as changeFiltersAction } from '../../../context/filter/actions'
import { changeRange } from '../../../context/range/actions'
import { store } from '../../../context/store'
import { constants } from '../../../utils'
import { Block } from '../../shared/Block'
import { Input } from '../../shared/Input'
import { Controls, DashedLine, Title, ClearButton } from './controls.styled'
import { FilterItem } from './FilterItem'
import { Miners } from './Miners'
import { RangeInputs } from './RangeInputs'
import { DateInputs } from './DateInputs'
import { ReceivedBlocks } from './ReceivedBlocks'
import { GitHubCorners } from '../../../vendor/github.corners';
import { FilecoinLogo } from '../../../vendor/filecoin.logo';

const nodeLabelOptions = [
  { value: 'showHeightRuler', label: 'Block height ruler' },
  // { value: 'showParentWeight', label: 'Show parent weight', disabled: true },
  // { value: 'disableMinerColor', label: 'Disable miner color', disabled: true },
  // { value: 'disableTipsetColor', label: 'Disable tipset color', disabled: true },
]

const ControlsComponent = ({ minBlock, maxBlock }) => {
  const {
    state: { chain, filter, range },
    dispatch,
  } = useContext(store)

  const debouncedBlockRangeChange = debounce((blockRange) => {
    changeFilter('blockRange', blockRange)
  }, 500)

  useEffect(() => {
    if (maxBlock !== range[0]) {
      changeRange(dispatch, range, [Math.max(0, maxBlock - constants.initialBlockRangeLimit), maxBlock])
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxBlock])

  const options = nodeLabelOptions.map((item, i) => (
    <Fragment key={item.value}>
      <FilterItem
        label={item.label}
        value={item.value}
        checked={filter[item.value]}
        disabled={item.disabled}
        onChange={(e) => changeFilter(item.value, e.target.checked)}
      />
      {i < nodeLabelOptions.length - 1 && <DashedLine />}
    </Fragment>
  ))

  const onChangeRangeInput = (newInternalBlockRange) => {
    const newRange = changeRange(dispatch, range, newInternalBlockRange)

    debouncedBlockRangeChange(newRange)
  }

  const changeFilter = (key, value) => {
    const allEmpty = !filter[key] && !value
    const notChanged = filter[key] === value

    if (allEmpty || notChanged) return

    changeFiltersAction(dispatch, { [key]: value, startDate: null, endDate: null })
  }

  const onClearDateFilter = () => {
    const payload = { startDate: '', endDate: '', blockRange: [maxBlock - constants.initialBlockRangeLimit, maxBlock] };
    changeRange(dispatch, range, [maxBlock - constants.initialBlockRangeLimit, maxBlock]);
    changeFiltersAction(dispatch, payload);
  };

  const changeDate = async (startDate, endDate) => {
    if (!startDate || !endDate) return;

    try {
      const range = await getBlockRangeByDate({ startDate, endDate });
      const payload = { startDate, endDate, blockRange: [Number(range.minBlock), Number(range.maxBlock)] };
      changeRange(dispatch, range, [Number(range.minBlock), Number(range.maxBlock)]);
      changeFiltersAction(dispatch, payload);
    } catch (e) {
      toast.warn('This date range was not found in our database.');
    }
  };

  return (
    <Controls id="controls">
      <Block style={{ display: 'flex', padding: 0, margin: 0, height: '80px', justifyContent: 'space-between', alignItems: 'center'  }}>

        <div style={{ width: '30px', height: '30px', paddingLeft: '3px' }}>
          <FilecoinLogo />
        </div>
        <Title style={{ fontSize: '15px', textAlign: 'center', marginRight: '-35px', marginBottom: 0}}>Filecoin Tipset Explorer</Title>
        <GitHubCorners />
      </Block>
      {process.env.REACT_APP_NETWORK && (
        <Block>
          <Title>Network: {process.env.REACT_APP_NETWORK}</Title>
        </Block>
      )}
      <Block>
        <Title>Block Height (max range 5000)</Title>
        <DashedLine />
        <RangeInputs
          minBlock={minBlock}
          maxBlock={maxBlock}
          range={range}
          onChange={onChangeRangeInput}
        />
        <DashedLine />
        {options}
      </Block>
      <Block>
        <Title>
          <span>Narrow date range (max 48h)</span>
          {filter.startDate || filter.startDate ? (
            <ClearButton
              type="button"
              title="Clear date filter"
              onClick={onClearDateFilter}
            />
          ) : null}
        </Title>
        <DateInputs
          maxTimeDiff={48} // in hours
          filter={filter}
          onChange={changeDate}
        />
      </Block>
      <Block>
        <Title>Find by Miner</Title>
        <Input
          placeholder="Miner Address"
          onBlur={(e) => {
            const { value } = e.target

            if (!value) return

            window.dispatchEvent(new CustomEvent('select-miners', { detail: value }))
            e.target.value = ''
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.target.blur()
            }
          }}
        />
      </Block>
      <Block>
        <Title>Find by Cid</Title>
        <Input
          placeholder="Enter block CID"
          onBlur={(e) => {
            const { value } = e.target

            if (!value) return

            window.dispatchEvent(new CustomEvent('select-node', { detail: value }))
            e.target.value = ''
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.target.blur()
            }
          }}
        />
      </Block>

      <Block>
        <Title>Block sync delay</Title>
        <ReceivedBlocks
          amount={chain.timeToReceive.under3.total}
          percentage={chain.timeToReceive.under3.percentage}
          kind="less than 3s"
        />
        <ReceivedBlocks
          amount={chain.timeToReceive.between3and6.total}
          percentage={chain.timeToReceive.between3and6.percentage}
          kind="between 3 - 6s"
        />
        <ReceivedBlocks
          amount={chain.timeToReceive.between6and15.total}
          percentage={chain.timeToReceive.between6and15.percentage}
          kind="between 6 - 15s"
        />
        <ReceivedBlocks
          amount={chain.timeToReceive.above15.total}
          percentage={chain.timeToReceive.above15.percentage}
          kind="more than 15s"
        />
      </Block>
      {/* <Block>
        <Title>Orphans</Title>
        <Orphans total={chain.total} orphans={chain.orphans.length} />
      </Block> */}
      <Block>
        <Title>
          Miner distribution {filter.blockRange[0]} - {filter.blockRange[1]}
        </Title>
        <Miners />
      </Block>
    </Controls>
  )
}

export { ControlsComponent as Controls }
