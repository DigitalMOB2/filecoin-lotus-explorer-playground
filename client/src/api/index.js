import axios from 'axios'
import { config } from '../config'

export const getChainData = async ({ blockRange, startDate, endDate, miner, cid }) => {
  let startBlock = null;
  let endBlock = null;
  if (blockRange) {
    startBlock = blockRange[0];
    endBlock = blockRange[1];
  }

  const { data } = await axios.get(`${config.apiUrl}/chain`, {
    params: {
      startBlock,
      endBlock,
      startDate,
      endDate,
      miner,
      cid,
    },
  })

  return data
}

export const getBlockRange = async () => {
  const { data } = await axios.get(`${config.apiUrl}/blocks/range`)

  return data
}

export const getBlockHeight = async ({ cid }) => {
  const { data } = await axios.get(`${config.apiUrl}/blocks/height/${cid}`)

  return data
}
