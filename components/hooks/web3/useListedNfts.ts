import { CryptHookFactory } from "@_types/hooks";
import {Nft} from "@_types/nft";
import { ethers } from "ethers";
import useSWR from "swr";

type UseListedNftsResponse = {
}

type ListedNtsHookFactory = CryptHookFactory<any, UseListedNftsResponse>;

export type UseListedNftsHook = ReturnType<ListedNtsHookFactory>

export const hookFactory: ListedNtsHookFactory = ({contract}) => () => {
  const {data, ...swr} = useSWR(
    contract ? "web3/useListedNfts" : null,
    async () => {
      const nfts = [] as Nft[];
      const coreNfts = await contract!.getAllNftsOnSale();
      
      for(let i=0; i<coreNfts.length; i++) {
        const item = coreNfts[i];
        const tokenURI = await contract!.tokenURI(item.tokenId);
        const metaRes = await fetch(tokenURI);
        const meta = await metaRes.json();

        nfts.push({
          price: parseFloat(ethers.utils.formatEther(item.price)),
          tokenId: item.tokenId.toNumber(),
          creator: item.creator,
          isListed: item.isListed,
          meta,
        })
      }
      
      return nfts;
    },
)

return {
...swr,
data: data || [],
};
}