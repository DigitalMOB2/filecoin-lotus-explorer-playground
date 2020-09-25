import fetch from 'node-fetch';
import { config } from '../../../../config'

export const getBlockById = async (id) => {
  let wheres = []

  wheres.push(['where', 'block', '=', id])

  const url = `${config.slateUrl}/chain_visualizer_blocks_with_parents_view?where=${JSON.stringify(wheres)}`;
  const apiResponse = await fetch(url,
    {
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
    })

  const body = await apiResponse.json();
  return body.data[0];
}

export const getBlockRange = async () => {
  const url = `${config.slateUrl}/chain_visualizer_blocks_view_min_max`;
  const apiResponse = await fetch(url,
    {
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
    })

  const body = await apiResponse.json();
  console.log(body);
  return body.data[0];
}

export const getBlockHeight = async (id) => {
  let wheres = []

  wheres.push(['where', 'cid', '=', id])

  const url = `${config.slateUrl}/chain_visualizer_blocks_view?where=${JSON.stringify(wheres)}`;
  const apiResponse = await fetch(url,
    {
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
    })

  const body = await apiResponse.json();
  return body.data[0];
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
    timestamp >= $1
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
    timestamp <= $1
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