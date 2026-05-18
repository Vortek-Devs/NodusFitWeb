import type { Metadata } from "next";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { createPublicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Termos de Uso | Nodus Fit",
  description:
    "Conheça as regras de uso, responsabilidades, assinatura, cancelamento e limitações do Nodus Fit.",
  path: "/termos",
});

const contactEmail = "contato@vortek.dev";

const acceptableUseRules = [
  "Usar a plataforma de forma lícita, respeitosa e compatível com sua finalidade.",
  "Informar dados verdadeiros no cadastro e manter as credenciais de acesso protegidas.",
  "Não tentar acessar contas, dados, sistemas ou áreas que não pertencem ao seu perfil.",
  "Não copiar, vender, sublicenciar, automatizar abusivamente ou explorar a plataforma sem autorização.",
  "Não enviar conteúdo ofensivo, ilegal, discriminatório, fraudulento ou que viole direitos de terceiros.",
];

const personalResponsibilities = [
  "Prescrever treinos e orientações adequadas ao contexto dos seus alunos.",
  "Manter informações de alunos, treinos, pagamentos e agenda atualizadas quando usar esses recursos.",
  "Obter autorizações necessárias para cadastrar ou convidar alunos, especialmente quando houver menores de idade.",
  "Avaliar riscos de saúde, limitações físicas e necessidade de acompanhamento profissional fora da plataforma.",
];

const studentResponsibilities = [
  "Usar a conta apenas para acompanhar os próprios treinos e informações vinculadas ao personal.",
  "Registrar cargas, repetições, feedbacks e demais dados com atenção, quando esses recursos estiverem disponíveis.",
  "Interromper exercícios e procurar orientação profissional em caso de dor, desconforto relevante ou insegurança.",
  "Não compartilhar links, acessos ou informações de treino de forma indevida.",
];

export default function TermsPage() {
  return (
    <PublicPageShell
      eyebrow="Termos de Uso"
      title="Regras de uso da plataforma"
      description="Estes termos explicam como personal trainers, alunos e visitantes podem usar o Nodus Fit, quais são as responsabilidades de cada parte e quais limites se aplicam ao serviço."
    >
      <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <p>
          Este texto é um draft operacional dos Termos de Uso do Nodus Fit. Ele organiza
          as regras iniciais do produto em linguagem clara, mas ainda pode passar por
          revisão jurídica final antes da publicação definitiva.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Visão geral</h2>
        <p>
          O Nodus Fit é uma plataforma web e PWA para personal trainers gerenciarem
          alunos, treinos, evolução e financeiro em uma experiência direta. O personal é o
          usuário que contrata ou administra a plataforma. O aluno acessa recursos
          vinculados ao acompanhamento feito pelo personal.
        </p>
        <p>
          Ao acessar ou usar o Nodus Fit, você concorda com estes termos e com a Política
          de Privacidade. Se não concordar, não use a plataforma.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Cadastro e acesso</h2>
        <p>
          Para usar áreas restritas, pode ser necessário criar uma conta, informar dados
          verdadeiros e manter senha ou método de autenticação em segurança. Você é
          responsável por atividades feitas com suas credenciais.
        </p>
        <p>
          Podemos bloquear, suspender ou encerrar acessos quando houver uso indevido,
          violação destes termos, risco à segurança ou necessidade de cumprir obrigação
          legal.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Papéis na plataforma</h2>
        <p>
          O personal usa o Nodus Fit para organizar sua operação profissional. O aluno usa
          a plataforma para consultar e registrar informações relacionadas ao próprio
          acompanhamento. Cada perfil deve acessar apenas os dados e recursos compatíveis
          com seu vínculo.
        </p>
        <p>
          O Nodus Fit fornece tecnologia de apoio. Ele não substitui avaliação médica,
          orientação individual do personal, atendimento de saúde, fisioterapia, nutrição
          ou qualquer serviço profissional regulado.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Responsabilidades do personal</h2>
        <p>Ao usar o Nodus Fit como personal, você deve:</p>
        <ul>
          {personalResponsibilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2>Responsabilidades do aluno</h2>
        <p>Ao usar o Nodus Fit como aluno, você deve:</p>
        <ul>
          {studentResponsibilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2>Uso aceitável</h2>
        <p>Você concorda em:</p>
        <ul>
          {acceptableUseRules.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2>Assinatura, planos e pagamentos</h2>
        <p>
          O Nodus Fit pode oferecer planos gratuitos e pagos para personal trainers. Os
          recursos, limites, preços, períodos de cobrança e condições de cada plano serão
          exibidos na página de preços, checkout ou painel da conta.
        </p>
        <p>
          Cobranças, renovação, inadimplência, notas fiscais e meios de pagamento podem
          depender de provedores externos. Quando um pagamento for processado por
          terceiros, também se aplicam os termos e políticas desses provedores.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Cancelamento e encerramento</h2>
        <p>
          O personal poderá cancelar planos pagos conforme as condições apresentadas no
          momento da contratação. O cancelamento impede novas cobranças futuras, mas não
          elimina automaticamente obrigações já vencidas, valores já processados ou
          registros que precisem ser mantidos por obrigação legal.
        </p>
        <p>
          Também podemos encerrar ou limitar contas em caso de violação destes termos,
          suspeita de fraude, risco operacional, ordem legal ou descontinuação de
          recursos.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Disponibilidade e mudanças no serviço</h2>
        <p>
          Trabalhamos para manter o Nodus Fit estável e acessível, mas não garantimos
          disponibilidade ininterrupta. A plataforma pode passar por manutenção,
          correções, atualizações, testes, indisponibilidades de terceiros ou mudanças de
          funcionalidade.
        </p>
        <p>
          Recursos em beta, experimentais ou planejados podem mudar, ser limitados ou não
          chegar à versão final.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Propriedade intelectual</h2>
        <p>
          O Nodus Fit, sua marca, interface, código, textos, componentes, design e demais
          elementos da plataforma pertencem aos seus titulares. Estes termos não
          transferem propriedade intelectual ao usuário.
        </p>
        <p>
          Conteúdos inseridos pelo usuário, como treinos, anotações e informações de
          acompanhamento, continuam pertencendo a quem detém seus direitos. Ao inserir
          esses conteúdos, você nos autoriza a processá-los apenas para operar e melhorar
          a plataforma.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Limitação de responsabilidade</h2>
        <p>
          O Nodus Fit é uma ferramenta de organização e acompanhamento. Decisões sobre
          treino, intensidade, execução, segurança física, saúde, cobrança de alunos e
          relação profissional entre personal e aluno são de responsabilidade dos usuários
          envolvidos.
        </p>
        <p>
          Na máxima extensão permitida por lei, não nos responsabilizamos por danos
          decorrentes de uso inadequado da plataforma, informações incorretas inseridas
          por usuários, falhas de terceiros, indisponibilidades temporárias ou decisões
          profissionais tomadas fora do nosso controle.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Privacidade</h2>
        <p>
          O tratamento de dados pessoais é explicado na{" "}
          <a href="/privacidade">Política de Privacidade</a>. Ao usar o Nodus Fit, você
          reconhece que dados podem ser tratados para entregar, proteger e melhorar a
          plataforma, respeitando a legislação aplicável.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Alterações destes termos</h2>
        <p>
          Estes termos podem ser atualizados para refletir mudanças no produto, em planos,
          em fornecedores, na legislação ou em práticas internas. A versão publicada nesta
          página será a referência mais recente.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Contato</h2>
        <p>
          Para dúvidas sobre estes termos, suporte inicial ou solicitações institucionais,
          entre em contato pelo email{" "}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      </section>
    </PublicPageShell>
  );
}
