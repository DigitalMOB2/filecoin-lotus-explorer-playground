import fetch from 'node-fetch';
import { config } from '../../../../config'

export const getChain = async ({ startBlock, endBlock, startDate, endDate, miner, cid, skip, limit, sortOrder }) => {
  const maxLimit = 500
  let wheres = []

  if (startBlock) {
    wheres.push(['where', 'height', '>=', Number(startBlock)])
  }
  if (endBlock) {
    wheres.push(['where', 'height', '<=', Number(endBlock)])
  }
  if (startDate) {
    let date = new Date(startDate)
    let seconds = date.getTime() / 1000
    wheres.push(['where', 'timestamp', '>', seconds])
  }
  if (endDate) {
    let date = new Date(endDate)
    let seconds = date.getTime() / 1000
    wheres.push(['where', 'timestamp', '<', seconds])

  }
  if (miner) {
    wheres.push(['where', 'miner', '=', miner])
  }

  if (cid) {
    wheres.push(['where', 'cid', '=', cid])
  }

  skip = Number(skip)
  if (!skip || isNaN(skip)) {
    skip = null
  }
  limit = Number(limit)
  if (isNaN(limit)) {
    limit = null
  }
  if (limit && limit > maxLimit) {
    limit = maxLimit
  }
  if (sortOrder && sortOrder.toUppercase() !== 'ASC' && sortOrder.toUppercase() !== 'DESC') {
    sortOrder = 'DESC'
  }

  const url = `${config.slateUrl}/chain_visualizer_chain_data_view?offset=${skip}&limit=${limit}&where=${JSON.stringify(wheres)}&sort=${JSON.stringify([['height', 'asc']])}`;
  const apiResponse = await fetch(url,
    {
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
    })

  const body = await apiResponse.json();
  return body.data;
}

export const getOrphans = async ({ startBlock, endBlock, startDate, endDate, miner, cid, skip, limit, sortOrder }) => {
  const maxLimit = 500
  let wheres = []

  if (startBlock) {
    wheres.push(['where', 'height', '>=', Number(startBlock)])
  }
  if (endBlock) {
    wheres.push(['where', 'height', '<=', Number(endBlock)])
  }
  if (startDate) {
    let date = new Date(startDate)
    let seconds = date.getTime() / 1000
    wheres.push(['where', 'timestamp', '>', seconds])
  }
  if (endDate) {
    let date = new Date(endDate)
    let seconds = date.getTime() / 1000
    wheres.push(['where', 'timestamp', '<', seconds])

  }
  if (miner) {
    wheres.push(['where', 'miner', '=', miner])
  }

  if (cid) {
    wheres.push(['where', 'cid', '=', cid])
  }

  skip = Number(skip)
  if (!skip || isNaN(skip)) {
    skip = null
  }
  limit = Number(limit)
  if (isNaN(limit)) {
    limit = null
  }
  if (limit && limit > maxLimit) {
    limit = maxLimit
  }
  if (sortOrder && sortOrder.toUppercase() !== 'ASC' && sortOrder.toUppercase() !== 'DESC') {
    sortOrder = 'DESC'
  }

  const url = `${config.slateUrl}/chain_visualizer_orphans_view?offset=${skip}&limit=${limit}&where=${JSON.stringify(wheres)}&sort=${JSON.stringify([['height', 'asc']])}`;
  const apiResponse = await fetch(url,
    {
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
    })

  const body = await apiResponse.json();
  return body.data;
}

export const getGraph = async ({ start, end }) => {
  let wheres = []

  wheres.push(['where', 'height', '>', Number(start)])
  wheres.push(['where', 'height', '<', Number(end)])

  const url = `${config.slateUrl}/chain_visualizer_blocks_with_parents_view?where=${JSON.stringify(wheres)}&sort=${JSON.stringify([['height', 'asc']])}`;
  const apiResponse = await fetch(url,
    {
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
    })

  const body = await apiResponse.json();
  return body.data;
}
