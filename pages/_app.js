import { Web3Provider } from '@providers';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <ToastContainer />
      <Web3Provider>
        <Component {...pageProps} />
      </Web3Provider>
    </>
  );
}

export default MyApp;
