"use client";

import {
  IconCloudCheck,
  IconCloudOff,
  IconPlayerPlay,
  IconRefresh,
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Exercise {
  id: string;
  name: string;
  target: string;
  load: string;
}

interface Workout {
  title: string;
  studentName: string;
  planVersion: string;
  updatedAt: string;
  restSeconds: number;
  exercises: Exercise[];
}

interface OfflineWorkoutSpikeProps {
  workout: Workout;
}

interface PendingSeries {
  id: string;
  exerciseId: string;
  exerciseName: string;
  reps: number;
  load: string;
  createdAt: string;
}

interface StorageEstimateState {
  quota: number;
  usage: number;
}

const databaseName = "nodusfit-offline-spike";
const databaseVersion = 1;
const pendingStoreName = "pending-series";

export function OfflineWorkoutSpike({ workout }: OfflineWorkoutSpikeProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSeries, setPendingSeries] = useState<PendingSeries[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [restLeft, setRestLeft] = useState(workout.restSeconds);
  const [isResting, setIsResting] = useState(false);
  const [storageEstimate, setStorageEstimate] = useState<StorageEstimateState | null>(
    null,
  );

  const completedCount = completedIds.size;
  const progressLabel = `${completedCount}/${workout.exercises.length}`;

  const syncStatus = useMemo(() => {
    if (!isOnline) {
      return "Offline: novas series ficam na fila local.";
    }

    if (pendingSeries.length > 0) {
      return `${pendingSeries.length} registro(s) aguardando sincronizacao.`;
    }

    return "Online: registros enviados para a API de spike.";
  }, [isOnline, pendingSeries.length]);

  const refreshPendingSeries = useCallback(async () => {
    setPendingSeries(await readPendingSeries());
  }, []);

  const refreshStorageEstimate = useCallback(async () => {
    if (!navigator.storage?.estimate) {
      return;
    }

    const estimate = await navigator.storage.estimate();

    setStorageEstimate({
      quota: estimate.quota ?? 0,
      usage: estimate.usage ?? 0,
    });
  }, []);

  const syncPendingSeries = useCallback(async () => {
    const queue = await readPendingSeries();

    for (const series of queue) {
      const synced = await postSeries(series);

      if (synced) {
        await deletePendingSeries(series.id);
      }
    }

    await refreshPendingSeries();
    await refreshStorageEstimate();
  }, [refreshPendingSeries, refreshStorageEstimate]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    refreshPendingSeries();
    refreshStorageEstimate();

    function handleOnline() {
      setIsOnline(true);
      syncPendingSeries();
      refreshStorageEstimate();
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [refreshPendingSeries, refreshStorageEstimate, syncPendingSeries]);

  useEffect(() => {
    if (!isResting || restLeft === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRestLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setIsResting(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isResting, restLeft]);

  async function recordSeries(exercise: Exercise) {
    const series: PendingSeries = {
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      reps: 10,
      load: exercise.load,
      createdAt: new Date().toISOString(),
    };

    setCompletedIds((current) => new Set(current).add(exercise.id));
    startRestTimer();

    if (navigator.onLine) {
      const synced = await postSeries(series);

      if (synced) {
        return;
      }
    }

    await savePendingSeries(series);
    await refreshPendingSeries();
    await refreshStorageEstimate();
  }

  function startRestTimer() {
    setRestLeft(workout.restSeconds);
    setIsResting(true);
  }

  return (
    <main className="min-h-screen bg-page px-4 py-6 text-ink-primary sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-ink-brand">
                Spike VOR-45
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-normal text-ink-primary">
                {workout.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-secondary">
                Prova controlada de cache offline, timer local e fila IndexedDB para o
                treino do aluno. Dados mockados, sem persistencia de producao.
              </p>
            </div>
            <div
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold ${
                isOnline
                  ? "border-success/30 bg-success-bg text-success-text"
                  : "border-warning/30 bg-warning-bg text-warning-text"
              }`}
            >
              {isOnline ? (
                <IconCloudCheck size={18} aria-hidden="true" />
              ) : (
                <IconCloudOff size={18} aria-hidden="true" />
              )}
              {isOnline ? "Online" : "Offline"}
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Aluno" value={workout.studentName} />
          <MetricCard label="Progresso" value={progressLabel} />
          <MetricCard label="Plano cacheado" value={workout.planVersion} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-normal">Exercicios</h2>
                <p className="mt-1 text-sm text-ink-secondary">
                  Atualizado em {workout.updatedAt}
                </p>
              </div>
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-elevated px-3 text-sm font-semibold text-ink-primary"
                onClick={syncPendingSeries}
                type="button"
              >
                <IconRefresh size={17} aria-hidden="true" />
                Sincronizar
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {workout.exercises.map((exercise) => (
                <article
                  className="rounded-md border border-border-muted bg-elevated p-4"
                  key={exercise.id}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold tracking-normal text-ink-primary">
                        {exercise.name}
                      </h3>
                      <p className="mt-1 text-sm text-ink-secondary">
                        {exercise.target} - carga sugerida {exercise.load}
                      </p>
                    </div>
                    <button
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-400 px-4 text-sm font-bold text-on-brand"
                      onClick={() => recordSeries(exercise)}
                      type="button"
                    >
                      <IconPlayerPlay size={17} aria-hidden="true" />
                      Registrar serie
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
              <h2 className="text-lg font-bold tracking-normal">Timer local</h2>
              <div className="mt-4 rounded-md bg-elevated p-5 text-center">
                <div className="font-mono text-5xl font-semibold text-ink-brand">
                  0:{String(restLeft).padStart(2, "0")}
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-ink-tertiary">
                  {isResting ? "Descanso em andamento" : "Pronto para iniciar"}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
              <h2 className="text-lg font-bold tracking-normal">Fila offline</h2>
              <p className="mt-2 text-sm leading-6 text-ink-secondary">{syncStatus}</p>
              <div className="mt-4 flex flex-col gap-2">
                {pendingSeries.length === 0 ? (
                  <p className="rounded-md border border-border-muted bg-elevated p-3 text-sm text-ink-tertiary">
                    Nenhum registro pendente.
                  </p>
                ) : (
                  pendingSeries.map((series) => (
                    <div
                      className="rounded-md border border-warning/30 bg-warning-bg p-3 text-sm text-warning-text"
                      key={series.id}
                    >
                      {series.exerciseName} - {series.reps} reps - {series.load}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
              <h2 className="text-lg font-bold tracking-normal">Storage</h2>
              <p className="mt-2 text-sm leading-6 text-ink-secondary">
                {storageEstimate
                  ? `${formatBytes(storageEstimate.usage)} usados de ${formatBytes(
                      storageEstimate.quota,
                    )} disponiveis neste navegador.`
                  : "Storage Estimate API indisponivel neste navegador."}
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-tertiary">
        {label}
      </p>
      <p className="mt-2 text-xl font-bold tracking-normal text-ink-primary">{value}</p>
    </div>
  );
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(pendingStoreName)) {
        database.createObjectStore(pendingStoreName, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readPendingSeries(): Promise<PendingSeries[]> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(pendingStoreName, "readonly");
    const store = transaction.objectStore(pendingStoreName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as PendingSeries[]);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

async function savePendingSeries(series: PendingSeries): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(pendingStoreName, "readwrite");
    const store = transaction.objectStore(pendingStoreName);

    store.put(series);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

async function deletePendingSeries(id: string): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(pendingStoreName, "readwrite");
    const store = transaction.objectStore(pendingStoreName);

    store.delete(id);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

async function postSeries(series: PendingSeries): Promise<boolean> {
  try {
    const response = await fetch("/api/offline-spike/series", {
      body: JSON.stringify(series),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    return response.ok;
  } catch {
    return false;
  }
}

function formatBytes(value: number): string {
  if (value === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1,
  );
  const amount = value / 1024 ** exponent;

  return `${amount.toFixed(1)} ${units[exponent]}`;
}
