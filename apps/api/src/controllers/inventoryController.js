import {
  addReturn,
  createDispatch,
  resetCompanyInventory,
  resetInventoryStock
} from "../services/inventoryService.js";

export const dispatchProduct = async (req, res) => {
  const result = await createDispatch(req.body, req.user);

  return res.status(201).json({
    message: "Dispatch recorded successfully",
    ...result
  });
};

export const createReturn = async (req, res) => {
  const result = await addReturn(req.body, req.user);

  return res.status(201).json({
    message: "Return recorded successfully",
    ...result
  });
};

export const adjustInventory = async (req, res) => {
  const result = await resetInventoryStock(req.body, req.user);

  return res.status(201).json({
    message: "Inventory corrected successfully",
    ...result
  });
};

export const resetCompanyInventoryHandler = async (req, res) => {
  const result = await resetCompanyInventory(req.body, req.user, req.company);

  return res.status(201).json({
    message: "Company inventory reset successfully",
    ...result
  });
};
