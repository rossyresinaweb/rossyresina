import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from "next/document";

type Props = DocumentInitialProps & {
  productJsonLd?: string;
};

class MyDocument extends Document<Props> {
  static async getInitialProps(ctx: DocumentContext): Promise<Props> {
    const initialProps = await Document.getInitialProps(ctx);
    const nextData: any = (initialProps as any).__NEXT_DATA__ || {};
    const page = String(nextData?.page || "");
    const product = nextData?.props?.pageProps?.product;
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://rossyresina.vercel.app";

    let productJsonLd = "";
    if (page === "/[_id]" && product && typeof product === "object") {
      const imageRaw = String(product.image || "");
      const image = imageRaw.startsWith("http")
        ? imageRaw
        : `${siteUrl}/${imageRaw.replace(/^\/+/, "")}`;
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: String(product.title || product.code || "Producto"),
        image: [image],
        description: String(product.description || ""),
        sku: String(product.code || product._id || ""),
        category: String(product.category || ""),
        brand: product.brand ? { "@type": "Brand", name: String(product.brand) } : undefined,
        offers: {
          "@type": "Offer",
          priceCurrency: "PEN",
          price: Number(product.price || 0).toFixed(2),
          availability:
            Number(product.stock || 1) > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          url: `${siteUrl}/${encodeURIComponent(String(product.code || product._id || ""))}`,
        },
      };
      productJsonLd = JSON.stringify(jsonLd);
    }

    return { ...initialProps, productJsonLd };
  }

  render() {
    return (
      <Html lang="es">
        <Head>
          <link rel="icon" href="/favicon.ico" type="image/x-icon" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Barlow:wght@200;300;400;500;600;700;800&family=Montserrat:wght@400;700&family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;600;700;800&display=swap"
            rel="stylesheet"
          />
          <meta name="theme-color" content="#6E2CA1" />
          {this.props.productJsonLd && (
            <script
              id="product-jsonld-document"
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: this.props.productJsonLd }}
            />
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
