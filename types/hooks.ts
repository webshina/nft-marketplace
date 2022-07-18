import { MetaMaskInpageProvider } from "@metamask/providers";
import { Contract, providers } from "ethers"
import { SWRResponse } from "swr";
import { NftMarketContract } from "./nftMarketContract";

export type Web3Dependencies = {
    provider: providers.Web3Provider;
    contract: NftMarketContract;
    ethereum: MetaMaskInpageProvider;
    isLoading: boolean;
}

export type CryptoHookFactory<D = any, R = any, P = any> = {
    (d: Partial<Web3Dependencies>): CryptHandlerHook<D, R, P>
}

export type CryptHandlerHook<D = any, R = any, P = any> = (params?: P) => CryptSWRResponse<D, R>

export type CryptSWRResponse<D = any, R = any> = SWRResponse<D> & R;