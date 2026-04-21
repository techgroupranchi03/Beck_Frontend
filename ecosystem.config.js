export default {
  apps: [
    {
      name: "beck_frontend",
      cwd: "/home/taskbnbuser/app/beckholidayhomes/admin/Beck_Frontend",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 7001
      }
    }
  ]
};
