import { useAuth } from "@mercado/shared-ui";

export const Sidebar = ({
  children,
  isActive,
  toggle,
}: {
  children: React.ReactNode;
  isActive: boolean;
  toggle: () => void;
}) => {
  const { user } = useAuth();
  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <aside className={`${isActive ? "w-[220px]" : "w-[60px]"} h-screen flex flex-col border-r border-gray-200 bg-white transition-all duration-200 shrink-0`}>
      <div className="h-[56px] flex items-center gap-3 px-4 border-b border-gray-200 cursor-pointer shrink-0" onClick={toggle}>
        <div className="w-[28px] h-[28px] rounded-lg bg-black flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-semibold">M</span>
        </div>
        {isActive && <span className="text-sm font-semibold text-gray-900 truncate">Mercado Oriental</span>}
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-2">{children}</div>

      <div className="border-t border-gray-200 px-3 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-[28px] h-[28px] rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-gray-600">{initials}</span>
          </div>
          {isActive && <span className="text-sm text-gray-600 truncate">{user?.name || user?.email}</span>}
        </div>
      </div>
    </aside>
  );
};
