import { getDashboardSummary } from "../services/dashboardService.js";

export const getDashboard = async (req, res) => {
  const dashboard = await getDashboardSummary();

  return res.json({ dashboard });
};
