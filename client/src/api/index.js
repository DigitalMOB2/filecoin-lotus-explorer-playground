import axios from 'axios'
import { config } from '../config'

export const getChainData = async ({ blockRange, startDate, endDate, miner, cid }) => {
  const startBlock = blockRange[0];
  const endBlock = blockRange[1];

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

export const getBlockRangeByDate = async ({ startDate, endDate }) => {
  const { data } = await axios.get(`${config.apiUrl}/blocks/height/byDate`, {
    params: {
      startDate,
      endDate,
    }
  });

  return data
};

export const getBlockHeight = async ({ cid }) => {
  const { data } = await axios.get(`${config.apiUrl}/blocks/height/${cid}`)

  return data
}
