
// type UnreportedRow = {
//   id: string;
//   title: string;
//   amount: number;
//   message:string
// };

// type ReviewProps = {
//   title?: string;
//   rows?: UnreportedRow[];
// };



// export default function MarkedForReview({
//   title = "MARKED FOR REVIEW",
//   rows = [{ id: "1", title: "flight", amount:1000,message:"budget excedded" }],
// }: ReviewProps) {
//   return (
//     <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
//       <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
//         <div className="text-xs font-semibold tracking-wide text-slate-600">{title}</div>
//       </div>

//       <div className="p-4">
//         <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-slate-500">
//           <span>TITLE</span>
//           <span>MESSAGE FROM ADMIN</span>
//         </div>

//         <div className="divide-y divide-slate-100">
//           {rows.map((r) => (
//             <div key={r.id} className="flex items-center justify-between py-3">
//               <div className="flex min-w-0 items-center gap-3">
//                 {/* <Avatar  /> */}
//                 <div className="min-w-0">
//                   <div className="truncate text-sm font-medium text-slate-900">{r.title}</div>
//                   <div className="truncate text-xs text-slate-500">{r.amount}</div>
//                 </div>
//               </div>

//               <div className="text-sm font-semibold text-slate-900">{r.message}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
