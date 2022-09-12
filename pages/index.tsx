/* eslint-disable @next/next/no-img-element */

import { ExclamationIcon } from '@heroicons/react/outline';
import { useNetwork } from '@hooks/web3';
import { BaseLayout, NftList } from '@ui';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  const { network } = useNetwork();

  return (
    <BaseLayout>
      <div className="relative bg-gray-800 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
        <div className="absolute inset-0">
          <div className="bg-gray-800 h-1/3 sm:h-2/3" />
        </div>
        <div className="relative">
          <div className="text-center">
            <h2 className="text-3xl tracking-tight font-extrabold text-white sm:text-4xl">
              Craft Beer NFTs
            </h2>

            {network.isConnectedToNetwork ? (
              <NftList />
            ) : (
              <div className="rounded-md bg-yellow-50 p-4 mt-10">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationIcon
                      className="h-5 w-5 text-yellow-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Attention needed
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        {network.isLoading
                          ? 'Loading...'
                          : `Connect to ${network.targetNetwork}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default Home;
