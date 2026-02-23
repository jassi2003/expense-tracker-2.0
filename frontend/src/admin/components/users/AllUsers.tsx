import { useState } from "react";
import type { UserRow } from "../../pages/User";

type Props = {
  users: UserRow[];
  onDeactivate: (mongoId: string) => Promise<void>;
  onActivate: (mongoId: string) => Promise<void>;
};

const AllUsersTable: React.FC<Props> = ({
  users,
  onDeactivate,
  onActivate,
}) => {
  const [actionLoadingId, setActionLoadingId] = useState<string>("");

  if (!users.length) {
    return (
      <div className="rounded-xl border bg-slate-50 p-4 text-slate-600">
        No users found.
      </div>
    );
  }

  const handleAction = async (u: UserRow) => {
    setActionLoadingId(u._id);
    try {
      if (u.isActive) {
        await onDeactivate(u._id);
      } else {
        await onActivate(u._id);
      }
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="text-left font-semibold px-4 py-3">User ID</th>
            <th className="text-left font-semibold px-4 py-3">Name</th>
            <th className="text-left font-semibold px-4 py-3">Email</th>
            <th className="text-left font-semibold px-4 py-3">Department</th>
            <th className="text-left font-semibold px-4 py-3">Role</th>
            <th className="text-left font-semibold px-4 py-3">Status</th>
            <th className="text-right font-semibold px-4 py-3">Action</th>
          </tr>
        </thead>

        <tbody className="divide-y bg-white">
          {users.map((u) => {
            const isBusy = actionLoadingId === u._id;

            return (
              <tr key={u._id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {u.userId}
                </td>
                <td className="px-4 py-3 text-slate-800">{u.name}</td>
                <td className="px-4 py-3 text-slate-700">{u.email}</td>
                <td className="px-4 py-3 text-slate-700 uppercase">{u.empdepartment}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full border bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.isActive ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-50 border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700">
                      Inactive
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleAction(u)}
                    disabled={isBusy}
                    className={
                      u.isActive
                        ? "px-3 py-1.5 rounded-lg text-xs font-semibold border bg-red-50 border-red-200 text-red-700 hover:bg-red-100 disabled:opacity-60"
                        : "px-3 py-1.5 rounded-lg text-xs font-semibold border bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                    }
                  >
                    {isBusy
                      ? "Please wait..."
                      : u.isActive
                      ? "Deactivate User"
                      : "Activate User"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AllUsersTable;