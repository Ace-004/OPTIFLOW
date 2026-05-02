/**
 * Simple dev proxy: forward /api and /me to backend at localhost:5000
 * This keeps browser origin the same so HttpOnly cookies work in development.
 */
module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
      {
        source: "/me",
        destination: "http://localhost:5000/me",
      },
    ];
  },
};
