interface ExamHeaderProps {
  examType: string;
  subjects: string[];
}

export function ExamHeader({ examType, subjects }: ExamHeaderProps) {
  return (
    <section
      style={{
        boxShadow:
          "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
      }}
      className="bg-[#007FFF] text-white rounded-[1rem] p-6"
    >
      <div className="mb-2">
        <span className="text-sm text-white/80">Exam Type:</span>
        <span className="ml-2 font-semibold">{examType}</span>
      </div>
      <div>
        <span className="text-sm text-white/80">Subject:</span>
        <span className="ml-2 font-medium">{subjects.join(", ")}</span>
      </div>
    </section>
  );
}
