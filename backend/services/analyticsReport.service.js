import { getOverallAnalyticsService, getDepartmentAnalyticsService, getUserAnalyticsService } from "./analytics.service.js";
import { generateExpenseExcel } from "../utils/excelFileGenerator.js";
import { sendReportEmail } from "../utils/mailer.js";



//generating analytics, converting it into excel file and mailing the file to user
export const generateAndSendReport = async ({
  fromDate,
  toDate,
  email,
  organizationId

}) => {


  if (!organizationId) {
    throw new Error("organizationId is required for report generation");
  }

  console.log("Generating report...");

  const overall = await getOverallAnalyticsService({
    fromDate,
    toDate,
    organizationId

  });

  const dept = await getDepartmentAnalyticsService({
    fromDate,
    toDate,
    paginate: false,
    organizationId

  });

  const users = await getUserAnalyticsService({
    fromDate,
    toDate,
    paginate: false,
    organizationId

  });

  const excelBuffer = await generateExpenseExcel({
    overallData: overall.result,
    deptData: dept.data,
    userData: users.data
  });

  await sendReportEmail({
    email,
    excelBuffer
  });

  console.log("Report emailed successfully");

};