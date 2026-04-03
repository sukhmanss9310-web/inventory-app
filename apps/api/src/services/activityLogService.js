import { ActivityLog } from "../models/ActivityLog.js";

export const createActivityLog = async (payload, options = {}) => {
  if (options.session) {
    const [createdLog] = await ActivityLog.create([payload], { session: options.session });
    return createdLog;
  }

  return ActivityLog.create(payload);
};
