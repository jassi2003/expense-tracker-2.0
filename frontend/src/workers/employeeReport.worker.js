// employeeReport.worker.js

function inDateRange(dateStr, from, to) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  return d >= from && d <= to;
}

function safeNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function monthKey(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "Invalid";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`; // ex: 2026-02
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function dayKey(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "Invalid";
  return DAYS[d.getDay()];
}

// Worker receiving message from employee controller/UI
self.onmessage = (e) => {
  const { type, payload } = e.data;
  if (type !== "GENERATE_EMPLOYEE_REPORT") return;

  const {
    expenses = [],
    fromDate,
    toDate,
    // pass logged in employee identifier from UI:
    // (use whichever you store: userId from token)
    employeeUserId,
    // optionally control which statuses count toward totals
    includeStatuses = ["APPROVED"], // default: only approved
  } = payload;

  const from = new Date(fromDate);
  const to = new Date(toDate);

  const report = {
    fromDate,
    toDate,
    employeeUserId,
    // headline metrics
    totalAmount: 0,
    expenseCount: 0,

    // breakdowns
    byStatus: {},      // { APPROVED: {total,count}, PENDING: ... }
    byMonth: {},       // { "2026-02": {total,count} }
    byTag: {},         // { Travel: {total,count} }
    byDayOfWeek: {},   // { Mon: {total,count} }

    // top items
    topExpenses: [],   // [{ title, amount, date, status, tags }]

    // helpful metadata
    currency: "INR",
    department: null,
    generatedAt: new Date().toISOString(),
  };

  // init day keys
  DAYS.forEach((d) => (report.byDayOfWeek[d] = { total: 0, count: 0 }));

  const top = []; // temp array for top expenses

  expenses.forEach((exp) => {
    //  match only this employee’s expenses
    const expUserId = exp?.raisedBy?.userId || exp?.userId;
    if (!employeeUserId || expUserId !== employeeUserId) return;

    // date filter (your schema uses expenseDate)
    const dateStr = exp.expenseDate || exp.date;
    if (!inDateRange(dateStr, from, to)) return;

    const status = (exp.status || "UNKNOWN").toUpperCase();
    const amt = safeNumber(exp.amount ?? exp.amountINR);

    // status breakdown (for ALL statuses in range)
    if (!report.byStatus[status]) report.byStatus[status] = { total: 0, count: 0 };
    report.byStatus[status].total += amt;
    report.byStatus[status].count += 1;

    // only include selected statuses in totals (default APPROVED)
    if (!includeStatuses.map((s) => s.toUpperCase()).includes(status)) return;
    if (amt <= 0) return;

    report.expenseCount += 1;
    report.totalAmount += amt;

    // department snapshot (optional)
    if (!report.department) {
      report.department = exp?.raisedBy?.dept || exp?.department || null;
    }

    // month breakdown
    const mk = monthKey(dateStr);
    if (!report.byMonth[mk]) report.byMonth[mk] = { total: 0, count: 0 };
    report.byMonth[mk].total += amt;
    report.byMonth[mk].count += 1;

    // tag breakdown
    const tags = Array.isArray(exp.tags) ? exp.tags : [];
    if (tags.length === 0) {
      const t = "Untagged";
      if (!report.byTag[t]) report.byTag[t] = { total: 0, count: 0 };
      report.byTag[t].total += amt;
      report.byTag[t].count += 1;
    } else {
      tags.forEach((tRaw) => {
        const t = String(tRaw || "").trim() || "Untagged";
        if (!report.byTag[t]) report.byTag[t] = { total: 0, count: 0 };
        report.byTag[t].total += amt;
        report.byTag[t].count += 1;
      });
    }

    // day of week breakdown
    const dk = dayKey(dateStr);
    if (!report.byDayOfWeek[dk]) report.byDayOfWeek[dk] = { total: 0, count: 0 };
    report.byDayOfWeek[dk].total += amt;
    report.byDayOfWeek[dk].count += 1;

    // collect top expenses
    top.push({
      id: exp._id,
      title: exp.title || "Untitled",
      amount: amt,
      currency: exp.currency || "INR",
      date: dateStr,
      status,
      tags,
    });
  });

  // Top 5 by amount
  top.sort((a, b) => b.amount - a.amount);
  report.topExpenses = top.slice(0, 5);

  self.postMessage({
    type: "DONE",
    payload: report,
  });
};
