import { NftMarketContract } from '@_types/nftMarketContract';
import * as utils from 'ethereumjs-util';
import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import { Session, withIronSession } from 'next-iron-session';
import contract from '../../public/contracts/NftMarket.json';

const NETWORKS = {
  '5777': 'Ganache',
  '3': 'Ropsten',
};

type NETWORK = typeof NETWORKS;

const abi = contract.abi;
const targetNetwork = process.env.NEXT_PUBLIC_NETWORK_ID as keyof NETWORK;

export const contractAddress = contract['networks'][targetNetwork]['address'];
export const pinataApiKey = process.env.PINATA_API_KEY as string;
export const pinataSecretApiKey = process.env.PINATA_API_SECRET_KEY as string;

export function withSession(handler: any) {
  return withIronSession(handler, {
    password: process.env.SECRET_COOKIE_PASSWORD as string,
    cookieName: 'nft-auth-session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production' ? true : false,
    },
  });
}

const url =
  process.env.NODE_ENV === 'production'
    ? process.env.INFURA_ROPSTEN_URL
    : 'http://127:0:0:1:7545';

export const addressCheckMiddleware = (
  req: NextApiRequest & { session: Session },
  res: NextApiResponse
) => {
  return new Promise(async (resolve, reject) => {
    // セッションに保存したメッセージを取得
    const message = req.session.get('message-session');
    // ethereumネットワーク情報を取得
    const provider = new ethers.providers.JsonRpcProvider(url);
    // ethereumネットワーク上のコントラクトを取得
    const contract = new ethers.Contract(
      contractAddress,
      abi,
      provider
    ) as unknown as NftMarketContract;

    // メッセージをバッファ変換
    let nonce: string | Buffer =
      '\x19Ethereum Signed Message:\n' +
      JSON.stringify(message).length +
      JSON.stringify(message);
    nonce = utils.keccak(Buffer.from(nonce, 'utf-8'));

    // ユーザー署名をパラメータに分割
    const { v, r, s } = utils.fromRpcSig(req.body.signature);
    // ユーザー署名とメッセージからパブリックキーを復号
    const pubKey = utils.ecrecover(utils.toBuffer(nonce), v, r, s);
    // パブリックキーからアドレスを取得
    const addrBuffer = utils.pubToAddress(pubKey);
    const address = utils.bufferToHex(addrBuffer);

    // リクエストで送られたアドレスと、ユーザー署名から復号したアドレスが正しいことを確認
    if (address === req.body.address) {
      resolve('Correct Address');
    } else {
      reject('Wrong Address');
    }
  });
};
