/** @type {import('next').NextConfig} */
const nextConfig = {
   images:{
    remotePatterns:[
        {
            protocol:"https",
            hostname:"randomuser.me"
        },
    ],
   },
   allowedDevOrigins: ['192.168.1.33', 'localhost'],
};
export default nextConfig;
