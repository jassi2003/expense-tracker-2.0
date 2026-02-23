// utils/getQuarterDates.ts
export function getQuarterDates(year: number, quarter: number) {
  const startMonth = (quarter - 1) * 3;

  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, startMonth + 3, 0);

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}