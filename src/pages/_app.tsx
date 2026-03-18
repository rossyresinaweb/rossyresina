import RootLayout from "@/components/RootLayout";
import AdminLayout from "@/components/admin/AdminLayout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { SessionProvider } from "next-auth/react";

import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect } from "react";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const router = useRouter();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  const isAdminRoute = router.pathname.startsWith("/admin");
  const isCapacitaciones =
    router.pathname.startsWith("/capacitaciones") ||
    router.pathname.startsWith("/comunidad") ||
    router.pathname.startsWith("/suscriptores") ||
    router.pathname === "/suscripcion" ||
    router.pathname === "/sign-in" ||
    router.pathname === "/register";

  const pageShellClass = "rr-page min-h-screen";
  const pageTransitionStyle = { animation: "rrPageEnter .22s ease-out both" } as const;

  useEffect(() => {
    if (!gaId) return;
    const track = (url: string) => {
      if (!(window as any).gtag) return;
      (window as any).gtag("config", gaId, { page_path: url });
    };
    router.events.on("routeChangeComplete", track);
    return () => router.events.off("routeChangeComplete", track);
  }, [router.events, gaId]);

  return (
    <Provider store={store}>
      <SessionProvider session={session}>
        <div className="font-bodyFont">
          <Head>
            <title>Rossy Resina</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            {googleSiteVerification && (
              <meta name="google-site-verification" content={googleSiteVerification} />
            )}
            <style>{`
                @keyframes rrPageEnter {
                  from { opacity: 0; transform: translateY(8px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                @media (prefers-reduced-motion: reduce) {
                  .rr-page {
                    animation: none !important;
                  }
                }
              `}</style>
          </Head>
          {gaId && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                strategy="afterInteractive"
              />
              <Script id="ga4-init" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    window.gtag = gtag;
                    gtag('js', new Date());
                    gtag('config', '${gaId}', { page_path: window.location.pathname });
                  `}
              </Script>
            </>
          )}
          {isAdminRoute ? (
            <AdminLayout>
              <div key={router.asPath} className={pageShellClass} style={pageTransitionStyle}>
                <Component {...pageProps} />
              </div>
            </AdminLayout>
          ) : isCapacitaciones ? (
            <div key={router.asPath} className={pageShellClass} style={pageTransitionStyle}>
              <Component {...pageProps} />
            </div>
          ) : (
            <RootLayout>
              <div key={router.asPath} className={`${pageShellClass} bg-gray-50`} style={pageTransitionStyle}>
                <Component {...pageProps} />
              </div>
            </RootLayout>
          )}
        </div>
      </SessionProvider>
    </Provider>
  );
}
