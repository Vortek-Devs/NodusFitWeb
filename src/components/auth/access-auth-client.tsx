"use client";

import {
  IconArrowLeft,
  IconArrowRight,
  IconBarbell,
  IconBrandWhatsapp,
  IconCheck,
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
  type InviteValidation,
  mockPersonalLogin,
  mockPersonalRegister,
  mockStudentLogin,
  mockStudentRegister,
} from "@/lib/auth/mock-auth";

type AccessAuthClientProps = {
  initialRole: AuthRole;
  invite: InviteValidation;
  token?: string;
};

type PanelTab = "login" | "register";
type SubmitTarget =
  | "personal-login"
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
  const [studentTab, setStudentTab] = useState<PanelTab>(
    invite.status === "valid" ? "register" : "login",
  );
  const [personalStep, setPersonalStep] = useState(1);
  const [personalRegister, setPersonalRegister] =
    useState<PersonalRegisterForm>(emptyPersonalRegister);
  const [studentForm, setStudentForm] = useState<StudentForm>(emptyStudentForm);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState<SubmitTarget | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useRevealMotion(rootRef);

  const personalStrength = useMemo(
    () => getPasswordStrength(personalRegister.password),
    [personalRegister.password],
  );
  const studentStrength = useMemo(
    () => getPasswordStrength(studentForm.password),
    [studentForm.password],
  );

  const inviteMessage = getInviteMessage(invite.status);
  const canRegisterStudent = invite.status === "valid";

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
    await submit("personal-login", () => mockPersonalLogin());
  }

  async function submitPersonalRegister() {
    const errors = validatePersonalStep(3, personalRegister);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    await submit("personal-register", () => mockPersonalRegister(personalRegister.email));
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

  async function submit(target: SubmitTarget, action: () => Promise<AuthResult>) {
    setSubmitting(target);
    setResult(null);

    const response = await action();

    setSubmitting(null);
    setResult({ target, response });

    if (!response.ok && response.field === "email") {
      setPersonalStep(1);
      setFieldErrors((current) => ({ ...current, personalEmail: response.message }));
    }
  }

  return (
    <main className="auth-vor70" ref={rootRef}>
      <fieldset className="auth-role-switch">
        <legend className="auth-sr-only">Escolha o tipo de acesso</legend>
        <button
          type="button"
          className={activeRole === "personal" ? "active" : ""}
          onClick={() => setActiveRole("personal")}
        >
          <IconUser aria-hidden="true" />
          Personal
        </button>
        <button
          type="button"
          className={activeRole === "aluno" ? "active" : ""}
          onClick={() => setActiveRole("aluno")}
        >
          <IconRun aria-hidden="true" />
          Aluno
        </button>
      </fieldset>

      <section className="auth-shell" aria-label="Acesso Nodus Fit">
        <Panel className="panel-personal" hiddenOnMobile={activeRole !== "personal"}>
          <AmbientGlow tone="dark" />
          <PanelInner>
            <BrandMark tone="dark" />
            <PersonaBadge tone="dark" icon={<IconUser aria-hidden="true" />}>
              Area do Personal
            </PersonaBadge>
            <PanelHeading
              tone="dark"
              title={personalTab === "login" ? "Bem-vindo de volta." : "Crie sua conta."}
              description={
                personalTab === "login"
                  ? "Acesse seu painel e gerencie alunos, treinos e pagamentos."
                  : "Configure o perfil profissional em tres passos, sem sobrecarga."
              }
            />
            <Tabs
              tone="dark"
              active={personalTab}
              onChange={(tab) => {
                setPersonalTab(tab);
                setResult(null);
              }}
            />

            {personalTab === "login" ? (
              <form className="auth-form" action={submitPersonalLogin}>
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
            ) : (
              <form className="auth-form" action={submitPersonalRegister}>
                <ProgressDots tone="dark" step={personalStep} total={3} />
                {personalStep === 1 ? (
                  <div className="auth-step" data-r="up">
                    <div className="auth-grid">
                      <ControlledField
                        tone="dark"
                        id="personal-first-name"
                        label="Nome"
                        value={personalRegister.firstName}
                        onChange={(value) => setPersonalField("firstName", value)}
                        icon={<IconUser aria-hidden="true" />}
                        placeholder="Marcos"
                        error={fieldErrors.firstName}
                        required
                      />
                      <ControlledField
                        tone="dark"
                        id="personal-last-name"
                        label="Sobrenome"
                        value={personalRegister.lastName}
                        onChange={(value) => setPersonalField("lastName", value)}
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
                      value={personalRegister.email}
                      onChange={(value) => setPersonalField("email", value)}
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
                      value={personalRegister.whatsapp}
                      onChange={(value) => setPersonalField("whatsapp", value)}
                      icon={<IconBrandWhatsapp aria-hidden="true" />}
                      placeholder="(11) 98765-4321"
                      helper="Formato BR para notificacoes importantes."
                      error={fieldErrors.whatsapp}
                      required
                    />
                    <button
                      className="auth-submit dark"
                      type="button"
                      onClick={nextPersonalStep}
                    >
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
                      value={personalRegister.cref}
                      onChange={(value) => setPersonalField("cref", value.toUpperCase())}
                      icon={<IconId aria-hidden="true" />}
                      placeholder="123456-G/SP"
                      helper="Use o formato 000000-X/UF quando preencher."
                      error={fieldErrors.cref}
                    />
                    <label className="auth-field">
                      <span className="auth-label dark">Especialidade</span>
                      <span className="auth-input-wrap">
                        <IconSparkles
                          className="auth-input-icon dark"
                          aria-hidden="true"
                        />
                        <select
                          className="auth-input dark"
                          value={personalRegister.specialty}
                          onChange={(event) =>
                            setPersonalField("specialty", event.target.value)
                          }
                        >
                          {specialties.map((specialty) => (
                            <option key={specialty}>{specialty}</option>
                          ))}
                        </select>
                      </span>
                    </label>
                    <StepActions
                      tone="dark"
                      onBack={() => setPersonalStep(1)}
                      onNext={nextPersonalStep}
                    />
                  </div>
                ) : null}

                {personalStep === 3 ? (
                  <div className="auth-step" data-r="up">
                    <ControlledPasswordField
                      tone="dark"
                      id="personal-register-password"
                      label="Senha"
                      value={personalRegister.password}
                      onChange={(value) => setPersonalField("password", value)}
                      visible={visiblePasswords.personalRegister}
                      onToggle={() =>
                        togglePassword("personalRegister", setVisiblePasswords)
                      }
                      error={fieldErrors.password}
                    />
                    <PasswordStrength tone="dark" strength={personalStrength} />
                    <ControlledPasswordField
                      tone="dark"
                      id="personal-confirm-password"
                      label="Confirmar senha"
                      value={personalRegister.confirmPassword}
                      onChange={(value) => setPersonalField("confirmPassword", value)}
                      visible={visiblePasswords.personalConfirm}
                      onToggle={() =>
                        togglePassword("personalConfirm", setVisiblePasswords)
                      }
                      error={fieldErrors.confirmPassword}
                    />
                    <div className="auth-actions">
                      <button
                        className="auth-back dark"
                        type="button"
                        onClick={() => setPersonalStep(2)}
                      >
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
            )}
            <PanelResult result={result} targetPrefix="personal" />
          </PanelInner>
        </Panel>

        <Panel className="panel-student" hiddenOnMobile={activeRole !== "aluno"}>
          <AmbientGlow tone="light" />
          <PanelInner>
            <BrandMark tone="light" />
            <PersonaBadge tone="light" icon={<IconRun aria-hidden="true" />}>
              Area do Aluno
            </PersonaBadge>
            <PanelHeading
              tone="light"
              title={
                studentTab === "login" ? "Seu treino te espera." : "Junte-se ao time."
              }
              description={
                studentTab === "login"
                  ? "Acesse o app e veja o treino de hoje."
                  : "Crie sua conta pelo convite do seu personal."
              }
            />
            <Tabs
              tone="light"
              active={studentTab}
              onChange={(tab) => {
                setStudentTab(tab);
                setResult(null);
              }}
            />

            {studentTab === "login" ? (
              <form className="auth-form" action={submitStudentLogin}>
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
              </form>
            ) : (
              <div className="auth-form">
                {invite.personal ? (
                  <div className="invite-badge light" data-r="up">
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
                ) : (
                  <div className="invite-blocked" data-r="up">
                    <IconShieldCheck aria-hidden="true" />
                    <strong>{inviteMessage.title}</strong>
                    <p>{inviteMessage.description}</p>
                    {token ? <code>{token}</code> : null}
                  </div>
                )}

                <form action={submitStudentRegister} className="auth-step">
                  <ControlledField
                    tone="light"
                    id="student-name"
                    label="Nome completo"
                    value={studentForm.name}
                    onChange={(value) => setStudentField("name", value)}
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
                    value={studentForm.email}
                    onChange={(value) => setStudentField("email", value)}
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
                    value={studentForm.password}
                    onChange={(value) => setStudentField("password", value)}
                    visible={visiblePasswords.studentRegister}
                    onToggle={() =>
                      togglePassword("studentRegister", setVisiblePasswords)
                    }
                    error={fieldErrors.studentPassword}
                    disabled={!canRegisterStudent}
                  />
                  <PasswordStrength tone="light" strength={studentStrength} />
                  <ControlledPasswordField
                    tone="light"
                    id="student-confirm-password"
                    label="Confirmar senha"
                    value={studentForm.confirmPassword}
                    onChange={(value) => setStudentField("confirmPassword", value)}
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
            )}
            <PanelResult result={result} targetPrefix="student" />
          </PanelInner>
        </Panel>
      </section>
    </main>
  );
}

function Panel({
  children,
  className,
  hiddenOnMobile,
}: {
  children: React.ReactNode;
  className: string;
  hiddenOnMobile: boolean;
}) {
  return (
    <section
      className={`auth-panel ${className} ${hiddenOnMobile ? "mobile-hidden" : ""}`}
    >
      {children}
    </section>
  );
}

function PanelInner({ children }: { children: React.ReactNode }) {
  return <div className="auth-panel-inner">{children}</div>;
}

function AmbientGlow({ tone }: { tone: "dark" | "light" }) {
  return (
    <>
      <span className={`auth-glow ${tone} top`} />
      <span className={`auth-glow ${tone} bottom`} />
    </>
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

function PersonaBadge({
  children,
  icon,
  tone,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  tone: "dark" | "light";
}) {
  return (
    <span className={`persona-badge-auth ${tone}`}>
      {icon}
      {children}
    </span>
  );
}

function PanelHeading({
  description,
  title,
  tone,
}: {
  description: string;
  title: string;
  tone: "dark" | "light";
}) {
  return (
    <header className={`auth-heading ${tone}`} data-r="up">
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

function Tabs({
  active,
  onChange,
  tone,
}: {
  active: PanelTab;
  onChange: (tab: PanelTab) => void;
  tone: "dark" | "light";
}) {
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
        className={active === "register" ? "active" : ""}
        onClick={() => onChange("register")}
      >
        Criar conta
      </button>
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
  disabled,
  label,
  pending,
  tone,
}: {
  disabled?: boolean;
  label: string;
  pending: boolean;
  tone: "dark" | "light";
}) {
  return (
    <button
      className={`auth-submit ${tone}`}
      disabled={disabled || pending}
      type="submit"
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

function PanelResult({
  result,
  targetPrefix,
}: {
  result: SubmitResult | null;
  targetPrefix: "personal" | "student";
}) {
  const targetMatches =
    targetPrefix === "personal"
      ? result?.target.startsWith("personal")
      : result?.target.startsWith("student");

  if (
    !result ||
    !targetMatches ||
    (!result.response.ok &&
      result.response.field === "email" &&
      targetPrefix === "personal")
  ) {
    return null;
  }

  return (
    <div
      className={`auth-result ${result.response.ok ? "success" : "error"}`}
      role="status"
    >
      <IconCheck aria-hidden="true" />
      <span>{result.response.message}</span>
      {result.response.ok ? <small>Destino: {result.response.redirectTo}</small> : null}
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
