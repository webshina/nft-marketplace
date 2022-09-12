import { CryptoHookFactory } from '@_types/hooks';
import { Nft } from '@_types/nft';
import { ethers } from 'ethers';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';

type UseListedNftsResponse = {
  buyNft: (token: number, value: number) => Promise<void>;
};

type ListedNftsHookFactory = CryptoHookFactory<Nft[], UseListedNftsResponse>;

export type UseListedNftsHook = ReturnType<ListedNftsHookFactory>;

export const hookFactory: ListedNftsHookFactory =
  ({ contract }) =>
  () => {
    const { data, ...swr } = useSWR(
      contract ? 'web3/useListedNfts' : null,
      async () => {
        const nfts = [] as Nft[];

        const coreNfts = await contract!.getAllNftsOnSale();

        for (let i = 0; i < coreNfts.length; i++) {
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
          });
        }

        return nfts;
      }
    );

    const _contract = contract;
    const buyNft = useCallback(
      async (tokenId: number, value: number) => {
        try {
          const result = await _contract?.buyNft(tokenId, {
            value: ethers.utils.parseEther(Num2FracStr(value)),
          });

          const res = await toast.promise(result!.wait(), {
            pending: 'Processing transactions',
            success: 'Nft is yours! Go to Profile page',
            error: 'Processing error',
          });

          alert('You have bought Nft. See profile page.');
        } catch (e: any) {
          console.error(e.message);
        }
      },
      [_contract]
    );

    return {
      ...swr,
      buyNft,
      data: data || [],
    };
  };

const Num2FracStr = (number: number) => {
  /*
   * 引数の値を文字列化
   */
  const numStr = String(number);

  /*
   * 正規表現でマッチング
   */
  const match = numStr.match(
    /^([+-]?)0*([1-9][0-9]*|)(?:\.([0-9]*[1-9]|)0*)?(?:[eE]([+-]?[0-9]+))?$/
  );

  /*
   * 引数の型が適切な形式ではない場合…
   */
  if (!match) {
    if (typeof number == 'number') {
      /*
       * 引数の型が数値であれば、文字列化した値をそのまま返す
       */
      return numStr;
    } else {
      /*
       * 引数の型が数値でなければ、エラーにする
       */
      throw new Error(`Invalid Number: "${numStr}"`);
    }
  }

  /** @type {string} 数の符号 */
  const sign = match[1] === '-' ? '-' : '';
  /** @type {string} 仮数部の整数部 */
  const mantissa_int = match[2];
  /** @type {string} 仮数部の少数部 */
  const mantissa_frac = match[3] ? match[3] : '';
  /** @type {number} 指数部 */
  const exponent = Number(match[4]);

  let returnValue = '';

  if (exponent) {
    /*
     * exponentがundefinedではなく（正規表現で指数部がマッチしていて）、
     * かつ、0ではない場合、指数表記として処理を開始する
     *
     * Note: 指数部が0の場合、ここで処理する意味は無いので少数表記として処理する。
     *       よって、指数部が0以外の場合にここで処理する。
     * Note: undefinedは数値化されるとNaNになり、false相当となる。
     *       一方、0の場合もfalse相当となる。
     *       ので、↑の条件文はコレで合っている。
     */

    /** @type {string} */
    const mantissa_str = mantissa_int + mantissa_frac;
    /** @type {number} */
    const mantissa_len = mantissa_str.length;

    if (0 < mantissa_len) {
      /** @type {number} */
      const mantissa_int_len = mantissa_int.length + exponent;

      /*
        12.145e+7  121450000             ;  mantissa_str: "12145"  mantissa_int_len: 9   ;  小数部が存在しない数値
        12.145e+6   12145000             ;  mantissa_str: "12145"  mantissa_int_len: 8   ;  小数部が存在しない数値
        12.145e+5    1214500             ;  mantissa_str: "12145"  mantissa_int_len: 7   ;  小数部が存在しない数値
        12.145e+4     121450             ;  mantissa_str: "12145"  mantissa_int_len: 6   ;  小数部が存在しない数値
        12.145e+3      12145             ;  mantissa_str: "12145"  mantissa_int_len: 5   ;  小数部が存在しない数値
        12.145e+2       1214.5           ;  mantissa_str: "12145"  mantissa_int_len: 4   ;  小数部が存在し、かつ、1より大きい数値
        12.145e+1        121.45          ;  mantissa_str: "12145"  mantissa_int_len: 3   ;  小数部が存在し、かつ、1より大きい数値
        12.145e0          12.145         ;  mantissa_str: "12145"  mantissa_int_len: 2   ;  小数部が存在し、かつ、1より大きい数値
        12.145e-1          1.2145        ;  mantissa_str: "12145"  mantissa_int_len: 1   ;  小数部が存在し、かつ、1より大きい数値
        12.145e-2          0.12145       ;  mantissa_str: "12145"  mantissa_int_len: 0   ;  小数部が存在し、かつ、1未満の数値
        12.145e-3          0.012145      ;  mantissa_str: "12145"  mantissa_int_len: -1  ;  小数部が存在し、かつ、1未満の数値
        12.145e-4          0.0012145     ;  mantissa_str: "12145"  mantissa_int_len: -2  ;  小数部が存在し、かつ、1未満の数値
        12.145e-5          0.00012145    ;  mantissa_str: "12145"  mantissa_int_len: -3  ;  小数部が存在し、かつ、1未満の数値
        12.145e-6          0.000012145   ;  mantissa_str: "12145"  mantissa_int_len: -4  ;  小数部が存在し、かつ、1未満の数値
        12.145e-7          0.0000012145  ;  mantissa_str: "12145"  mantissa_int_len: -5  ;  小数部が存在し、かつ、1未満の数値
        */

      if (mantissa_len <= mantissa_int_len) {
        /*
         * 小数部が存在しない数値（ex: 0, 12, 176, 1214500）の場合の処理
         */
        returnValue = mantissa_str.padEnd(mantissa_int_len, '0');
      } else if (0 < mantissa_int_len) {
        /*
         * 小数部が存在し、かつ、1より大きい数値（ex: 1.26, 1.0009, 121.45）の場合の処理
         */
        returnValue =
          mantissa_str.slice(0, mantissa_int_len) +
          '.' +
          mantissa_str.slice(mantissa_int_len);
      } else {
        /*
         * 小数部が存在し、かつ、1未満の数値（ex: 0.26, 0.20098, 0.0012145）の場合の処理
         */
        returnValue = '0.' + '0'.repeat(-mantissa_int_len) + mantissa_str;
      }
    }
  } else if (mantissa_frac) {
    /*
     * 少数表記の場合
     */
    returnValue = (mantissa_int || '0') + '.' + mantissa_frac;
  } else if (mantissa_int) {
    /*
     * 整数表記の場合
     */
    returnValue = mantissa_int;
  }

  return returnValue
    ? sign +
        returnValue
          /* 先頭の余計なゼロを削除 */
          .replace(/^(?:0(?!\.|$))+/, '')
          /* 末尾の余計なゼロを削除 */
          .replace(/(?:\.0+|(\.[0-9]*[1-9])0+)$/, '$1')
    : '0';
};
