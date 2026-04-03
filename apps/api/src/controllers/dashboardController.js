import { getDashboardSummary } from "../services/dashboardService.js";

export const getDashboard = async (req, res) => {
  const dashboard = await getDashboardSummary(req.user.companyId);

  return res.json({ dashboard });
};
