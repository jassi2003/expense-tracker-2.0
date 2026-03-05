import expenseModel from "../models/expense.model.js";


// //overall analytis 
export const getOverallAnalyticsService = async ({
  fromDate,
  toDate,
}) => {


  const pipeline = [
    {
      $match: {
        expenseDate: {
          $gte: new Date(fromDate),
          $lte: new Date(toDate)
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$expenseDate" },
          
        },
        totalAmount: { $sum: "$amount" },
        totalCount: { $sum: 1 },
        approvedAmount: {
          $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, "$amount", 0] }
        },
        approvedCount: {
          $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] }
        },
        rejectedAmount: {
          $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, "$amount", 0] }
        },
        rejectedCount: {
          $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] }
        }
      }
    },
    { $sort: { "_id.year": -1}},
  ];

  const result = await expenseModel.aggregate(pipeline);

  return {
    success:true,
    totalMonths:result.length,
    result
  };
};


//deprtment analytics
export const getDepartmentAnalyticsService = async ({
  fromDate,
  toDate,
  page = 1,
  limit = 10,
  paginate = true
}) => {

  const skip = (page - 1) * limit;

  const pipeline = [
    {
      $match: {
        expenseDate: {
          $gte: new Date(fromDate),
          $lte: new Date(toDate)
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$expenseDate" },
          month: { $month: "$expenseDate" },
          dept: "$raisedBy.dept"
        },
        totalAmount: { $sum: "$amount" },
        totalCount: { $sum: 1 },
        approvedAmount: {
          $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, "$amount", 0] }
        },
        approvedCount: {
          $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] }
        },
        rejectedAmount: {
          $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, "$amount", 0] }
        },
        rejectedCount: {
          $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] }
        },

         departmentBudget: { $first: "$departmentSnapshot.totalBudget" }

      }
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        dept: "$_id.dept",
    totalAmount: { $round: ["$totalAmount", 2] },
        totalCount: 1,
        approvedAmount: 1,
        approvedCount: 1,
        rejectedAmount: 1,
        rejectedCount: 1,
        departmentBudget: 1,
departmentUtilization: {
          $cond: [
            { $gt: ["$departmentBudget", 0] },
            {
              $round: [
                {
                  $multiply: [
                    { $divide: ["$totalAmount", "$departmentBudget"] },
                    100
                  ]
                },
                2
              ]
            },
            0
          ]
        }
      }
    },
    { $sort: { year: -1, month: 1, totalAmount: -1 } }
  ];

  if (paginate) {
    pipeline.push({
      $facet: {
        metadata: [{ $count: "totalRecords" }],
        data: [{ $skip: skip }, { $limit: Number(limit) }]
      }
    });
  }

  const result = await expenseModel.aggregate(pipeline);

  if (!paginate) {
    return { data: result };
  }

  const totalRecords = result[0]?.metadata[0]?.totalRecords || 0;
  const data = result[0]?.data || [];

  return {
    page: Number(page),
    totalRecords,
    totalPages: Math.ceil(totalRecords / limit),
    data
  };
};






// //user analytics
export const getUserAnalyticsService = async ({
  fromDate,
  toDate,
  dept,
  page = 1,
  limit = 10,
  paginate = true
}) => {

  const skip = (page - 1) * limit;

  const matchStage = {
    expenseDate: {
      $gte: new Date(fromDate),
      $lte: new Date(toDate)
    }
  };

  if (dept) {
    matchStage["raisedBy.dept"] = dept;
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: "$expenseDate" },
          month: { $month: "$expenseDate" },
          userId: "$raisedBy.userId",
          dept: "$raisedBy.dept"
        },
        totalAmount: { $sum: "$amount" },
        totalCount: { $sum: 1 },
        approvedAmount: {
          $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, "$amount", 0] }
        },
        approvedCount: {
          $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] }
        },
        rejectedAmount: {
          $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, "$amount", 0] }
        },
        rejectedCount: {
          $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        dept: "$_id.dept",
        userId: "$_id.userId",
    totalAmount: { $round: ["$totalAmount", 2] },
        totalCount: 1,
        approvedAmount: 1,
        approvedCount: 1,
        rejectedAmount: 1,
        rejectedCount: 1
      }
    },
    { $sort: { year: -1, month: 1, totalAmount: -1 } }
  ];

  if (paginate) {
    pipeline.push({
      $facet: {
        metadata: [{ $count: "totalRecords" }],
        data: [{ $skip: skip }, { $limit: Number(limit) }]
      }
    });
  }

  const result = await expenseModel.aggregate(pipeline);

  if (!paginate) {
    return { data: result };
  }

  const totalRecords = result[0]?.metadata[0]?.totalRecords || 0;
  const data = result[0]?.data || [];

  return {
    page: Number(page),
    totalRecords,
    totalPages: Math.ceil(totalRecords / limit),
    data
  };
};