import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DashboardService } from "./dashborard.service";

const getDashboardSummary = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;

  let data = {};

  if (user.role === "ADMIN") {
    data = await DashboardService.adminSummary();
  }

  if (user.role === "GUIDE") {
    data = await DashboardService.guideSummary(user.userId);
  }

  if (user.role === "TOURIST") {
    data = await DashboardService.touristSummary(user.userId);
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Dashboard data fetched",
    data,
  });
});

export const DashboardController = {
  getDashboardSummary,
};
