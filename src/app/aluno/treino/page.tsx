import type { Metadata } from "next";
import { OfflineWorkoutSpike } from "./workout-offline-spike";

export const metadata: Metadata = {
  title: {
    absolute: "Spike offline de treino | Nodus Fit",
  },
  description:
    "Rota controlada para validar cache PWA, timer local e fila IndexedDB do treino do aluno.",
  alternates: {
    canonical: "/aluno/treino",
  },
  robots: {
    index: false,
    follow: false,
  },
};

const workout = {
  title: "Treino A - Peito e triceps",
  studentName: "Joao Paulo",
  planVersion: "v0.1-spike",
  updatedAt: "18/05/2026, 18:00",
  restSeconds: 45,
  exercises: [
    {
      id: "supino-reto",
      name: "Supino reto",
      target: "4 series de 10 reps",
      load: "80 kg",
    },
    {
      id: "crucifixo-inclinado",
      name: "Crucifixo inclinado",
      target: "3 series de 12 reps",
      load: "20 kg",
    },
    {
      id: "triceps-corda",
      name: "Triceps corda",
      target: "4 series de 12 reps",
      load: "35 kg",
    },
  ],
};

export default function StudentWorkoutPage() {
  return <OfflineWorkoutSpike workout={workout} />;
}
