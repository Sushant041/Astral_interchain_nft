import { AssetList, Asset, Chain } from '@chain-registry/types';
import {
  networkType,
  getChainAssets,
  getChainByChainId,
	ethereummainnet,
} from '../config'

export const walletProxyList = {
	'keplr-extension': 'keplr',
	'keplr-mobile': 'keplr',
	'cosmostation-extension': 'cosmostation',
	'cosmostation-mobile': 'cosmostation',
	'walletconnect': 'walletconnectv2',
	'🌈 rainbow': 'rainbowwallet',
	'🌈rainbow': 'rainbowwallet',
	'rainbow': 'rainbowwallet',
}

export const walletConfigs = {
	coinbasewallet: {
		name: 'Coinbase Wallet',
		logoUrl: '/logos/coinbasewallet.svg',
	},
	cosmostation: {
		name: 'Cosmostation',
		logoUrl: '/logos/cosmostation.png',
	},
	keplr: {
		name: 'Keplr',
		logoUrl: '/logos/keplr.svg',
	},
	leap: {
		name: 'Leap Wallet',
		logoUrl: '/logos/leap.png',
	},
	metamask: {
		name: 'MetaMask',
		logoUrl: '/logos/metamask.svg',
	},
	rainbowwallet: {
		name: '🌈 Rainbow',
		logoUrl: '/logos/rainbowwallet.svg',
	},
	walletconnectv2: {
		name: 'Wallet Connect',
		logoUrl: '/logos/walletconnect.svg',
	},
}

export const getWalletConfigById = (id: string) => {
	if (walletConfigs[id]) return walletConfigs[id]
	if (walletConfigs[walletProxyList[id]]) return walletConfigs[walletProxyList[id]]
}

export interface NFTChannel {
  chain_id: string
  port: string
  channel: string
}

export interface NFTConnection {
	[key: string]: NFTChannel
}

export interface NFTChannelChain extends NFTChannel {
	chain?: Chain
	asset?: Asset
}

export interface NFTConnectionChain extends NFTConnection {
	[key: string]: NFTChannelChain
}

// export interface NFTConnections {
// 	[key string]: NFTConnection[]
// }

export const mainnetConnections: NFTConnection[] = [
	{
	  channel_a: {
		chain_id: "xion-mainnet-1",
		port: "transfer",
		channel: "channel-225057",
	  },
	},
  ];
  
// NOTE: You do not need to specify the inverse, code will pick it up in logic
export const testnetConnections: NFTConnection[] = [
	{
		channel_a: {
			chain_id: "xion-testnet-1",
			port: "transfer",
			channel: "channel-489",
		},
	},
]

export const connections = {
  testnet: testnetConnections,
  mainnet: mainnetConnections,
}

export const connectionChannels = connections[`${networkType}`]
const networkMap: any = {}
export const extendedChannels: NFTConnectionChain[] = []

// use known connections to filter available chains
connectionChannels.forEach((channels: NFTChannel) => {
  const connection: NFTConnectionChain = {}
  Object.keys(channels).forEach((cid: string) => {
    const chain_id = channels[cid].chain_id
    const network = getChainByChainId(chain_id)
    let asset: Asset | null;
    if (network) {
      const assetList = getChainAssets(network)
      asset = assetList?.assets ? assetList.assets[0] : null
      connection[cid] = { ...channels[cid], asset, chain: network }
    }
    if (!networkMap[chain_id] && network) networkMap[chain_id] = { ...network, asset }
  })

  if (Object.keys(connection).length > 0) extendedChannels.push(connection)
})

// Add ethereum context

export const availableNetworks: Chain[] | undefined = Object.values(networkMap)

export const isAvailableNetwork = (chain_id: string) => (availableNetworks.find(n => n.chain_id === chain_id) !== undefined)

export const getContractFromPort = (port: string) => `${port}`.search('wasm') > -1 ? `${port}`.split('.')[1] : undefined

export const getBridgeContractsForChainId = (chain_id: string): string[] => {
  const contractAddresses: string[] = []

  connectionChannels.forEach((channels: NFTConnectionChain) => {
    Object.keys(channels).forEach((cid: string) => {
      if (chain_id != channels[cid].chain_id) return;
      const port = channels[cid].port
			const contract_addr = getContractFromPort(port)
      if (contract_addr && !contractAddresses.includes(contract_addr)) contractAddresses.push(contract_addr)
    })
  })

  return contractAddresses
}

export const isBridgeAddress = (addr: string): boolean => {
  let isBridge = false

  connectionChannels.forEach((channels: NFTConnectionChain) => {
    Object.keys(channels).forEach((cid: string) => {
      const port = channels[cid].port
			if (`${port}`.search(addr) > -1) isBridge = true
    })
  })

	return isBridge
}

export const getDestChannelFromSrc = (src: NFTChannel | undefined): NFTChannel | undefined => {
	if (!src) return;
	let dest: NFTChannel | undefined;

	connectionChannels.forEach(c => {
		if (dest) return;
		if (c.channel_a.chain_id === src.chain_id && c.channel_a.port === src.port) dest = c.channel_b
		if (c.channel_b.chain_id === src.chain_id && c.channel_b.port === src.port) dest = c.channel_a
	})

	return dest
}