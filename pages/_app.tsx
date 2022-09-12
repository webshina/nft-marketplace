import { Web3Provider } from '@providers';
import type { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <ToastContainer />
      <Web3Provider>
        <>
          <Component {...pageProps} />
        </>
      </Web3Provider>
    </>
  );
}

export default MyApp;
