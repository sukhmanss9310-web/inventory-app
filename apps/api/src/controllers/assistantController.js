import { chatWithAssistant, executeAssistantAction } from "../services/assistantService.js";

export const chatWithInventoryAssistant = async (req, res) => {
  const response = await chatWithAssistant(req.body, req.user, req.company);

  return res.json(response);
};

export const executeInventoryAssistantAction = async (req, res) => {
  const response = await executeAssistantAction(req.body, req.user);

  return res.json(response);
};
