import { getOverallAnalyticsService,getDepartmentAnalyticsService,getUserAnalyticsService } from "./analytics.service.js";
import { generateExpenseExcel } from "../utils/excelFileGenerator.js";
import { sendReportEmail } from "../utils/mailer.js";



//generating analytics, converting it into excel file and mailing the file to user
export const generateAndSendReport = async ({
  fromDate,
  toDate,
  email
}) => {

  console.log("Generating report...");

  const overall = await getOverallAnalyticsService({
    fromDate,
    toDate
  });

  const dept = await getDepartmentAnalyticsService({
    fromDate,
    toDate,
    paginate: false
  });

  const users = await getUserAnalyticsService({
    fromDate,
    toDate,
    paginate: false
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