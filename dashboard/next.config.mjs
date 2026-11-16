/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "date-fns",
      "@radix-ui/react-icons",
    ],
  },
};

export default nextConfig;
