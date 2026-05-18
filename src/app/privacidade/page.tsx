import type { Metadata } from "next";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { createPublicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Política de Privacidade | Nodus Fit",
  description:
    "Entenda como o Nodus Fit coleta, usa e protege dados pessoais de visitantes, personal trainers e alunos.",
  path: "/privacidade",
});

const privacyEmail = "privacidade@nodusfit.com";

const dataCollected = [
  "Dados de cadastro, como nome, email, telefone, senha protegida e papel de uso na plataforma.",
  "Dados profissionais do personal, como informações de perfil, alunos vinculados, planos contratados e preferências de atendimento.",
  "Dados do aluno, como vínculo com o personal, treinos recebidos, execução de exercícios, cargas, repetições, histórico e feedbacks informados no app.",
  "Dados financeiros e de assinatura quando aplicável, como status de plano, cobranças, pagamentos e informações necessárias para emissão ou conciliação.",
  "Dados técnicos de acesso, como endereço IP, dispositivo, navegador, páginas acessadas, registros de erro e eventos básicos de uso.",
];

const purposes = [
  "Criar e manter contas de personal trainers e alunos.",
  "Permitir que o personal organize alunos, treinos, evolução e financeiro em uma experiência web e PWA.",
  "Exibir ao aluno o treino do dia, histórico, progresso e recursos associados ao acompanhamento.",
  "Processar assinaturas, planos, cobranças e comunicações relacionadas ao serviço.",
  "Melhorar segurança, estabilidade, suporte, experiência de uso e evolução do produto.",
  "Cumprir obrigações legais, regulatórias, fiscais e solicitações legítimas de titulares.",
];

const legalBases = [
  "Execução de contrato ou procedimentos preliminares, quando os dados são necessários para entregar a plataforma.",
  "Cumprimento de obrigação legal ou regulatória, quando precisamos manter registros exigidos por lei.",
  "Legítimo interesse, para segurança, prevenção de abuso, melhoria do produto e suporte, sempre respeitando os direitos do titular.",
  "Consentimento, quando a lei exigir autorização específica, como em determinadas comunicações ou recursos opcionais.",
];

const rights = [
  "Confirmar se tratamos seus dados pessoais.",
  "Acessar, corrigir ou atualizar dados incompletos, inexatos ou desatualizados.",
  "Solicitar anonimização, bloqueio, eliminação ou portabilidade, quando aplicável.",
  "Revogar consentimentos e pedir informações sobre compartilhamento de dados.",
  "Solicitar revisão de decisões automatizadas, se esse tipo de decisão for usado no futuro.",
];

export default function PrivacyPage() {
  return (
    <PublicPageShell
      eyebrow="Política de Privacidade"
      title="Como o Nodus Fit trata dados pessoais"
      description="Esta política explica, em linguagem direta, quais dados podem ser tratados na plataforma, por que eles são usados e como titulares podem exercer seus direitos."
    >
      <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <p>
          Este texto é um draft operacional de privacidade para orientar visitantes,
          personal trainers e alunos enquanto o Nodus Fit evolui. Ele não substitui
          aconselhamento jurídico e ainda pode passar por revisão jurídica final.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Visão geral</h2>
        <p>
          O Nodus Fit é uma plataforma web e PWA para personal trainers gerenciarem
          alunos, treinos, evolução e financeiro. O aluno acessa recursos ligados ao
          acompanhamento do seu personal, como treino do dia, histórico e feedbacks.
        </p>
        <p>
          Tratamos dados pessoais apenas quando eles ajudam a entregar o serviço, proteger
          a plataforma, prestar suporte, cumprir obrigações legais ou melhorar a
          experiência do produto.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Dados coletados</h2>
        <p>Dependendo do uso da plataforma, podemos tratar:</p>
        <ul>
          {dataCollected.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2>Finalidades de uso</h2>
        <p>Usamos dados pessoais para:</p>
        <ul>
          {purposes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2>Bases legais</h2>
        <p>
          O tratamento de dados pessoais pode se apoiar nas seguintes bases previstas na
          LGPD:
        </p>
        <ul>
          {legalBases.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2>Compartilhamento</h2>
        <p>
          Podemos compartilhar dados com provedores necessários para operar o Nodus Fit,
          como hospedagem, banco de dados, autenticação, pagamentos, email, analytics,
          monitoramento de erros e suporte. Esses parceiros devem tratar os dados apenas
          para as finalidades contratadas.
        </p>
        <p>
          Também podemos compartilhar informações quando houver obrigação legal, ordem de
          autoridade competente, defesa de direitos ou prevenção de fraude e abuso.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Retenção e segurança</h2>
        <p>
          Mantemos dados pessoais pelo tempo necessário para entregar a plataforma,
          cumprir obrigações legais, resolver disputas, prevenir abusos e preservar
          registros de segurança. Quando os dados deixam de ser necessários, adotamos
          medidas de exclusão, anonimização ou retenção restrita, conforme aplicável.
        </p>
        <p>
          Aplicamos controles técnicos e organizacionais proporcionais ao estágio do
          produto, incluindo autenticação, restrição de acesso, registro de eventos e boas
          práticas de desenvolvimento seguro.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Direitos dos titulares</h2>
        <p>Nos termos da LGPD, você pode solicitar:</p>
        <ul>
          {rights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Para exercer seus direitos, envie um email para{" "}
          <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>. Podemos pedir informações
          adicionais para confirmar sua identidade antes de atender a solicitação.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Cookies e analytics</h2>
        <p>
          Podemos usar cookies, armazenamento local e ferramentas de analytics para manter
          sessões, entender uso do produto, medir desempenho e identificar erros. Quando
          recursos de rastreamento opcionais exigirem consentimento, o Nodus Fit deverá
          coletar essa autorização antes do uso.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Crianças e adolescentes</h2>
        <p>
          O Nodus Fit é voltado ao uso por personal trainers e seus alunos. Quando houver
          tratamento de dados de menores de idade, esse uso deve ocorrer com orientação do
          responsável legal e apenas na medida necessária para acompanhamento físico,
          segurança e prestação do serviço.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Alterações desta política</h2>
        <p>
          Esta política pode ser atualizada para refletir mudanças no produto, em
          fornecedores, na legislação ou em práticas internas. A versão publicada nesta
          página será a referência mais recente para visitantes e usuários.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Contato</h2>
        <p>
          Para dúvidas sobre privacidade, pedidos LGPD ou solicitações relacionadas a
          dados pessoais, entre em contato pelo email{" "}
          <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>.
        </p>
      </section>
    </PublicPageShell>
  );
}
