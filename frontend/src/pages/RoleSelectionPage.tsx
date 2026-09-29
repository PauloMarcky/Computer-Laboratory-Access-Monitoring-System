import type { WireframeScreenId } from "../types";

const ulsCitLogo = new URL("../assets/images/uls-cit-logo.png", import.meta.url).href;

export const RoleSelectionPage = ({
  onNavigate,
}: {
  onNavigate: (screen: WireframeScreenId) => void;
}) => {
  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9] flex flex-col items-center justify-center p-6">
      <div className="box-border w-full max-w-[460px] bg-white rounded-2xl border border-slate-200/90 shadow-sm px-10 py-10 flex flex-col items-center">
        <div className="mb-5 flex h-30 w-30 items-center justify-center rounded-full border border-[#1d3663]/15 bg-white p-1 shadow-sm ring-4 ring-[#1d3663]/5">
          <img
            src={ulsCitLogo}
            alt="University of La Salette logo"
            className="h-full w-full object-contain"
          />
        </div>

        {/* University Title & Location */}
        <h1 className="text-xl font-bold text-slate-900 tracking-tight text-center">
          University of La Salette, Inc.
        </h1>
        <p className="text-xs text-slate-500 mt-1 mb-7 text-center">
          Santiago City, Isabela
        </p>

        {/* Access Level Selector */}
        <div className="w-full">
          <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-3 text-center">
            Select Access Level
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => onNavigate('instructor-login')}
              /* All buttons share this class */
              className="w-full rounded-lg bg-indigo-900 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-md"
            >
              Instructor Console
            </button>

            <button
              type="button"
              onClick={() => onNavigate('student-login')}
              /* All buttons share this class */
              className="w-full rounded-lg bg-indigo-900 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-md"
            >
              Student Seat Claim
            </button>

            <button
              type="button"
              onClick={() => onNavigate('lab-staff-login')}
              /* All buttons share this class */
              className="w-full rounded-lg bg-indigo-900 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-md"
            >
              Custodian Portal
            </button>

            <button
              type="button"
              onClick={() => onNavigate('admin-login')}
              /* All buttons share this class */
              className="w-full rounded-lg bg-indigo-900 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-md"
            >
              Administrator Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};