import "../styles/globals.css";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>roaster2000</title>
        <meta name="description" content="a savage ai that tears your online persona to shreds" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#ff0000" />
        <meta property="og:title" content="roaster2000" />
        <meta property="og:description" content="get roasted so hard you'll delete your account" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://roaster2000.vercel.app" />
        <meta property="og:image" content="https://roaster2000.vercel.app/image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="roaster2000" />
        <meta name="twitter:description" content="where your dignity goes to die" />
        <meta name="twitter:image" content="https://roaster2000.vercel.app/image.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
