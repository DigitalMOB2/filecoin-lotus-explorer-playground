import { getChain as getChainData, getMessagesCount, getOrphans } from '../../services/db/chain'
import { mockData1, mockData2, mockData3 } from '../../services/model-binder'

import { blocksToChain } from '../../services/elgrapho/formatAsModel'

export const getChain = async (req, res) => {
  const { startBlock, endBlock, startDate, endDate, miner, cid, skip, limit, sortOrder } = req.query

  const query = {
    startBlock,
    endBlock,
    startDate,
    endDate,
    miner,
    cid,
    skip,
    limit,
    sortOrder,
  }

  const blocksArr = await getChainData(query)
  const chain = blocksToChain(blocksArr, endBlock, startBlock)
  const orphans = await getOrphans(query)

  /*let data = "{}";
  if (cid === "0") data = mockData1();
  if (cid === "1") data = mockData2();
  res.json(JSON.parse(data));*/

  res.json({
    chain,
    orphans,
  })
}
