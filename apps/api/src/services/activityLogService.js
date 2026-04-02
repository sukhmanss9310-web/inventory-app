import { ActivityLog } from "../models/ActivityLog.js";

export const createActivityLog = async (payload) => ActivityLog.create(payload);
