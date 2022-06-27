import { MetaMaskInpageProvider } from "@metamask/providers";
import { Contract, providers } from "ethers"
import { SWRResponse } from "swr";

export type Web3Dependencies = {
    provider: providers.Web3Provider;
    contract: Contract;
    ethereum: MetaMaskInpageProvider;
}

export type CryptHookFactory<D = any, P = any> = {
    (d: Partial<Web3Dependencies>): CryptHandlerHook<D, P>
}

export type CryptHandlerHook<D = any, P = any> = (params: P) => CryptSWRResponse<D>

export type CryptSWRResponse<D = any> = SWRResponse<D>;