type AppHeaderProps = {
  userName: string;
};

export default function AppHeader({ userName }: AppHeaderProps) {
  const firstLetter = userName?.charAt(0).toUpperCase();

  return (
    <header className="w-full bg-slate-900 text-white shadow-md">
      <div className="mx-auto max-w-[1400px] px-4">
        <div className="flex h-16 items-center justify-between">
          <h1 className="text-xl font-semibold tracking-wide">
            Expense
          </h1>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-lg font-semibold uppercase">
              {firstLetter}
            </div>

            <span className="text-sm font-medium">
              {userName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}