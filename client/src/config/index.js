import dotenv from 'dotenv'

dotenv.config()

export const config = {
  apiUrl: process.env.REACT_APP_API_URL || `${window.location.origin}/api`,
  networkName: process.env.REACT_APP_NETWORK || `testnet`,
  explorerPrefix: process.env.REACT_APP_EXPLORER_PREFIX || `https://filscan.io/`,
}
