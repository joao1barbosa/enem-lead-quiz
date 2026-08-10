import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ScoringCalculator } from '../src/modules/scoring/scoring.calculator';

const prisma = new PrismaClient();

interface AlternativeSeed {
  text: string;
  score: number;
}

interface QuestionSeed {
  order: number;
  text: string;
  alternatives: AlternativeSeed[];
}

interface QuestionWithAlternatives {
  id: string;
  text: string;
  alternatives: { id: string; text: string; score: number }[];
}

interface SelectedAnswer {
  questionId: string;
  questionText: string;
  alternativeId: string;
  alternativeText: string;
  score: number;
}

interface LeadSeed {
  name: string;
  email: string;
  phone: string;
  /** Score alvo da faixa diagnóstica desejada (0-25, 26-50, 51-75, 76-100). */
  targetScore: number;
  createdAt: Date;
}

const questions: QuestionSeed[] = [
  {
    order: 1,
    text: 'Em que etapa dos estudos você está?',
    alternatives: [
      { text: 'Estou no 1º ou 2º ano do ensino médio', score: 2 },
      { text: 'Estou no 3º ano', score: 5 },
      { text: 'Já terminei o ensino médio e estudo por conta', score: 7 },
      { text: 'Já terminei e faço cursinho', score: 10 },
    ],
  },
  {
    order: 2,
    text: 'Quantas horas por semana você estuda além da escola/cursinho?',
    alternatives: [
      { text: 'Menos de 2 horas', score: 0 },
      { text: 'De 3 a 6 horas', score: 4 },
      { text: 'De 7 a 14 horas', score: 7 },
      { text: '15 horas ou mais', score: 10 },
    ],
  },
  {
    order: 3,
    text: 'Quantos simulados completos você já fez?',
    alternatives: [
      { text: 'Nenhum', score: 0 },
      { text: '1 ou 2', score: 3 },
      { text: 'De 3 a 5', score: 7 },
      { text: 'Mais de 5', score: 10 },
    ],
  },
  {
    order: 4,
    text: 'Como está sua preparação para a redação?',
    alternatives: [
      { text: 'Nunca escrevi uma redação no modelo ENEM', score: 0 },
      { text: 'Escrevi algumas, mas sem correção', score: 3 },
      { text: 'Escrevo e recebo correção de vez em quando', score: 7 },
      { text: 'Escrevo semanalmente com correção', score: 10 },
    ],
  },
  {
    order: 5,
    text: 'Você tem um plano de estudos definido?',
    alternatives: [
      { text: 'Não, estudo conforme dá', score: 0 },
      { text: 'Tenho uma ideia geral do que preciso estudar', score: 3 },
      { text: 'Tenho um plano, mas sigo parcialmente', score: 7 },
      { text: 'Tenho um plano e sigo à risca', score: 10 },
    ],
  },
  {
    order: 6,
    text: 'Qual é a sua maior dificuldade hoje?',
    alternatives: [
      { text: 'Não consigo me organizar nem manter constância', score: 2 },
      { text: 'Matemática e Ciências da Natureza', score: 5 },
      { text: 'Redação', score: 5 },
      { text: 'Linguagens e Ciências Humanas', score: 7 },
      { text: 'Não tenho dificuldade específica, quero melhorar no geral', score: 10 },
    ],
  },
  {
    order: 7,
    text: 'Qual foi sua média aproximada nos últimos simulados?',
    alternatives: [
      { text: 'Não sei / nunca fiz', score: 0 },
      { text: 'Abaixo de 500', score: 3 },
      { text: 'Entre 500 e 650', score: 6 },
      { text: 'Entre 650 e 750', score: 8 },
      { text: 'Acima de 750', score: 10 },
    ],
  },
  {
    order: 8,
    text: 'Quão claro está seu objetivo de curso e universidade?',
    alternatives: [
      { text: 'Ainda não sei o que quero cursar', score: 2 },
      { text: 'Tenho duas ou três opções em mente', score: 5 },
      { text: 'Sei o curso, mas não sei a nota de corte', score: 7 },
      { text: 'Sei o curso, a universidade e a nota de corte que preciso', score: 10 },
    ],
  },
  {
    order: 9,
    text: 'Com que frequência você revisa o conteúdo que já estudou?',
    alternatives: [
      { text: 'Não reviso, só avanço para matéria nova', score: 0 },
      { text: 'Reviso só na véspera das provas', score: 3 },
      { text: 'Reviso de vez em quando, sem método definido', score: 7 },
      { text: 'Tenho uma rotina de revisão programada', score: 10 },
    ],
  },
  {
    order: 10,
    text: 'Você pretende investir em um cursinho ou mentoria neste ano?',
    alternatives: [
      { text: 'Não pretendo investir', score: 2 },
      { text: 'Talvez, mas ainda não pesquisei nada', score: 5 },
      { text: 'Estou pesquisando opções agora', score: 8 },
      { text: 'Já decidi que vou, só falta escolher onde', score: 10 },
    ],
  },
];

/**
 * Seleciona uma alternativa por pergunta cuja soma dos scores seja EXATAMENTE
 * `targetScore` (quando o alvo é alcançável), distribuindo a escolha entre as
 * perguntas de forma balanceada. Se o alvo não for alcançável, usa o valor
 * mais próximo que é.
 *
 * Algoritmo: DP "escolher 1 de cada grupo" sobre as perguntas para descobrir
 * quais somas são alcançáveis, seguido de backtracking para reconstruir a
 * seleção. Na reconstrução, entre as alternativas que preservam a soma alvo,
 * prioriza-se a com score mais próximo da contribuição média ideal.
 */
function selectAnswersForTarget(
  questions: QuestionWithAlternatives[],
  targetScore: number,
): SelectedAnswer[] {
  const n = questions.length;

  // dp[i][s] = é possível somar `s` usando as i primeiras perguntas.
  const dp: boolean[][] = Array.from({ length: n + 1 }, () => new Array(101).fill(false));
  dp[0][0] = true;
  for (let i = 0; i < n; i++) {
    const scores = questions[i].alternatives.map((a) => a.score);
    for (let s = 0; s <= 100; s++) {
      if (!dp[i][s]) continue;
      for (const score of scores) {
        if (s + score <= 100) dp[i + 1][s + score] = true;
      }
    }
  }

  // Soma alvo real: exata se alcançável, senão a mais próxima possível.
  let bestSum = targetScore;
  if (!dp[n][targetScore]) {
    let distance = Infinity;
    for (let s = 0; s <= 100; s++) {
      if (dp[n][s] && Math.abs(s - targetScore) < distance) {
        distance = Math.abs(s - targetScore);
        bestSum = s;
      }
    }
  }

  // Backtracking: reconstruir a seleção que soma `bestSum`.
  const answers: SelectedAnswer[] = [];
  let remainingSum = bestSum;
  for (let i = n - 1; i >= 0; i--) {
    const question = questions[i];
    // Alternativas que mantêm `remainingSum` alcançável nas perguntas anteriores.
    const options = question.alternatives
      .filter((alt) => remainingSum - alt.score >= 0 && dp[i][remainingSum - alt.score])
      .map((alt) => ({ alt, score: alt.score }));

    // Entre as viáveis, escolhe a mais próxima da contribuição média ideal.
    const ideal = remainingSum / (i + 1);
    const chosen = options.reduce((a, b) =>
      Math.abs(a.score - ideal) <= Math.abs(b.score - ideal) ? a : b,
    );

    answers.unshift({
      questionId: question.id,
      questionText: question.text,
      alternativeId: chosen.alt.id,
      alternativeText: chosen.alt.text,
      score: chosen.alt.score,
    });
    remainingSum -= chosen.alt.score;
  }

  return answers;
}

async function main() {
  console.log('Iniciando seed...');

  // Verifica se o banco já foi populado (seed idempotente)
  const existingQuestions = await prisma.question.count();
  const existingLeads = await prisma.lead.count();
  const existingAdmin = await prisma.admin.count();

  if (existingQuestions > 0 && existingLeads > 0 && existingAdmin > 0) {
    console.log('Banco já populado. Seed ignorado.');
    return;
  }

  console.log(`Estado atual: ${existingQuestions} perguntas, ${existingLeads} leads, ${existingAdmin} admins`);

  for (const q of questions) {
    await prisma.question.upsert({
      where: { order: q.order },
      update: {
        text: q.text,
        alternatives: {
          deleteMany: {},
          create: q.alternatives.map((a) => ({ text: a.text, score: a.score })),
        },
      },
      create: {
        order: q.order,
        text: q.text,
        alternatives: {
          create: q.alternatives.map((a) => ({ text: a.text, score: a.score })),
        },
      },
    });
    console.log(`Pergunta ${q.order} criada/atualizada.`);
  }

  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      password: adminPassword,
      name: 'Administrador',
    },
  });
  console.log('Admin padrão criado (admin@admin.com / admin123).');

  // Limpar leads existentes apenas se houver leads (respostas são removidas por cascade).
  if (existingLeads > 0) {
    await prisma.lead.deleteMany();
    console.log('Leads antigos removidos.');
  }

  // Perguntas reais do banco (com alternativas persistidas).
  const quizQuestions = await prisma.question.findMany({
    include: { alternatives: true },
    orderBy: { order: 'asc' },
  });

  // Datas verdadeiramente aleatórias dentro das últimas 2 semanas (0-14 dias),
  // sem distribuição uniforme entre os dias.
  const randomDate = () =>
    new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000);

  // Faixas do DIAGNOSTICS: STARTING_POINT 0-25, IN_CONSTRUCTION 26-50,
  // ON_RIGHT_TRACK 51-75, FINAL_STRETCH 76-100. O score alvo de cada lead é
  // atingido exatamente pela soma dos scores das 10 respostas selecionadas.
  const leads: LeadSeed[] = [
    // STARTING_POINT (0-25) - 8 leads
    {
      name: 'Ana Beatriz Souza Lima',
      email: 'ana.souza@gmail.com',
      phone: '11912345678',
      targetScore: 12,
      createdAt: randomDate(),
    },
    {
      name: 'Carlos Eduardo Martins',
      email: 'carlos.martins@hotmail.com',
      phone: '21923456789',
      targetScore: 18,
      createdAt: randomDate(),
    },
    {
      name: 'Fernanda Oliveira Ribeiro',
      email: 'fernanda.ribeiro@outlook.com',
      phone: '31934567890',
      targetScore: 16,
      createdAt: randomDate(),
    },
    {
      name: 'Gabriel Santos Ferreira',
      email: 'gabriel.ferreira@uol.com.br',
      phone: '41945678901',
      targetScore: 8,
      createdAt: randomDate(),
    },
    {
      name: 'Juliana Costa Barbosa',
      email: 'juliana.barbosa@yahoo.com',
      phone: '51956789012',
      targetScore: 14,
      createdAt: randomDate(),
    },
    {
      name: 'Rafael Almeida Nogueira',
      email: 'rafael.nogueira@icloud.com',
      phone: '61967890123',
      targetScore: 15,
      createdAt: randomDate(),
    },
    {
      name: 'Larissa Pereira Monteiro',
      email: 'larissa.monteiro@bol.com.br',
      phone: '71978901234',
      targetScore: 11,
      createdAt: randomDate(),
    },
    {
      name: 'Thiago Rodrigues Carvalho',
      email: 'thiago.carvalho@terra.com.br',
      phone: '81989012345',
      targetScore: 21,
      createdAt: randomDate(),
    },

    // IN_CONSTRUCTION (26-50) - 9 leads
    {
      name: 'Camila Fernandes Azevedo',
      email: 'camila.azevedo@gmail.com',
      phone: '91901234567',
      targetScore: 33,
      createdAt: randomDate(),
    },
    {
      name: 'Matheus Araújo Castro',
      email: 'matheus.castro@hotmail.com',
      phone: '11913579246',
      targetScore: 38,
      createdAt: randomDate(),
    },
    {
      name: 'Bianca Gomes Teixeira',
      email: 'bianca.teixeira@outlook.com',
      phone: '21924681357',
      targetScore: 42,
      createdAt: randomDate(),
    },
    {
      name: 'Vinícius Moraes Rocha',
      email: 'vinicius.rocha@yahoo.com',
      phone: '31935792468',
      targetScore: 47,
      createdAt: randomDate(),
    },
    {
      name: 'Patrícia Cardoso Farias',
      email: 'patricia.farias@uol.com.br',
      phone: '41946813579',
      targetScore: 35,
      createdAt: randomDate(),
    },
    {
      name: 'Leonardo Pinto Vasconcelos',
      email: 'leonardo.vasconcelos@icloud.com',
      phone: '51957924680',
      targetScore: 30,
      createdAt: randomDate(),
    },
    {
      name: 'Aline Rocha Mendonça',
      email: 'aline.mendonca@bol.com.br',
      phone: '61968035791',
      targetScore: 44,
      createdAt: randomDate(),
    },
    {
      name: 'Gustavo Nunes Prado',
      email: 'gustavo.prado@terra.com.br',
      phone: '71979146802',
      targetScore: 39,
      createdAt: randomDate(),
    },
    {
      name: 'Sabrina Melo Cunha',
      email: 'sabrina.cunha@gmail.com',
      phone: '81980257913',
      targetScore: 31,
      createdAt: randomDate(),
    },

    // ON_RIGHT_TRACK (51-75) - 9 leads
    {
      name: 'Diego Barbosa Sales',
      email: 'diego.sales@hotmail.com',
      phone: '91991368024',
      targetScore: 58,
      createdAt: randomDate(),
    },
    {
      name: 'Isabela Campos Duarte',
      email: 'isabela.duarte@outlook.com',
      phone: '11902479135',
      targetScore: 63,
      createdAt: randomDate(),
    },
    {
      name: 'Felipe Moreira Santana',
      email: 'felipe.santana@yahoo.com',
      phone: '21913580246',
      targetScore: 67,
      createdAt: randomDate(),
    },
    {
      name: 'Letícia Freitas Barros',
      email: 'leticia.barros@uol.com.br',
      phone: '31924691357',
      targetScore: 72,
      createdAt: randomDate(),
    },
    {
      name: 'André Cavalcanti Gomes',
      email: 'andre.gomes@icloud.com',
      phone: '41935702468',
      targetScore: 60,
      createdAt: randomDate(),
    },
    {
      name: 'Marina Dias Peixoto',
      email: 'marina.peixoto@bol.com.br',
      phone: '51946813579',
      targetScore: 60,
      createdAt: randomDate(),
    },
    {
      name: 'Rodrigo Fonseca Andrade',
      email: 'rodrigo.andrade@terra.com.br',
      phone: '61957924680',
      targetScore: 69,
      createdAt: randomDate(),
    },
    {
      name: 'Vanessa Lima Quintana',
      email: 'vanessa.quintana@gmail.com',
      phone: '71968035791',
      targetScore: 74,
      createdAt: randomDate(),
    },
    {
      name: 'Bruno Tavares Neves',
      email: 'bruno.neves@hotmail.com',
      phone: '81979146802',
      targetScore: 57,
      createdAt: randomDate(),
    },

    // FINAL_STRETCH (76-100) - 8 leads
    {
      name: 'Marcela Viana Coutinho',
      email: 'marcela.coutinho@outlook.com',
      phone: '91980257913',
      targetScore: 82,
      createdAt: randomDate(),
    },
    {
      name: 'Pedro Henrique Batista',
      email: 'pedro.batista@yahoo.com',
      phone: '11991368024',
      targetScore: 87,
      createdAt: randomDate(),
    },
    {
      name: 'Natália Aguiar Fontes',
      email: 'natalia.fontes@uol.com.br',
      phone: '21902479135',
      targetScore: 91,
      createdAt: randomDate(),
    },
    {
      name: 'João Vitor Ramos Silveira',
      email: 'joaovitor.silveira@icloud.com',
      phone: '31913580246',
      targetScore: 95,
      createdAt: randomDate(),
    },
    {
      name: 'Renata Barbosa Lopes',
      email: 'renata.lopes@bol.com.br',
      phone: '41924691357',
      targetScore: 84,
      createdAt: randomDate(),
    },
    {
      name: 'Eduardo Correia Muniz',
      email: 'eduardo.muniz@terra.com.br',
      phone: '51935702468',
      targetScore: 89,
      createdAt: randomDate(),
    },
    {
      name: 'Beatriz Gonçalves Ferraz',
      email: 'beatriz.ferraz@gmail.com',
      phone: '61946813579',
      targetScore: 80,
      createdAt: randomDate(),
    },
    {
      name: 'Otávio Siqueira Brandão',
      email: 'otavio.brandao@hotmail.com',
      phone: '71957924680',
      targetScore: 83,
      createdAt: randomDate(),
    },
  ];

  const scoring = new ScoringCalculator();

  for (const lead of leads) {
    const answers = selectAnswersForTarget(quizQuestions, lead.targetScore);
    const score = answers.reduce((total, answer) => total + answer.score, 0);
    // Slug/title/message derivados do score via DIAGNOSTICS (RF-02).
    const diagnostic = scoring.getDiagnostic(score);

    // Lead + respostas em uma única transação (mesmo fluxo do LeadService).
    await prisma.lead.create({
      data: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        score,
        diagnosticSlug: diagnostic.slug,
        diagnosticTitle: diagnostic.title,
        diagnosticMessage: diagnostic.message,
        createdAt: lead.createdAt,
        answers: {
          create: answers.map((answer) => ({
            questionId: answer.questionId,
            questionText: answer.questionText,
            alternativeId: answer.alternativeId,
            alternativeText: answer.alternativeText,
            score: answer.score,
          })),
        },
      },
    });
    console.log(
      `Lead criado: ${lead.name} | score=${score} | ${diagnostic.slug} | respostas=${answers.length}`,
    );
  }
  console.log(`${leads.length} leads diversificados criados com respostas.`);

  console.log('Seed concluído com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
