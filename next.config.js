/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/list",
        permanent: true,
      },
    ];
  },
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  // webpack: (config) => {
  //   return {
  //     ...config,
  //     devtool: "inline-source-map",
  //   };
  // },
};

module.exports = nextConfig;
