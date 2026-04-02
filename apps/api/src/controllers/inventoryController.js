import { addReturn, createDispatch } from "../services/inventoryService.js";

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
