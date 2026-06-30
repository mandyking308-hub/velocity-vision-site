import { Helmet } from "react-helmet-async";

const SITE_URL = "https://velocity-outreach.com";

type SEOProps = {
  title: string;
  description: string;
  path: string; // e.g. "/services"
  image?: string;
  type?: "website" | "article";
  jsonLd?: object;
};

const SEO = ({ title, description, path, image, type = "website", jsonLd }: SEOProps) => {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
