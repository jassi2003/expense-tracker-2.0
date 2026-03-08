import ExcelJS from "exceljs";

export const generateExpenseExcel = async ({
  overallData,
  deptData,
  userData
}) => {

  const workbook = new ExcelJS.Workbook();

  /*
  ======================
  OVERALL ANALYTICS
  ======================
  */

  const overallSheet = workbook.addWorksheet("Overall Analytics");

  overallSheet.columns = [
    { header: "Year", key: "year", width: 10 },
    { header: "Total Amount", key: "totalAmount", width: 20 },
    { header: "Total Count", key: "totalCount", width: 15 },
    { header: "Approved Amount", key: "approvedAmount", width: 20 },
    { header: "Approved Count", key: "approvedCount", width: 20 },
    { header: "Rejected Amount", key: "rejectedAmount", width: 20 },
    { header: "Rejected Count", key: "rejectedCount", width: 20 }
  ];

  overallData.forEach(item => {
    overallSheet.addRow({
      year: item._id.year,
      totalAmount: item.totalAmount,
      totalCount: item.totalCount,
      approvedAmount: item.approvedAmount,
      approvedCount: item.approvedCount,
      rejectedAmount: item.rejectedAmount,
      rejectedCount: item.rejectedCount
    });
  });

  /*
  ======================
  DEPARTMENT ANALYTICS
  ======================
  */

  const deptSheet = workbook.addWorksheet("Department Analytics");

  deptSheet.columns = [
    { header: "Year", key: "year", width: 10 },
    { header: "Month", key: "month", width: 10 },
    { header: "Department", key: "dept", width: 20 },
    { header: "Total Amount", key: "totalAmount", width: 20 },
    { header: "Total Count", key: "totalCount", width: 15 },
    { header: "Approved Amount", key: "approvedAmount", width: 20 },
    { header: "Approved Count", key: "approvedCount", width: 20 },
    { header: "Rejected Amount", key: "rejectedAmount", width: 20 },
    { header: "Rejected Count", key: "rejectedCount", width: 20 },
    { header: "Department Budget", key: "departmentBudget", width: 20 },
    { header: "Budget Utilization (%)", key: "departmentUtilization", width: 20 }
  ];

  deptData.forEach(row => {
    deptSheet.addRow(row);
  });

  /*
  ======================
  USER ANALYTICS
  ======================
  */

  const userSheet = workbook.addWorksheet("User Analytics");

  userSheet.columns = [
    { header: "Year", key: "year", width: 10 },
    { header: "Month", key: "month", width: 10 },
    { header: "Department", key: "dept", width: 20 },
    { header: "User ID", key: "userId", width: 20 },
    { header: "Total Amount", key: "totalAmount", width: 20 },
    { header: "Total Count", key: "totalCount", width: 15 },
    { header: "Approved Amount", key: "approvedAmount", width: 20 },
    { header: "Approved Count", key: "approvedCount", width: 20 },
    { header: "Rejected Amount", key: "rejectedAmount", width: 20 },
    { header: "Rejected Count", key: "rejectedCount", width: 20 }
  ];

  userData.forEach(row => {
    userSheet.addRow(row);
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
};