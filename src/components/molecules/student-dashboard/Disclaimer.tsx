import { Icon } from "@iconify/react";

export function Disclaimer() {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
      <div className="flex items-start gap-2">
        <Icon
          icon="hugeicons:information-circle"
          className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
        />
        <div>
          <h4 className="font-semibold text-blue-800 text-sm mb-1">
            Disclaimer
          </h4>
          <p className="text-sm text-blue-700 leading-relaxed">
            These are past questions and they are for practicing or revision
            purpose. If you see any of them in your examination, it is purely
            coincidence. iExcelo will never promote examination malpractices. We
            encourage smart preparation in order to excel in your exams. All the
            best!
          </p>
        </div>
      </div>
    </div>
  );
}
