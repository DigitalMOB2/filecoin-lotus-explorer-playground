import express from 'express'
import asyncHandler from 'express-async-handler'
import { getChain } from './getChain'
import { getGraph } from './getGraph'
import { exportChain } from './exportChain'


const router = express.Router()

router.get('', asyncHandler(getChain))
router.get('/saveAsSvg', asyncHandler(exportChain))
router.get('/graph.json', asyncHandler(getGraph))

export const chain = router
