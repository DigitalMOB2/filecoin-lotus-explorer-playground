import fetch from 'node-fetch';
import { config } from '../../../../config'

export const getBlockById = async (id) => {
  let wheres = []

  wheres.push(['where', 'block', '=', id])

  const url = `${config.slateUrl}/chain-visualizer-blocks-with-parents-view?where=${JSON.stringify(wheres)}&sort=${JSON.stringify([['height', 'asc']])}`;
  const apiResponse = await fetch(url,
    {
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
    })

  const body = await apiResponse.json();
  return body.data[0];
}

export const getBlockRange = async () => {
  const url = `${config.slateUrl}/chain-visualizer-blocks-view-min-max`;
  console.log(url);
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

  const url = `${config.slateUrl}/chain-visualizer-blocks-view?where=${JSON.stringify(wheres)}&sort=${JSON.stringify([['height', 'asc']])}`;
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
    let wheres = []
    wheres.push(['where', 'timestamp', '>', seconds])

    const url = `${config.slateUrl}/chain-visualizer-blocks-view?where=${JSON.stringify(wheres)}&limit=1&sort=${JSON.stringify([['height', 'asc']])}`;
    const apiResponse = await fetch(url,
      {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
      })

    const body = await apiResponse.json();
    response['minBlock'] = body.data[0]['height'];
  }

  if (endDate) {
    let date = new Date(endDate)
    let seconds = date.getTime() / 1000
    let wheres = []
    wheres.push(['where', 'timestamp', '<', seconds])

    const url = `${config.slateUrl}/chain-visualizer-blocks-view?where=${JSON.stringify(wheres)}&limit=1&sort=${JSON.stringify([['height', 'desc']])}`;
    const apiResponse = await fetch(url,
      {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
      })

    const body = await apiResponse.json();
    response['maxBlock'] = body.data[0]['height'];
  }

  return response;
}