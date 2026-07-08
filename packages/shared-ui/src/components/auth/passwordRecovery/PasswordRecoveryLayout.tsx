import type { ReactNode } from "react";
import { Link } from "react-router";

interface PasswordRecoveryLayoutProps {
  title: string;
  subtitle?: string;
  backToLoginHref: string;
  backToLoginLabel: string;
  children: ReactNode;
}

export function PasswordRecoveryLayout({
  title,
  subtitle,
  backToLoginHref,
  backToLoginLabel,
  children,
}: PasswordRecoveryLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">{children}</div>

        <p className="text-sm text-gray-500 text-center mt-4">
          <Link to={backToLoginHref} className="text-gray-900 font-medium hover:underline">
            {backToLoginLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
