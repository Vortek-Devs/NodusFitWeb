"use client";

import {
  IconArrowLeft,
  IconArrowRight,
  IconBarbell,
  IconBrandGoogle,
  IconCheck,
  IconChevronRight,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconRun,
  IconShieldCheck,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useMountEffect } from "@/hooks/use-mount-effect";
import {
  type AuthActionResult,
  type AuthRole,
  type AuthUser,
  completeVerifiedStudentInvite,
  type InviteValidation,
  personalEmailLogin,
  personalEmailRegister,
  personalGoogleCompleteProfile,
  personalGoogleLogin,
  personalGoogleStart,
  requestVerificationEmail,
  resolveAuthenticatedAccess,
  studentGoogleLogin,
  studentGoogleRegister,
  studentLogin,
  studentRegister,
} from "@/lib/auth/access-actions";
import {
  type InviteCompletionResult,
  verificationRequired,
} from "@/lib/auth/auth-result";
import { buildVerificationCallback } from "@/lib/auth/verification-callback";
import { authClient } from "@/lib/auth-client";

type AccessAuthClientProps = {
  initialRole: AuthRole;
  invite: InviteValidation;
  token?: string;
  emailVerifiedCallback?: boolean;
  verificationPending?: boolean;
  accountError?: string;
};

type PanelTab = "login" | "register";
type SubmitTarget =
  | "personal-login"
  | "personal-google-login"
  | "personal-google-register"
  | "personal-google-profile"
  | "personal-register"
  | "student-login"
  | "student-google-login"
  | "student-google-register"
  | "student-register"
  | "verification-resend";
type SubmitResult = {
  target: SubmitTarget;
  response: AuthActionResult;
};

type InviteAttempts = {
  identity?: string;
  completions: Map<string, Promise<InviteCompletionResult>>;
};

type PersonalRegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type StudentForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const emptyPersonalRegister: PersonalRegisterForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const emptyStudentForm: StudentForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function AccessAuthClient({
  initialRole,
  invite,
  token,
  emailVerifiedCallback = false,
  verificationPending = false,
  accountError,
}: AccessAuthClientProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeRole, setActiveRole] = useState<AuthRole>(initialRole);
  const [personalTab, setPersonalTab] = useState<PanelTab>("login");
  const [studentTab, setStudentTab] = useState<PanelTab>("login");
  const [personalStep, setPersonalStep] = useState(1);
  const [personalRegister, setPersonalRegister] =
    useState<PersonalRegisterForm>(emptyPersonalRegister);
  const [studentForm, setStudentForm] = useState<StudentForm>(emptyStudentForm);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState<SubmitTarget | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [googlePersonal, setGooglePersonal] = useState<AuthUser | null>(null);
  const session = authClient.useSession();
  const inviteAttempts = useRef<InviteAttempts>({ completions: new Map() });

  useRevealMotion(rootRef);

  const [verificationFeedback, setVerificationFeedback] = useState("");
  const [dismissedVerification, setDismissedVerification] = useState(false);
  const requestVersion = useRef(0);
  useMountEffect(() => () => {
    requestVersion.current += 1;
  });
  const pendingEmail =
    verificationPending && !dismissedVerification ? session.data?.user.email : undefined;
  const pendingCallback =
    initialRole === "aluno" && !token
      ? "/acesso?perfil=aluno&emailVerificado=1"
      : safeVerificationCallback(initialRole, token);
  const verification =
    result?.response.status === "verification-required"
      ? result.response
      : pendingEmail && pendingCallback
        ? verificationRequired(pendingEmail, pendingCallback)
        : null;

  async function handleResend() {
    if (verification?.status !== "verification-required" || submitting) return;
    const version = ++requestVersion.current;
    setSubmitting("verification-resend");
    setVerificationFeedback("");
    try {
      const response = await requestVerificationEmail(
        verification.email,
        verification.callbackURL,
      );
      if (version === requestVersion.current) setVerificationFeedback(response.message);
    } catch {
      if (version === requestVersion.current)
        setVerificationFeedback(
          "Não foi possível solicitar um novo e-mail. Tente novamente.",
        );
    } finally {
      if (version === requestVersion.current) setSubmitting(null);
    }
  }

  const personalStrength = useMemo(
    () => getPasswordStrength(personalRegister.password),
    [personalRegister.password],
  );
  const studentStrength = useMemo(
    () => getPasswordStrength(studentForm.password),
    [studentForm.password],
  );
  const canRegisterStudent = invite.status === "valid";
  const activeTab = activeRole === "personal" ? personalTab : studentTab;
  const tone = activeRole === "personal" ? "dark" : "light";

  function switchRole(role: AuthRole) {
    requestVersion.current += 1;
    setSubmitting(null);
    setDismissedVerification(true);
    setActiveRole(role);
    setResult(null);
    setFieldErrors({});
  }

  function setPersonalField<Key extends keyof PersonalRegisterForm>(
    key: Key,
    value: PersonalRegisterForm[Key],
  ) {
    setPersonalRegister((current) => ({ ...current, [key]: value }));
    if (key === "email" && fieldErrors.personalEmail) {
      setFieldErrors((current) => ({ ...current, personalEmail: "" }));
    }
  }

  function setStudentField<Key extends keyof StudentForm>(
    key: Key,
    value: StudentForm[Key],
  ) {
    setStudentForm((current) => ({ ...current, [key]: value }));
  }

  function changeTab(tab: PanelTab) {
    requestVersion.current += 1;
    setSubmitting(null);
    setDismissedVerification(true);
    setVerificationFeedback("");
    if (activeRole === "aluno" && tab === "register" && !canRegisterStudent) {
      setResult({
        target: "student-register",
        response: {
          status: "error",
          message: getInviteMessage(invite.status).description,
        },
      });
      return;
    }

    if (activeRole === "personal") {
      setPersonalTab(tab);
      if (tab === "login") {
        setGooglePersonal(null);
        setPersonalStep(1);
      }
    } else {
      setStudentTab(tab);
    }

    setResult(null);
    setFieldErrors({});
  }

  function nextPersonalStep() {
    const errors = validatePersonalStep(personalStep, personalRegister);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setPersonalStep((step) => Math.min(step + 1, 3));
  }

  async function submitPersonalLogin(formData: FormData) {
    await submit("personal-login", () =>
      personalEmailLogin(
        String(formData.get("personal-login-email") ?? ""),
        String(formData.get("personal-login-password") ?? ""),
      ),
    );
  }

  async function submitGoogleLogin() {
    await submit("personal-google-login", () => personalGoogleLogin());
  }

  async function startGoogleRegister() {
    await submit(
      "personal-google-register",
      () => personalGoogleStart(),
      (response) => {
        if (response.status === "authenticated") {
          setGooglePersonal(response.user);
          setPersonalTab("register");
          setPersonalStep(2);
        }
      },
    );
  }

  async function submitPersonalRegister() {
    const errors = validatePersonalStep(3, personalRegister);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    await submit("personal-register", () =>
      personalEmailRegister({
        firstName: personalRegister.firstName,
        lastName: personalRegister.lastName,
        email: personalRegister.email,
        password: personalRegister.password,
      }),
    );
  }

  async function submitGoogleProfile() {
    const errors = validatePersonalStep(2, personalRegister);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    await submit("personal-google-profile", () => personalGoogleCompleteProfile());
  }

  async function submitStudentLogin(formData: FormData) {
    await submit("student-login", () =>
      studentLogin(
        String(formData.get("student-login-email") ?? ""),
        String(formData.get("student-login-password") ?? ""),
        token,
      ),
    );
  }

  async function submitStudentGoogleLogin() {
    await submit("student-google-login", () => studentGoogleLogin());
  }

  async function submitStudentGoogleRegister() {
    await submit("student-google-register", () => studentGoogleRegister(invite, token));
  }

  async function submitStudentRegister() {
    const errors = validateStudentRegister(studentForm);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    await submit("student-register", () =>
      studentRegister(
        invite,
        studentForm.email,
        studentForm.name,
        studentForm.password,
        token,
      ),
    );
  }

  async function submit(
    target: SubmitTarget,
    action: () => Promise<AuthActionResult>,
    afterSubmit?: (response: AuthActionResult) => void,
  ) {
    if (submitting) return;
    const version = ++requestVersion.current;
    setSubmitting(target);
    setResult(null);

    let response: AuthActionResult;
    try {
      response = await action();
    } catch {
      response = { status: "error", message: "Nao foi possivel concluir a operacao." };
    }

    if (version !== requestVersion.current) return;
    setSubmitting(null);
    setResult({ target, response });
    afterSubmit?.(response);

    if (response.status === "authenticated") {
      window.location.assign(response.redirectTo);
      return;
    }

    if (response.status === "error" && response.field === "email") {
      setPersonalStep(1);
      setFieldErrors((current) => ({ ...current, personalEmail: response.message }));
    }
  }

  return (
    <main className="auth-vor70" ref={rootRef} data-role={activeRole}>
      <section className="auth-split-shell" aria-label="Acesso Nodus Fit">
        <VisualPanel role={activeRole} invite={invite} />

        <section className={`auth-form-panel ${tone}`}>
          <div className="auth-form-shell">
            <BrandMark tone={tone} />

            <RoleToggle activeRole={activeRole} onChange={switchRole} />

            <PersonaBadge tone={tone} role={activeRole} />

            <PanelHeading tone={tone} role={activeRole} tab={activeTab} invite={invite} />

            <Tabs
              active={activeTab}
              canRegisterStudent={canRegisterStudent}
              onChange={changeTab}
              role={activeRole}
              tone={tone}
            />

            {accountError === "conta-indisponivel" || accountError === "acesso-negado" ? (
              <p role="alert" className="auth-result error">
                {accountError === "conta-indisponivel"
                  ? "Sua conta está indisponível. Entre em contato com o suporte."
                  : "Você não tem permissão para acessar esta área."}
              </p>
            ) : null}
            {!session.isPending &&
            session.data?.user &&
            !verificationPending &&
            !submitting &&
            !result &&
            !accountError ? (
              <SessionCompletion
                key={`${session.data.user.id}:${token ?? ""}`}
                sessionUserId={session.data.user.id}
                token={token}
                verifiedCallback={emailVerifiedCallback}
                attempts={inviteAttempts}
              />
            ) : null}
            {verification?.status === "verification-required" ? (
              <section
                aria-labelledby="verification-title"
                className="rounded-lg border border-border bg-surface p-4"
              >
                <h2
                  id="verification-title"
                  className="text-xl font-bold text-ink-primary"
                >
                  Confirme seu e-mail
                </h2>
                <p className="mt-2 text-sm text-ink-secondary">
                  Confira a caixa de entrada de {verification.email} para confirmar seu
                  acesso.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    disabled={submitting === "verification-resend"}
                    onClick={handleResend}
                  >
                    {submitting === "verification-resend"
                      ? "Solicitando..."
                      : "Reenviar e-mail"}
                  </Button>
                  <Button variant="outline" onClick={() => changeTab("login")}>
                    Voltar ao login
                  </Button>
                </div>
                <p aria-live="polite" className="mt-3 text-sm text-ink-secondary">
                  {verificationFeedback}
                </p>
              </section>
            ) : activeRole === "personal" ? (
              <PersonalForms
                fieldErrors={fieldErrors}
                form={personalRegister}
                googlePersonal={googlePersonal}
                onGoogleLogin={submitGoogleLogin}
                onGoogleProfile={submitGoogleProfile}
                onGoogleRegister={startGoogleRegister}
                onLogin={submitPersonalLogin}
                onRegister={submitPersonalRegister}
                onStepBack={() => setPersonalStep((step) => Math.max(step - 1, 1))}
                onStepNext={nextPersonalStep}
                onUpdate={setPersonalField}
                passwordStrength={personalStrength}
                personalStep={personalStep}
                submitting={submitting}
                tab={personalTab}
                visiblePasswords={visiblePasswords}
                setVisiblePasswords={setVisiblePasswords}
              />
            ) : (
              <StudentForms
                canRegisterStudent={canRegisterStudent}
                fieldErrors={fieldErrors}
                form={studentForm}
                invite={invite}
                onGoogleLogin={submitStudentGoogleLogin}
                onGoogleRegister={submitStudentGoogleRegister}
                onLogin={submitStudentLogin}
                onRegister={submitStudentRegister}
                onUpdate={setStudentField}
                passwordStrength={studentStrength}
                submitting={submitting}
                tab={studentTab}
                visiblePasswords={visiblePasswords}
                setVisiblePasswords={setVisiblePasswords}
              />
            )}

            <PanelResult result={result} role={activeRole} />
          </div>
        </section>
      </section>
    </main>
  );
}

function safeVerificationCallback(role: AuthRole, token?: string) {
  try {
    return buildVerificationCallback(role, token);
  } catch {
    return null;
  }
}

// One mounted identity/token owns this external navigation handshake. StrictMode
// reattaches to the same promise; a replaced identity cannot accept or navigate.
function SessionCompletion({
  sessionUserId,
  token,
  verifiedCallback,
  attempts,
}: {
  sessionUserId: string;
  token?: string;
  verifiedCallback: boolean;
  attempts: React.RefObject<InviteAttempts>;
}) {
  const active = useRef(false);
  const completion = useRef<Promise<void> | null>(null);
  const [message, setMessage] = useState("Confirmando seu acesso...");
  useMountEffect(() => {
    active.current = true;
    if (attempts.current.identity !== sessionUserId) {
      attempts.current = { identity: sessionUserId, completions: new Map() };
    }
    const identityAttempts = attempts.current.completions;
    completion.current ??= (async function finish(): Promise<void> {
      const result = await resolveAuthenticatedAccess(
        sessionUserId,
        verifiedCallback ? "email" : "google",
      );
      if (!active.current) return;
      if (result.status !== "authenticated") {
        setMessage(result.message);
        return;
      }
      if (result.user.role === "aluno" && token) {
        const key = `${sessionUserId}:${token}`;
        let acceptance = identityAttempts.get(key);
        if (!acceptance) {
          // Bound this page's history; a different account receives a fresh map.
          if (identityAttempts.size >= 16) {
            const oldest = identityAttempts.keys().next().value;
            if (oldest) identityAttempts.delete(oldest);
          }
          acceptance = completeVerifiedStudentInvite(token, () => active.current);
          identityAttempts.set(key, acceptance);
        }
        const accepted = await acceptance;
        if (!active.current) return;
        if (accepted.status === "cancelled") {
          // No accept request started. Remove only that cancelled attempt;
          // this mounted identity must pass canonical validation again to retry.
          if (identityAttempts.get(key) === acceptance) identityAttempts.delete(key);
          return finish();
        }
        if (accepted.status === "error") {
          if (identityAttempts.get(key) === acceptance) identityAttempts.delete(key);
          setMessage(accepted.message);
          return;
        }
        window.location.replace(accepted.redirectTo);
      } else {
        window.location.replace(result.redirectTo);
      }
    })().catch(() => {
      if (active.current)
        setMessage("Não foi possível confirmar seu acesso. Tente novamente.");
    });
    return () => {
      active.current = false;
    };
  });
  return (
    <p role="status" className="auth-result">
      {message}
    </p>
  );
}

function VisualPanel({ invite, role }: { invite: InviteValidation; role: AuthRole }) {
  const isPersonal = role === "personal";

  return (
    <aside className="auth-visual-panel">
      <div
        className={`auth-visual-content ${isPersonal ? "personal" : "student"}`}
        data-r="up"
        key={role}
      >
        <span className="auth-visual-kicker">
          {isPersonal ? "Operacao do personal" : "Experiencia do aluno"}
        </span>
        <h2>
          {isPersonal ? (
            <>
              Controle a rotina
              <br />
              sem perder o aluno.
            </>
          ) : (
            <>
              O convite abre
              <br />o treino certo.
            </>
          )}
        </h2>
        <p>
          {isPersonal
            ? "Acesso profissional com cadastro completo, Google opcional e uma base pronta para enviar convites."
            : "Aluno usa email e senha no dia a dia. Cadastro novo so aparece quando o link do personal e valido."}
        </p>

        {isPersonal ? <PersonalScene /> : <StudentScene invite={invite} />}
      </div>
    </aside>
  );
}

function PersonalScene() {
  return (
    <div className="auth-scene personal" aria-hidden="true">
      <div className="scene-card scene-card-main">
        <div className="scene-card-top">
          <span>Hoje</span>
          <strong>18:30</strong>
        </div>
        <div className="scene-timeline">
          {["Check-in", "Treino B", "Pagamento"].map((item, index) => (
            <div className="scene-timeline-row" key={item}>
              <span>{index + 1}</span>
              <strong>{item}</strong>
              <small>
                {index === 0 ? "feito" : index === 1 ? "enviado" : "pendente"}
              </small>
            </div>
          ))}
        </div>
      </div>
      <div className="scene-card scene-card-side">
        <span>Convites ativos</span>
        <strong>27</strong>
        <small>8 cadastros esta semana</small>
      </div>
      <div className="scene-progress-ring">
        <span>74%</span>
        <small>adesao</small>
      </div>
      <div className="scene-thread">
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

function StudentScene({ invite }: { invite: InviteValidation }) {
  return (
    <div className="auth-scene student" aria-hidden="true">
      <div className="student-phone">
        <div className="student-phone-bar" />
        <div className="student-hero-card">
          <span>Treino de hoje</span>
          <strong>Forca superior</strong>
          <small>42 min / 6 exercicios</small>
        </div>
        <div className="student-set-list">
          {["Aquecimento", "Supino reto", "Remada baixa"].map((item, index) => (
            <div key={item}>
              <span>{item}</span>
              <strong>{index === 0 ? "8 min" : index === 1 ? "4x10" : "3x12"}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="student-invite-card">
        <span>{invite.personal ? "Convite validado" : "Convite necessario"}</span>
        <strong>{invite.personal?.name ?? "Link do personal"}</strong>
        <small>{invite.personal?.title ?? "Cadastro bloqueado ate validar"}</small>
      </div>
      <div className="student-orbit">
        <IconBarbell aria-hidden="true" />
      </div>
    </div>
  );
}

function RoleToggle({
  activeRole,
  onChange,
}: {
  activeRole: AuthRole;
  onChange: (role: AuthRole) => void;
}) {
  return (
    <fieldset className="auth-role-toggle">
      <legend className="auth-sr-only">Escolha o tipo de acesso</legend>
      <span className={`auth-role-pill ${activeRole}`} />
      <button
        type="button"
        className={activeRole === "personal" ? "active" : ""}
        onClick={() => onChange("personal")}
      >
        <IconUser aria-hidden="true" />
        Personal
      </button>
      <button
        type="button"
        className={activeRole === "aluno" ? "active" : ""}
        onClick={() => onChange("aluno")}
      >
        <IconRun aria-hidden="true" />
        Aluno
      </button>
    </fieldset>
  );
}

function BrandMark({ tone }: { tone: "dark" | "light" }) {
  return (
    <Link className={`auth-logo ${tone}`} href="/" aria-label="Nodus Fit">
      <span className="auth-logo-mark">
        <IconBarbell aria-hidden="true" />
      </span>
      <span>
        Nodus <em>Fit</em>
      </span>
    </Link>
  );
}

function PersonaBadge({ role, tone }: { role: AuthRole; tone: "dark" | "light" }) {
  return (
    <span className={`persona-badge-auth ${tone}`}>
      {role === "personal" ? (
        <IconUser aria-hidden="true" />
      ) : (
        <IconRun aria-hidden="true" />
      )}
      {role === "personal" ? "Area do Personal" : "Area do Aluno"}
    </span>
  );
}

function PanelHeading({
  invite,
  role,
  tab,
  tone,
}: {
  invite: InviteValidation;
  role: AuthRole;
  tab: PanelTab;
  tone: "dark" | "light";
}) {
  const isPersonal = role === "personal";
  const hasInvite = invite.status === "valid";

  const title = isPersonal
    ? tab === "login"
      ? "Bem-vindo de volta."
      : "Crie sua conta."
    : tab === "login"
      ? "Seu treino te espera."
      : "Cadastro por convite.";

  const description = isPersonal
    ? tab === "login"
      ? "Acesse seu painel e gerencie alunos, treinos e pagamentos."
      : "Configure seu perfil profissional em tres etapas guiadas."
    : tab === "login"
      ? "Entre com email e senha para acessar o app do aluno."
      : hasInvite
        ? "Complete seu acesso vinculado ao personal que te convidou."
        : "Abra o link enviado pelo seu personal para liberar o cadastro.";

  return (
    <header className={`auth-heading ${tone}`} data-r="up">
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

function Tabs({
  active,
  canRegisterStudent,
  onChange,
  role,
  tone,
}: {
  active: PanelTab;
  canRegisterStudent: boolean;
  onChange: (tab: PanelTab) => void;
  role: AuthRole;
  tone: "dark" | "light";
}) {
  const registerDisabled = role === "aluno" && !canRegisterStudent;

  return (
    <div className={`auth-tabs ${tone}`} role="tablist" aria-label="Tipo de acesso">
      <button
        type="button"
        role="tab"
        aria-selected={active === "login"}
        className={active === "login" ? "active" : ""}
        onClick={() => onChange("login")}
      >
        Entrar
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === "register"}
        aria-disabled={registerDisabled}
        className={active === "register" ? "active" : ""}
        onClick={() => onChange("register")}
      >
        {role === "aluno" ? "Cadastrar via convite" : "Criar conta"}
      </button>
    </div>
  );
}

function PersonalForms({
  fieldErrors,
  form,
  googlePersonal,
  onGoogleLogin,
  onGoogleProfile,
  onGoogleRegister,
  onLogin,
  onRegister,
  onStepBack,
  onStepNext,
  onUpdate,
  passwordStrength,
  personalStep,
  setVisiblePasswords,
  submitting,
  tab,
  visiblePasswords,
}: {
  fieldErrors: Record<string, string>;
  form: PersonalRegisterForm;
  googlePersonal: AuthUser | null;
  onGoogleLogin: () => Promise<void>;
  onGoogleProfile: () => Promise<void>;
  onGoogleRegister: () => Promise<void>;
  onLogin: (formData: FormData) => Promise<void>;
  onRegister: () => Promise<void>;
  onStepBack: () => void;
  onStepNext: () => void;
  onUpdate: <Key extends keyof PersonalRegisterForm>(
    key: Key,
    value: PersonalRegisterForm[Key],
  ) => void;
  passwordStrength: { score: number; label: string };
  personalStep: number;
  setVisiblePasswords: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  submitting: SubmitTarget | null;
  tab: PanelTab;
  visiblePasswords: Record<string, boolean>;
}) {
  const isGoogleRegister = Boolean(googlePersonal);
  const authStepClass = "auth-step";

  if (tab === "login") {
    return (
      <form className="auth-form" action={onLogin}>
        <GoogleButton
          disabled={submitting === "personal-google-login"}
          label="Entrar com Google"
          loadingLabel="Entrando com Google"
          onClick={onGoogleLogin}
        />
        <Divider label="ou entre com email" tone="dark" />
        <AuthField
          tone="dark"
          id="personal-login-email"
          label="Email profissional"
          type="email"
          autoComplete="email"
          icon={<IconMail aria-hidden="true" />}
          placeholder="personal@exemplo.com"
          required
        />
        <PasswordField
          tone="dark"
          id="personal-login-password"
          label="Senha"
          autoComplete="current-password"
          visible={visiblePasswords.personalLogin}
          onToggle={() => togglePassword("personalLogin", setVisiblePasswords)}
          required
        />
        <Link className="auth-forgot dark" href="/acesso">
          Esqueci minha senha
        </Link>
        <SubmitButton
          tone="dark"
          pending={submitting === "personal-login"}
          label="Entrar no painel"
        />
      </form>
    );
  }

  return (
    <form className="auth-form" action={onRegister}>
      {googlePersonal ? (
        <GoogleProfileSummary user={googlePersonal} />
      ) : (
        <ProgressDots tone="dark" step={personalStep} total={3} />
      )}

      {personalStep === 1 && !isGoogleRegister ? (
        <div className={authStepClass} data-r="up">
          <GoogleButton
            disabled={submitting === "personal-google-register"}
            label="Entrar com Google"
            loadingLabel="Conectando com Google"
            onClick={onGoogleRegister}
          />
          <Divider label="ou preencha os dados" tone="dark" />
          <div className="auth-grid">
            <ControlledField
              tone="dark"
              id="personal-first-name"
              label="Nome"
              value={form.firstName}
              onChange={(value) => onUpdate("firstName", value)}
              icon={<IconUser aria-hidden="true" />}
              placeholder="Marcos"
              error={fieldErrors.firstName}
              required
            />
            <ControlledField
              tone="dark"
              id="personal-last-name"
              label="Sobrenome"
              value={form.lastName}
              onChange={(value) => onUpdate("lastName", value)}
              icon={<IconUser aria-hidden="true" />}
              placeholder="Pereira"
              error={fieldErrors.lastName}
              required
            />
          </div>
          <ControlledField
            tone="dark"
            id="personal-register-email"
            label="Email profissional"
            type="email"
            value={form.email}
            onChange={(value) => onUpdate("email", value)}
            icon={<IconMail aria-hidden="true" />}
            placeholder="personal@exemplo.com"
            error={fieldErrors.personalEmail}
            autoComplete="email"
            required
          />
          <button className="auth-submit dark" type="button" onClick={onStepNext}>
            Continuar <IconArrowRight aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {personalStep === 2 ? (
        <div className={authStepClass} data-r="up">
          <p className="auth-helper dark">
            Dados profissionais serão solicitados no onboarding, após confirmar sua conta.
          </p>
          {isGoogleRegister ? (
            <SubmitButton
              tone="dark"
              pending={submitting === "personal-google-profile"}
              label="Finalizar perfil Google"
              action={onGoogleProfile}
            />
          ) : (
            <StepActions tone="dark" onBack={onStepBack} onNext={onStepNext} />
          )}
        </div>
      ) : null}

      {personalStep === 3 ? (
        <div className={authStepClass} data-r="up">
          <ControlledPasswordField
            tone="dark"
            id="personal-register-password"
            label="Senha"
            value={form.password}
            onChange={(value) => onUpdate("password", value)}
            visible={visiblePasswords.personalRegister}
            onToggle={() => togglePassword("personalRegister", setVisiblePasswords)}
            error={fieldErrors.password}
          />
          <PasswordStrength tone="dark" strength={passwordStrength} />
          <ControlledPasswordField
            tone="dark"
            id="personal-confirm-password"
            label="Confirmar senha"
            value={form.confirmPassword}
            onChange={(value) => onUpdate("confirmPassword", value)}
            visible={visiblePasswords.personalConfirm}
            onToggle={() => togglePassword("personalConfirm", setVisiblePasswords)}
            error={fieldErrors.confirmPassword}
          />
          <div className="auth-actions">
            <button className="auth-back dark" type="button" onClick={onStepBack}>
              <IconArrowLeft aria-hidden="true" /> Voltar
            </button>
            <SubmitButton
              tone="dark"
              pending={submitting === "personal-register"}
              label="Criar conta"
            />
          </div>
        </div>
      ) : null}
    </form>
  );
}

function StudentForms({
  canRegisterStudent,
  fieldErrors,
  form,
  invite,
  onGoogleLogin,
  onGoogleRegister,
  onLogin,
  onRegister,
  onUpdate,
  passwordStrength,
  setVisiblePasswords,
  submitting,
  tab,
  visiblePasswords,
}: {
  canRegisterStudent: boolean;
  fieldErrors: Record<string, string>;
  form: StudentForm;
  invite: InviteValidation;
  onGoogleLogin: () => Promise<void>;
  onGoogleRegister: () => Promise<void>;
  onLogin: (formData: FormData) => Promise<void>;
  onRegister: () => Promise<void>;
  onUpdate: <Key extends keyof StudentForm>(key: Key, value: StudentForm[Key]) => void;
  passwordStrength: { score: number; label: string };
  setVisiblePasswords: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  submitting: SubmitTarget | null;
  tab: PanelTab;
  visiblePasswords: Record<string, boolean>;
}) {
  if (tab === "login") {
    return (
      <form className="auth-form" action={onLogin}>
        <GoogleButton
          disabled={submitting === "student-google-login"}
          label="Entrar com Google"
          loadingLabel="Entrando com Google"
          onClick={onGoogleLogin}
        />
        <Divider label="ou entre com email" tone="light" />
        <AuthField
          tone="light"
          id="student-login-email"
          label="Email"
          type="email"
          autoComplete="email"
          icon={<IconMail aria-hidden="true" />}
          placeholder="aluno@exemplo.com"
          required
        />
        <PasswordField
          tone="light"
          id="student-login-password"
          label="Senha"
          autoComplete="current-password"
          visible={visiblePasswords.studentLogin}
          onToggle={() => togglePassword("studentLogin", setVisiblePasswords)}
          required
        />
        <Link className="auth-forgot light" href="/acesso">
          Esqueci minha senha
        </Link>
        <SubmitButton
          tone="light"
          pending={submitting === "student-login"}
          label="Entrar e treinar"
        />
        <InviteHint invite={invite} />
      </form>
    );
  }

  return (
    <div className="auth-form">
      <InviteHint invite={invite} expanded />
      <GoogleButton
        disabled={!canRegisterStudent || submitting === "student-google-register"}
        label="Entrar com Google"
        loadingLabel="Conectando com Google"
        onClick={onGoogleRegister}
      />
      <Divider label="ou crie com email" tone="light" />
      <form action={onRegister} className="auth-step">
        <ControlledField
          tone="light"
          id="student-name"
          label="Nome completo"
          value={form.name}
          onChange={(value) => onUpdate("name", value)}
          icon={<IconUser aria-hidden="true" />}
          placeholder="Ana Costa"
          error={fieldErrors.studentName}
          disabled={!canRegisterStudent}
          required
        />
        <ControlledField
          tone="light"
          id="student-email"
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => onUpdate("email", value)}
          icon={<IconMail aria-hidden="true" />}
          placeholder="aluno@exemplo.com"
          error={fieldErrors.studentEmail}
          disabled={!canRegisterStudent}
          required
        />
        <ControlledPasswordField
          tone="light"
          id="student-register-password"
          label="Senha"
          value={form.password}
          onChange={(value) => onUpdate("password", value)}
          visible={visiblePasswords.studentRegister}
          onToggle={() => togglePassword("studentRegister", setVisiblePasswords)}
          error={fieldErrors.studentPassword}
          disabled={!canRegisterStudent}
        />
        <PasswordStrength tone="light" strength={passwordStrength} />
        <ControlledPasswordField
          tone="light"
          id="student-confirm-password"
          label="Confirmar senha"
          value={form.confirmPassword}
          onChange={(value) => onUpdate("confirmPassword", value)}
          visible={visiblePasswords.studentConfirm}
          onToggle={() => togglePassword("studentConfirm", setVisiblePasswords)}
          error={fieldErrors.studentConfirmPassword}
          disabled={!canRegisterStudent}
        />
        <FeatureList disabled={!canRegisterStudent} />
        <SubmitButton
          tone="light"
          pending={submitting === "student-register"}
          label="Criar conta e comecar"
          disabled={!canRegisterStudent}
        />
      </form>
    </div>
  );
}

function GoogleButton({
  disabled,
  label,
  loadingLabel,
  onClick,
}: {
  disabled: boolean;
  label: string;
  loadingLabel: string;
  onClick: () => Promise<void>;
}) {
  return (
    <button
      className="google-auth-btn"
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      <IconBrandGoogle aria-hidden="true" />
      {disabled ? loadingLabel : label}
      <IconChevronRight aria-hidden="true" />
    </button>
  );
}

function GoogleProfileSummary({ user }: { user: AuthUser }) {
  return (
    <div className="google-profile-summary" data-r="up">
      <span className="google-avatar" aria-hidden="true">
        {user.name
          .split(" ")
          .map((part) => part[0])
          .slice(0, 2)
          .join("")}
      </span>
      <div>
        <strong>{user.name}</strong>
        <small>{user.email}</small>
        <p>Dados profissionais serão solicitados no onboarding.</p>
      </div>
    </div>
  );
}

function Divider({ label, tone }: { label: string; tone: "dark" | "light" }) {
  return (
    <div className={`auth-divider ${tone}`}>
      <span />
      <small>{label}</small>
      <span />
    </div>
  );
}

function InviteHint({
  expanded,
  invite,
}: {
  expanded?: boolean;
  invite: InviteValidation;
}) {
  const message = getInviteMessage(invite.status);

  if (invite.personal) {
    return (
      <div className={`invite-badge light ${expanded ? "expanded" : ""}`} data-r="up">
        <div className="invite-avatar">{invite.personal.initials}</div>
        <div>
          <span>Convite de</span>
          <strong>
            {invite.personal.name} - {invite.personal.title}
          </strong>
          <small>
            {invite.personal.city} · {invite.personal.students} alunos ativos
          </small>
        </div>
        <IconCheck aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className={`invite-blocked ${expanded ? "expanded" : ""}`} data-r="up">
      <IconShieldCheck aria-hidden="true" />
      <strong>{message.title}</strong>
      <p>{message.description}</p>
    </div>
  );
}

function AuthField({
  autoComplete,
  icon,
  id,
  label,
  placeholder,
  required,
  tone,
  type = "text",
}: {
  autoComplete?: string;
  icon: React.ReactNode;
  id: string;
  label: string;
  placeholder: string;
  required?: boolean;
  tone: "dark" | "light";
  type?: string;
}) {
  return (
    <label className="auth-field" htmlFor={id}>
      <span className={`auth-label ${tone}`}>{label}</span>
      <span className="auth-input-wrap">
        <span className={`auth-input-icon ${tone}`}>{icon}</span>
        <input
          autoComplete={autoComplete}
          className={`auth-input ${tone}`}
          id={id}
          name={id}
          placeholder={placeholder}
          required={required}
          type={type}
        />
      </span>
    </label>
  );
}

function ControlledField({
  autoComplete,
  disabled,
  error,
  helper,
  icon,
  id,
  label,
  onChange,
  placeholder,
  required,
  tone,
  type = "text",
  value,
}: {
  autoComplete?: string;
  disabled?: boolean;
  error?: string;
  helper?: string;
  icon: React.ReactNode;
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  tone: "dark" | "light";
  type?: string;
  value: string;
}) {
  return (
    <label className="auth-field" data-invalid={Boolean(error)} htmlFor={id}>
      <span className={`auth-label ${tone}`}>{label}</span>
      <span className="auth-input-wrap">
        <span className={`auth-input-icon ${tone}`}>{icon}</span>
        <input
          aria-describedby={helper || error ? `${id}-hint` : undefined}
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          className={`auth-input ${tone}`}
          disabled={disabled}
          id={id}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          type={type}
          value={value}
        />
      </span>
      {helper || error ? (
        <span className={`auth-helper ${error ? "error" : tone}`} id={`${id}-hint`}>
          {error || helper}
        </span>
      ) : null}
    </label>
  );
}

function PasswordField({
  autoComplete,
  id,
  label,
  onToggle,
  required,
  tone,
  visible,
}: {
  autoComplete?: string;
  id: string;
  label: string;
  onToggle: () => void;
  required?: boolean;
  tone: "dark" | "light";
  visible?: boolean;
}) {
  return (
    <label className="auth-field" htmlFor={id}>
      <span className={`auth-label ${tone}`}>{label}</span>
      <span className="auth-input-wrap">
        <IconLock className={`auth-input-icon ${tone}`} aria-hidden="true" />
        <input
          autoComplete={autoComplete}
          className={`auth-input ${tone}`}
          id={id}
          name={id}
          placeholder="Minimo 8 caracteres"
          required={required}
          type={visible ? "text" : "password"}
        />
        <button
          type="button"
          className={`password-toggle ${tone}`}
          onClick={onToggle}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        >
          {visible ? <IconEyeOff aria-hidden="true" /> : <IconEye aria-hidden="true" />}
        </button>
      </span>
    </label>
  );
}

function ControlledPasswordField({
  disabled,
  error,
  id,
  label,
  onChange,
  onToggle,
  tone,
  value,
  visible,
}: {
  disabled?: boolean;
  error?: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  onToggle: () => void;
  tone: "dark" | "light";
  value: string;
  visible?: boolean;
}) {
  return (
    <label className="auth-field" data-invalid={Boolean(error)} htmlFor={id}>
      <span className={`auth-label ${tone}`}>{label}</span>
      <span className="auth-input-wrap">
        <IconLock className={`auth-input-icon ${tone}`} aria-hidden="true" />
        <input
          aria-describedby={error ? `${id}-hint` : undefined}
          aria-invalid={Boolean(error)}
          autoComplete="new-password"
          className={`auth-input ${tone}`}
          disabled={disabled}
          id={id}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Minimo 8 caracteres"
          type={visible ? "text" : "password"}
          value={value}
        />
        <button
          type="button"
          className={`password-toggle ${tone}`}
          disabled={disabled}
          onClick={onToggle}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        >
          {visible ? <IconEyeOff aria-hidden="true" /> : <IconEye aria-hidden="true" />}
        </button>
      </span>
      {error ? (
        <span className="auth-helper error" id={`${id}-hint`}>
          {error}
        </span>
      ) : null}
    </label>
  );
}

function ProgressDots({
  step,
  tone,
  total,
}: {
  step: number;
  tone: "dark" | "light";
  total: number;
}) {
  return (
    <div className={`auth-progress ${tone}`}>
      <p className="auth-sr-only">{`Etapa ${step} de ${total}`}</p>
      {Array.from({ length: total }, (_, item) => {
        const dot = item + 1;

        return (
          <span
            className={dot === step ? "active" : ""}
            key={`personal-register-step-${dot}`}
          />
        );
      })}
    </div>
  );
}

function PasswordStrength({
  strength,
  tone,
}: {
  strength: { score: number; label: string };
  tone: "dark" | "light";
}) {
  return (
    <div
      className={`password-strength ${tone} score-${strength.score}`}
      aria-live="polite"
    >
      <div>
        {[1, 2, 3, 4].map((bar) => (
          <span
            className={bar <= strength.score ? "active" : ""}
            key={`strength-${bar}`}
          />
        ))}
      </div>
      <small>{strength.label}</small>
    </div>
  );
}

function StepActions({
  onBack,
  onNext,
  tone,
}: {
  onBack: () => void;
  onNext: () => void;
  tone: "dark" | "light";
}) {
  return (
    <div className="auth-actions">
      <button className={`auth-back ${tone}`} type="button" onClick={onBack}>
        <IconArrowLeft aria-hidden="true" />
        Voltar
      </button>
      <button className={`auth-submit ${tone}`} type="button" onClick={onNext}>
        Continuar
        <IconArrowRight aria-hidden="true" />
      </button>
    </div>
  );
}

function SubmitButton({
  action,
  disabled,
  label,
  pending,
  tone,
}: {
  action?: () => void | Promise<void>;
  disabled?: boolean;
  label: string;
  pending: boolean;
  tone: "dark" | "light";
}) {
  return (
    <button
      className={`auth-submit ${tone}`}
      disabled={disabled || pending}
      type={action ? "button" : "submit"}
      onClick={action}
    >
      <span className="auth-spinner" aria-hidden="true" />
      <span>
        {pending ? "Processando" : label}
        {!pending ? <IconArrowRight aria-hidden="true" /> : null}
      </span>
    </button>
  );
}

function FeatureList({ disabled }: { disabled: boolean }) {
  const features = [
    "Treino do dia liberado apos cadastro",
    "Historico e cargas salvos no app",
    "100% gratuito para o aluno",
  ];

  return (
    <div className={`student-features ${disabled ? "disabled" : ""}`}>
      {features.map((feature) => (
        <span key={feature}>
          <IconCheck aria-hidden="true" />
          {feature}
        </span>
      ))}
    </div>
  );
}

function PanelResult({ result, role }: { result: SubmitResult | null; role: AuthRole }) {
  const targetMatches =
    role === "personal"
      ? result?.target.startsWith("personal")
      : result?.target.startsWith("student");

  if (
    !result ||
    !targetMatches ||
    result.response.status === "verification-required" ||
    (result.response.status === "error" &&
      result.response.field === "email" &&
      role === "personal")
  ) {
    return null;
  }

  return (
    <div
      className={`auth-result ${result.response.status !== "error" ? "success" : "error"}`}
      role="status"
    >
      {result.response.status !== "error" ? (
        <IconCheck aria-hidden="true" />
      ) : (
        <IconShieldCheck aria-hidden="true" />
      )}
      <span>{result.response.message}</span>
    </div>
  );
}

function useRevealMotion(rootRef: React.RefObject<HTMLDivElement | null>) {
  useMountEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealElements = Array.from(root.querySelectorAll("[data-r]"));

    if (reduceMotion) {
      for (const element of revealElements) {
        element.classList.add("in");
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -24px 0px", threshold: 0.08 },
    );

    for (const element of revealElements) {
      observer.observe(element);
    }

    const magneticElements = Array.from(
      root.querySelectorAll<HTMLElement>(".auth-submit, .auth-logo-mark"),
    );
    const cleanups = magneticElements.map((element) => {
      const handleMove = (event: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const dx = event.clientX - rect.left - rect.width / 2;
        const dy = event.clientY - rect.top - rect.height / 2;
        element.style.transform = `translate(${dx * 0.08}px, ${dy * 0.12}px)`;
      };
      const handleLeave = () => {
        element.style.transform = "";
      };

      element.addEventListener("mousemove", handleMove);
      element.addEventListener("mouseleave", handleLeave);

      return () => {
        element.removeEventListener("mousemove", handleMove);
        element.removeEventListener("mouseleave", handleLeave);
      };
    });

    return () => {
      observer.disconnect();
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  });
}

function togglePassword(
  key: string,
  setVisiblePasswords: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
) {
  setVisiblePasswords((current) => ({ ...current, [key]: !current[key] }));
}

function getPasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  }
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
    score += 1;
  }
  if (/\d/.test(password)) {
    score += 1;
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  const labels = ["Fraca", "Fraca", "Razoavel", "Boa", "Forte"];

  return { score: Math.max(score, 1), label: labels[score] };
}

function validatePersonalStep(step: number, form: PersonalRegisterForm) {
  const errors: Record<string, string> = {};

  if (step === 1) {
    if (!form.firstName.trim()) {
      errors.firstName = "Informe seu nome.";
    }
    if (!form.lastName.trim()) {
      errors.lastName = "Informe seu sobrenome.";
    }
    if (!isEmail(form.email)) {
      errors.personalEmail = "Informe um email valido.";
    }
  }

  if (step === 3) {
    if (getPasswordStrength(form.password).score < 2) {
      errors.password = "Use ao menos 8 caracteres e combine letras ou numeros.";
    }
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "As senhas nao conferem.";
    }
  }

  return errors;
}

function validateStudentRegister(form: StudentForm) {
  const errors: Record<string, string> = {};

  if (!form.name.trim()) {
    errors.studentName = "Informe seu nome completo.";
  }
  if (!isEmail(form.email)) {
    errors.studentEmail = "Informe um email valido.";
  }
  if (getPasswordStrength(form.password).score < 2) {
    errors.studentPassword = "Use ao menos 8 caracteres e combine letras ou numeros.";
  }
  if (form.password !== form.confirmPassword) {
    errors.studentConfirmPassword = "As senhas nao conferem.";
  }

  return errors;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getInviteMessage(status: InviteValidation["status"]) {
  if (status === "expired") {
    return {
      title: "Convite expirado",
      description: "Este link nao esta mais ativo. Peca um novo convite ao seu personal.",
    };
  }

  if (status === "invalid") {
    return {
      title: "Convite invalido",
      description: "Nao encontramos este convite. Confira o link recebido no WhatsApp.",
    };
  }

  return {
    title: "Convite necessario",
    description:
      "Abra esta pagina pelo link enviado pelo seu personal para liberar o cadastro.",
  };
}
