import { notFound } from "next/navigation";
import { StudentDetailClient } from "@/components/students/student-detail-client";
import { isUuid } from "@/lib/contracts/students";

export default async function StudentPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  if (!isUuid(studentId)) notFound();
  return <StudentDetailClient studentId={studentId} />;
}
