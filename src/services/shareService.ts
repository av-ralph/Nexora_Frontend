export interface ShareMetadata {
  title: string;
  image: string;
  description: string;
  url: string;
}

export const buildPageUrl = () => window.location.href;

export const getPreviewMetadata = (title: string, image: string, description: string): ShareMetadata => ({
  title,
  image,
  description,
  url: buildPageUrl(),
});

export const getSocialLinks = (metadata: ShareMetadata) => {
  const encodedUrl = encodeURIComponent(metadata.url);
  const encodedTitle = encodeURIComponent(metadata.title);
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
  };
};
