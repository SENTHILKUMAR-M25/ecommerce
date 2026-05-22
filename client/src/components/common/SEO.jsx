import React from "react";
import { Helmet } from "react-helmet-async";

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = "website" 
}) => {
  const siteName = "Aura Premium Store";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = "Discover the finest premium essentials at Aura. From exclusive deals to seasonal collections, we bring luxury right to your doorstep.";
  const metaDescription = description || defaultDescription;
  
  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {image && <meta name="twitter:image" content={image} />}
      
      {/* Accessibility & Other Socials */}
      <meta name="theme-color" content="#070B14" />
      <link rel="canonical" href={url || window.location.href} />
    </Helmet>
  );
};

export default SEO;
