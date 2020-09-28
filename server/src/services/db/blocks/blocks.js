import { db } from '../'

export const getBlockById = async (id) => {
  const { rows } = await db.query(
    `
    SELECT * from chain_visualizer_blocks_with_parents_view
    WHERE
      block = $1`,
    [id],
  )

  if (!rows.length) return []
  return rows[0]
}

export const getBlockRange = async () => {
  const { rows } = await db.query(
    `
    SELECT
      MIN(height) AS "minHeight",
      MAX(height) AS "maxHeight"

    FROM
      chain_visualizer_blocks_view
    `,
    [],
  )

  if (!rows || !rows.length) {
    return {}
  }

  return rows[0]
}

export const getBlockHeight = async (id) => {
  const { rows } = await db.query(
    `
    SELECT
      cid,
      height
    FROM
      chain_visualizer_blocks_view
    WHERE
      cid = $1 `,
    [id],
  )

  return rows[0]
}

export const getHeightByDate = async ({ startDate, endDate }) => {
const response = {};
if (startDate) {
  let date = new Date(startDate)
  let seconds = date.getTime() / 1000

  const { rows } = await db.query(
    `
    SELECT
      cid,
      height
    FROM
      chain_visualizer_blocks_view
    WHERE
    timestamp > $1
    order by
      height
    LIMIT 1
      `,
    [ seconds ]
  );
    response['minBlock'] = rows[0]['height'];
}

if (endDate) {
  let date = new Date(endDate)
  let seconds = date.getTime() / 1000

  const { rows } = await db.query(
    `
    SELECT
      cid,
      height
    FROM
      chain_visualizer_blocks_view
    WHERE
    timestamp < $1
    order by
      height DESC
    LIMIT 1
      `,
    [ seconds ]
  );
    response['maxBlock'] = rows[0]['height'];
}

return response;
}