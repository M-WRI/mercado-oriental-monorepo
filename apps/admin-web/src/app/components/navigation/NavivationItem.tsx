import { Link, useLocation } from "react-router";

export const NavivationItem = ({
  path,
  icon,
  label,
  isActive,
}: {
  path: string;
  label: string;
  icon?: React.ReactNode;
  isActive: boolean;
}) => {
  const location = useLocation();
  const isCurrentRoute = path === "/" ? location.pathname === "/" : location.pathname.startsWith(`/${path}`);

  return (
    <Link
      to={path}
      className={`flex gap-3 items-center w-full px-3 py-2 rounded-md text-sm transition-colors duration-150
                ${isCurrentRoute ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}
                ${!isActive ? "justify-center" : ""}
            `}
    >
      <span className="shrink-0 [&>svg]:w-[18px] [&>svg]:h-[18px]">{icon}</span>
      {isActive && <span className="truncate">{label}</span>}
    </Link>
  );
};
