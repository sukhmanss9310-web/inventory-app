import {
  createCompanyWorkspace,
  getPlatformOverview,
  updateCompanyAccess,
  updateUserAccess
} from "../services/platformService.js";

export const getPlatformDashboard = async (req, res) => {
  const overview = await getPlatformOverview();

  return res.json({ overview });
};

export const createManagedCompany = async (req, res) => {
  const result = await createCompanyWorkspace(req.body, req.user);

  return res.status(201).json({
    message: "Company workspace created successfully",
    ...result
  });
};

export const updateManagedCompanyAccess = async (req, res) => {
  const company = await updateCompanyAccess(req.params.companyId, req.body.isActive, req.user);

  return res.json({
    message: `Company ${company.isActive ? "activated" : "suspended"} successfully`,
    company
  });
};

export const updateManagedUserAccess = async (req, res) => {
  const user = await updateUserAccess(req.params.userId, req.body.isActive, req.user);

  return res.json({
    message: `User ${user.isActive ? "enabled" : "disabled"} successfully`,
    user
  });
};
