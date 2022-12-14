import { AppProps } from "next/app";
import { Provider, useCreateStore } from "../components/Store/Store";
import React, { useEffect, useState } from "react";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import Navbar from "../components/Navbar/Navbar";
import Background from "../components/Background/Background";
import { useRouter } from "next/router";
import Loading from "../components/common/Loading";
import ReactGA from "react-ga4";
// import { SessionProvider } from "next-auth/react";

const App = (props: AppProps) => {
  const { Component, pageProps } = props;
  const createStore = useCreateStore(pageProps.initialZustandState);

  const [queryClient] = React.useState(() => new QueryClient());
  const router = useRouter();

  const ONE_DAY_SECONDS = 60 * 60 * 24;

  pageProps.res?.setHeader(
    "Cache-Control",
    `s-maxage=1, stale-while-revalidate=${ONE_DAY_SECONDS}`
  );

  const [state, setState] = useState({
    isRouteChanging: false,
    loadingKey: 0,
  });
  useEffect(() => {
    ReactGA.initialize(process.env.NEXT_PUBLIC_ANALYTICS_CODE);
  }, []);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      ReactGA.send({ hitType: "pageview", page: router.pathname });

      setState((prevState) => ({
        ...prevState,
        isRouteChanging: true,
        loadingKey: prevState.loadingKey ^ 1,
      }));
    };

    const handleRouteChangeEnd = () => {
      setState((prevState) => ({
        ...prevState,
        isRouteChanging: false,
      }));
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeEnd);
    router.events.on("routeChangeError", handleRouteChangeEnd);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeEnd);
      router.events.off("routeChangeError", handleRouteChangeEnd);
    };
  }, [router.events]);

  return (
    // <SessionProvider session={session}>
    <Provider createStore={createStore}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <Background>
            <Loading
              isRouteChanging={state.isRouteChanging}
              key={state.loadingKey}
            />
            <Navbar />

            <Component {...pageProps} />
          </Background>
        </Hydrate>
      </QueryClientProvider>
    </Provider>
    // </SessionProvider>
  );
};
export default App;
