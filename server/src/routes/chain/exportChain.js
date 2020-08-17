import { getChain as getChainData, getMessagesCount, getOrphans } from '../../services/db/chain'

import { blocksToChain } from '../../services/elgrapho/formatAsModel'
import { exportSvg } from '../../services/elgrapho/exportSvg'


export const exportChain = async (req, res) => {
  const { startBlock, endBlock } = req.query;

  const query = {
    startBlock,
    endBlock
  };

  const blocksArr = await getChainData(query);
  const chain = blocksToChain(blocksArr, endBlock, startBlock);
  const orphans = await getOrphans(query);

  const model = {
    chain,
    orphans,
  };

  const fileData = exportSvg(model);
  const fileName = `chainFrom${startBlock}to${endBlock}.svg`;
  const fileType = 'image/svg+xml';

  res.writeHead(200, {
    'Content-Disposition': `attachment; filename="${fileName}"`,
    'Content-Type': fileType,
  });

  const download = Buffer.from(fileData);
  res.end(download);
}
