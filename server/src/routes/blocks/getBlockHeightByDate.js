import { getHeightByDate as getHeightByDateData } from '../../services/db/blocks'
import { BadRequestError, NotFoundError } from 'error-middleware/errors'

export const getBlockHeightByDate = async (req, res) => {
  const { startDate, endDate } = req.query

  const query = {
    startDate,
    endDate,
  }

  const blocksInfo = await getHeightByDateData(query)
  res.json(blocksInfo)
}
