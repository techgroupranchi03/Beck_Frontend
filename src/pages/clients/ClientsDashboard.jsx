import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import {
  People,
  PersonAdd,
  PersonOff,
  TrendingUp,
} from "@mui/icons-material";

const palette = {
  primary: "#407f68",
  lightGreen: "#96d980",
  accent: "#6b603f",
  cream: "#fef7c5",
};

export default function ClientsDashboard() {
  return (
    <>
      {/* Metric Cards */}
      <Grid container spacing={3} mb={6} sx={{mt: 4}}>
        {[
          { label: "TOTAL CLIENTS", value: 500, icon: <People />, color: palette.primary },
          { label: "ACTIVE CLIENTS", value: 200, icon: <PersonAdd />, color: palette.primary },
          { label: "INACTIVE CLIENTS", value: 300, icon: <PersonOff />, color: palette.primary },
          { label: "NEW / 30 DAYS", value: 200, icon: <TrendingUp />, color: palette.primary },
        ].map((c, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} item key={i}>
            <Card sx={{ bgcolor: c.color, color: "#fff", borderRadius: 2, boxShadow: 3, elevation: 0 }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {React.cloneElement(c.icon, { fontSize: "large" })}
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>{c.label}</Typography>
                  <Typography variant="h4" fontWeight={700}>{c.value}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {["Client Growth (Line chart)", "Status Distribution (Pie chart)"].map((title, i) => (
          <Grid size={{ xs: 12, md: 6 }} item key={i}>
            <Card sx={{ height: 300, bgcolor: palette.cream, p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>{title}</Typography>
              <Box
                sx={{
                  height: "100%",
                  bgcolor: "#fff",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#aaa",
                }}
              >
                [Chart placeholder]
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}