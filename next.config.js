/** @type {import('next').NextConfig} */
module.exports = {
  // async redirects() {
  //   return [
  //     {
  //       source: "/",
  //       destination: "/list/image",
  //       permanent: false,
  //     },
  //   ];
  // },
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  // webpack: (config) => {
  //   return {
  //     ...config,
  //     devtool: "inline-source-map",
  //   };
  // },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    //* Because of viem package build error.
    ignoreBuildErrors: true,
  },
};
