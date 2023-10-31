/** @type {import('next').NextConfig} */
module.exports = {
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
