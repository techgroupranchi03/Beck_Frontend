module.exports = {
  apps: [
    {
      name: "beck_frontend",
      script: "npm",
      args: "start",
      cwd: "/home/taskbnbuser/app/beckholidayhomes/admin/Beck_Frontend",
      interpreter: "none",
      env: {
        NODE_ENV: "production",
        PORT: 7001
      }
    }
  ]
};
