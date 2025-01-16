import { assets, chains } from 'chain-registry';
import { AssetList, Asset, Chain } from '@chain-registry/types';
import { fromBech32 } from "@cosmjs/encoding";
import BigNumber from 'bignumber.js';

// Disallowed NFT formats
export const disallowedNFTFormats = [
  'text/plain',
  'video/mp4',
  'video/quicktime',
  'audio/mpeg',
];

// Network Configuration (set Xion Testnet as default)
export const networkType: string = process.env.NEXT_NETWORK_TYPE ?? 'mainnet';
export const chainName = process.env.NEXT_PUBLIC_CHAIN ?? 'xion'; // Set Xion testnet chain as default

// Find Chain Assets for Xion Testnet
export const chainassets: AssetList = assets.find(
  (chain) => chain.chain_name === chainName
) as AssetList;

// Find Specific Coin for Xion (assuming it's 'uxion')
export const coin: Asset | undefined = chainassets?.assets.find(
  (asset) => asset.base === 'uxion'
);

export const exponent = coin?.denom_units.find(
  (unit) => unit.denom === coin.display
)?.exponent as number;

// Utility to Convert Raw Amount to Display Amount
export const toDisplayAmount = (amount: string, exponent: number) => {
  return new BigNumber(amount).shiftedBy(-exponent).decimalPlaces(2).toString();
};

// Utility: Convert IPFS Link to HTTP URL
export const getHttpUrl = (ipfsLink: string | undefined) => {
  if (!ipfsLink || ipfsLink === 'undefined') return '';
  if (ipfsLink.startsWith('http')) return ipfsLink;
  return `https://ipfs-gw.stargaze-apis.com/ipfs/${ipfsLink.slice(7)}`;
};

// Get Chain Based on Address (Only for Xion Testnet)
export const getChainForAddress = (address: string | undefined): Chain | undefined => {
  if (!address) return;
  let prefix;
  try {
    const bech = fromBech32(address);
    prefix = bech.prefix;
  } catch (e) {
    return undefined;
  }
  // Match only the Xion testnet chains
  return chains?.find((chain) => chain.bech32_prefix === prefix && chain.network_type === networkType && (chain.chain_name === 'xion'));
};

// Get Chain by Chain ID (Only for Xion Testnet)
export const getChainByChainId = (chainId: string): Chain | undefined => {
  return chains.find((chain) => chain.chain_id === chainId && chain.network_type === networkType && (chain.chain_name === 'xion'));
};

// Get Assets for a Specific Chain (Only for Xion Testnet)
export const getChainAssets = (chain: Chain): AssetList => {
  return assets.find(
    (a) => a.chain_name === chain.chain_name
  ) as AssetList;
};

// Marketplace Information for Xion Testnets
const marketInfos = [
  {
    chain_name: 'xion-testnet-1',
    name: 'Xion Testnet Marketplace',
    logoPath: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/xion/images/burnt-round.png',
    marketLink: 'https://coinmarketcap.com/currencies/xion/',
    marketDetailLink: (address, tokenId) => `https://testnet.xion.io/marketplace/${address}/${tokenId}`,
  },
];

export const marketInfo = marketInfos;

// Get Marketplace Information for a Specific Address (Only for Xion Testnet)
export const getMarketForAddress = (address: string) => {
  if (!address || address.length < 10) return;
  const chain = getChainForAddress(address);
  if (!chain) return;
  return marketInfo.find((m) => m?.chain_name === chain?.chain_name);
};

// Explorer Utility Functions (Xion Testnet Focused)
export const getExplorerFromTxData = (data: any): any => {
  if (!data || !data.events || data.events.length < 1) return;
  let chainAddress;

  // Check Transaction Logs for Chain Address
  data.events.forEach(e => {
    if (e.type === 'wasm') {
      e.attributes.forEach(a => {
        if (a.key === '_contract_address') chainAddress = a.value;
        if (a.key === 'sender' && !chainAddress) chainAddress = a.value;
      });
    }
  });
  if (!chainAddress) return;

  const chain = getChainForAddress(chainAddress);
  return chain?.explorers.length > 0 ? chain.explorers[0] : null;
};

// Replace Transaction Hash in Explorer URL
export const getExplorerUrlForTx = (tx_page: string, txHash: string): string => {
  return `${tx_page}`.replace('${txHash}', txHash);
};
