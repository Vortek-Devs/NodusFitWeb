"use client";

import {
  IconArrowLeft,
  IconArrowRight,
  IconBarbell,
  IconBrandGoogle,
  IconBrandWhatsapp,
  IconCheck,
  IconChevronRight,
  IconEye,
  IconEyeOff,
  IconId,
  IconLock,
  IconMail,
  IconRun,
  IconShieldCheck,
  IconSparkles,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  type AuthResult,
  type AuthRole,
  type AuthUser,
  type InviteValidation,
  mockStudentLogin,
  mockStudentRegister,
  personalEmailLogin,
  personalEmailRegister,
  personalGoogleCompleteProfile,
  personalGoogleLogin,
  personalGoogleStart,
} from "@/lib/auth/mock-auth";

type AccessAuthClientProps = {
  initialRole: AuthRole;
  invite: InviteValidation;
  token?: string;
};

type PanelTab = "login" | "register";
type SubmitTarget =
  | "personal-login"
  | "personal-google-login"
  | "personal-google-register"
  | "personal-google-profile"
  | "personal-register"
  | "student-login"
  | "student-register";
type SubmitResult = {
  target: SubmitTarget;
  response: AuthResult;
};

type PersonalRegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  cref: string;
  specialty: string;
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
  whatsapp: "",
  cref: "",
  specialty: "Hipertrofia",
  password: "",
  confirmPassword: "",
};

const emptyStudentForm: StudentForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const specialties = [
  "Hipertrofia",
  "Emagrecimento",
  "Performance",
  "Reabilitacao",
  "Funcional",
];

export function AccessAuthClient({ initialRole, invite, token }: AccessAuthClientProps) {
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

  useRevealMotion(rootRef);

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
    if (activeRole === "aluno" && tab === "register" && !canRegisterStudent) {
      setResult({
        target: "student-register",
        response: {
          ok: false,
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

  async function submitPersonalLogin() {
    await submit("personal-login", () => personalEmailLogin());
  }

  async function submitGoogleLogin() {
    await submit("personal-google-login", () => personalGoogleLogin());
  }

  async function startGoogleRegister() {
    await submit(
      "personal-google-register",
      () => personalGoogleStart(),
      (response) => {
        if (response.ok) {
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
      personalEmailRegister(personalRegister.email),
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

  async function submitStudentLogin() {
    await submit("student-login", () => mockStudentLogin());
  }

  async function submitStudentRegister() {
    const errors = validateStudentRegister(studentForm);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    await submit("student-register", () => mockStudentRegister(invite));
  }

  async function submit(
    target: SubmitTarget,
    action: () => Promise<AuthResult>,
    afterSubmit?: (response: AuthResult) => void,
  ) {
    setSubmitting(target);
    setResult(null);

    const response = await action();

    setSubmitting(null);
    setResult({ target, response });
    afterSubmit?.(response);

    if (!response.ok && response.field === "email") {
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

            {activeRole === "personal" ? (
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
                onLogin={submitStudentLogin}
                onRegister={submitStudentRegister}
                onUpdate={setStudentField}
                passwordStrength={studentStrength}
                submitting={submitting}
                tab={studentTab}
                token={token}
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
  onLogin: () => Promise<void>;
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
        <div className="auth-step" data-r="up">
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
          <ControlledField
            tone="dark"
            id="personal-whatsapp"
            label="WhatsApp"
            value={form.whatsapp}
            onChange={(value) => onUpdate("whatsapp", value)}
            icon={<IconBrandWhatsapp aria-hidden="true" />}
            placeholder="(11) 98765-4321"
            helper="Formato BR para notificacoes e verificacao."
            error={fieldErrors.whatsapp}
            required
          />
          <button className="auth-submit dark" type="button" onClick={onStepNext}>
            Continuar <IconArrowRight aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {personalStep === 2 ? (
        <div className="auth-step" data-r="up">
          <ControlledField
            tone="dark"
            id="personal-cref"
            label="CREF opcional"
            value={form.cref}
            onChange={(value) => onUpdate("cref", value.toUpperCase())}
            icon={<IconId aria-hidden="true" />}
            placeholder="123456-G/SP"
            helper="Use o formato 000000-X/UF quando preencher."
            error={fieldErrors.cref}
          />
          <label className="auth-field" htmlFor="personal-specialty">
            <span className="auth-label dark">Especialidade</span>
            <span className="auth-input-wrap">
              <IconSparkles className="auth-input-icon dark" aria-hidden="true" />
              <select
                className="auth-input dark"
                id="personal-specialty"
                value={form.specialty}
                onChange={(event) => onUpdate("specialty", event.target.value)}
              >
                {specialties.map((specialty) => (
                  <option key={specialty}>{specialty}</option>
                ))}
              </select>
            </span>
          </label>
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
        <div className="auth-step" data-r="up">
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
  onLogin,
  onRegister,
  onUpdate,
  passwordStrength,
  setVisiblePasswords,
  submitting,
  tab,
  token,
  visiblePasswords,
}: {
  canRegisterStudent: boolean;
  fieldErrors: Record<string, string>;
  form: StudentForm;
  invite: InviteValidation;
  onLogin: () => Promise<void>;
  onRegister: () => Promise<void>;
  onUpdate: <Key extends keyof StudentForm>(key: Key, value: StudentForm[Key]) => void;
  passwordStrength: { score: number; label: string };
  setVisiblePasswords: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  submitting: SubmitTarget | null;
  tab: PanelTab;
  token?: string;
  visiblePasswords: Record<string, boolean>;
}) {
  if (tab === "login") {
    return (
      <form className="auth-form" action={onLogin}>
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
        <InviteHint invite={invite} token={token} />
      </form>
    );
  }

  return (
    <div className="auth-form">
      <InviteHint invite={invite} token={token} expanded />
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
        <p>Google preencheu nome e avatar. Falta apenas CREF e especialidade.</p>
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
  token,
}: {
  expanded?: boolean;
  invite: InviteValidation;
  token?: string;
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
      {token ? <code>{token}</code> : null}
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
    <div className={`password-strength ${tone}`} aria-live="polite">
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
    (!result.response.ok && result.response.field === "email" && role === "personal")
  ) {
    return null;
  }

  return (
    <div
      className={`auth-result ${result.response.ok ? "success" : "error"}`}
      role="status"
    >
      {result.response.ok ? (
        <IconCheck aria-hidden="true" />
      ) : (
        <IconShieldCheck aria-hidden="true" />
      )}
      <span>{result.response.message}</span>
      {result.response.ok ? (
        <>
          <small>
            {result.response.backendContract.endpoint} / role: {result.response.user.role}{" "}
            / destino: {result.response.redirectTo}
          </small>
          {result.response.emailVerificationSent ? (
            <small>
              Email de verificacao enviado. Bloqueado ate validar:{" "}
              {result.response.featuresLockedUntilEmailVerified?.join(", ")}.
            </small>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function useRevealMotion(rootRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
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
  }, [rootRef]);
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
    if (!isBrazilianPhone(form.whatsapp)) {
      errors.whatsapp = "Use um WhatsApp BR com DDD.";
    }
  }

  if (step === 2 && form.cref && !/^\d{6}-[A-Z]\/[A-Z]{2}$/.test(form.cref)) {
    errors.cref = "Use o formato 000000-X/UF.";
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

function isBrazilianPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  return digits.length === 10 || digits.length === 11;
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
