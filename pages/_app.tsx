import type { AppProps } from "next/app";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import "../styles/globals.css";
// import { Header } from "../components/Header"
// This is the chainId your dApp will work on.

import Nav from "../components/Navbar";
import Sidebar from "../components/Sidebar";
const activeChainId = ChainId.BinanceSmartChainMainnet;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider desiredChainId={activeChainId}>
      {/* <Header /> */}
      <Nav />
      <Sidebar />
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
