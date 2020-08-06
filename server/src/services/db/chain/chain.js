import { db } from '../'

export const getChain = async ({ startBlock, endBlock, startDate, endDate, miner, cid, skip, limit, sortOrder }) => {
  const maxLimit = 500
  let wheres = []
  let whereArgs = []

  if (startBlock) {
    whereArgs.push(Number(startBlock))
    wheres.push(`height >= $${whereArgs.length}`)
  }
  if (endBlock) {
    whereArgs.push(endBlock)
    wheres.push(`height <= $${whereArgs.length}`)
  }
  if (startDate) {
    let date = new Date(startDate)
    let seconds = date.getTime() / 1000
    whereArgs.push(seconds)
    wheres.push(`timestamp > $${whereArgs.length}`)
  }
  if (endDate) {
    let date = new Date(endDate)
    let seconds = date.getTime() / 1000
    whereArgs.push(seconds)
    wheres.push(`timestamp < $${whereArgs.length}`)
  }
  if (miner) {
    whereArgs.push(miner)
    wheres.push(`miner = $${whereArgs.length}`)
  }

  if (cid) {
    whereArgs.push(miner)
    wheres.push(`cid = $${whereArgs.length}`)
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

  const query = `
  SELECT * from chain_visualizer_chain_data_view
    ${wheres.length ? 'WHERE' : ''}
    ${wheres.join(' AND ')}

    ${sortOrder ? `ORDER BY height ${sortOrder}` : 'ORDER BY height ASC'}

    ${skip ? `OFFSET ${skip}` : ''}

    ${limit ? `LIMIT ${limit}` : ''}
  `
  const { rows } = await db.query(query, whereArgs)

  return rows
}

export const getOrphans = async ({ startBlock, endBlock, startDate, endDate, miner, cid, skip, limit, sortOrder }) => {
  const maxLimit = 500
  let wheres = []
  let whereArgs = []

  if (startBlock) {
    whereArgs.push(Number(startBlock))
    wheres.push(`height >= $${whereArgs.length}`)
  }
  if (endBlock) {
    whereArgs.push(endBlock)
    wheres.push(`height <= $${whereArgs.length}`)
  }
  if (startDate) {
    let date = new Date(startDate)
    let seconds = date.getTime() / 1000
    whereArgs.push(seconds)
    wheres.push(`timestamp > $${whereArgs.length}`)
  }
  if (endDate) {
    let date = new Date(endDate)
    let seconds = date.getTime() / 1000
    whereArgs.push(seconds)
    wheres.push(`timestamp < $${whereArgs.length}`)
  }
  if (miner) {
    whereArgs.push(miner)
    wheres.push(`miner = $${whereArgs.length}`)
  }

  if (cid) {
    whereArgs.push(miner)
    wheres.push(`cid = $${whereArgs.length}`)
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

  const query = `
    select * from chain_visualizer_orphans_view

    ${wheres.length ? ' WHERE ' : ''}
    ${wheres.join(' AND ')}

    ${sortOrder ? `ORDER BY height ${sortOrder}` : 'ORDER BY height ASC'}

    ${skip ? `OFFSET ${skip}` : ''}

    ${limit ? `LIMIT ${limit}` : ''}
    `
    console.log(query);

  const { rows } = await db.query(query, whereArgs)

  return rows
}

export const getGraph = async ({ start, end }) => {
  const { rows } = await db.query(
    `
    SELECT * from chain_visualizer_blocks_with_parents_view

    WHERE
      b.height > $1 and b.height < $2`,
    [start, end],
  )

  return rows
}
