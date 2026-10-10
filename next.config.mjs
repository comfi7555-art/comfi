/** @type {import('next').NextConfig} */
import path from "path";

const nextConfig = {
  turbopack: {
    root: path.resolve("."),
  },
};

export default nextConfig;

