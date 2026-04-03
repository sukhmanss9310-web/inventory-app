import { getActivityLogs } from "../services/logService.js";

export const listLogs = async (req, res) => {
  const result = await getActivityLogs(req.query, req.user.companyId);

  return res.json(result);
};
