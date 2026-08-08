import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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

async function main() {
  console.log('Iniciando seed...');

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

  // Criar leads diversificados
  const diagnosticMap = {
    STARTING_POINT: {
      title: 'Ponto de partida',
      message: 'Você está começando. Uma rotina estruturada faz a maior diferença agora.',
    },
    IN_CONSTRUCTION: {
      title: 'Em construção',
      message: 'Você já tem base, mas falta consistência para chegar na nota de corte.',
    },
    ON_RIGHT_TRACK: {
      title: 'Bom caminho',
      message: 'Sua preparação está sólida. O ganho agora vem de ajuste fino.',
    },
    FINAL_STRETCH: {
      title: 'Reta final',
      message: 'Você está muito bem posicionado. O foco é manter o ritmo e não perder pontos bobos.',
    },
  };

  const leads = [
    {
      name: 'Ana Carolina Silva',
      email: 'ana.silva@email.com',
      phone: '11987654321',
      score: 85,
      diagnosticSlug: 'FINAL_STRETCH',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
    },
    {
      name: 'Bruno Oliveira Santos',
      email: 'bruno.santos@email.com',
      phone: '21987654322',
      score: 72,
      diagnosticSlug: 'ON_RIGHT_TRACK',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
    },
    {
      name: 'Carla Mendes Ferreira',
      email: 'carla.ferreira@email.com',
      phone: '31987654323',
      score: 45,
      diagnosticSlug: 'IN_CONSTRUCTION',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
    },
    {
      name: 'Diego Costa Lima',
      email: 'diego.lima@email.com',
      phone: '41987654324',
      score: 22,
      diagnosticSlug: 'STARTING_POINT',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 dias atrás
    },
    {
      name: 'Eduarda Rodrigues Alves',
      email: 'eduarda.alves@email.com',
      phone: '51987654325',
      score: 92,
      diagnosticSlug: 'FINAL_STRETCH',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
    },
    {
      name: 'Felipe Souza Pereira',
      email: 'felipe.pereira@email.com',
      phone: '61987654326',
      score: 58,
      diagnosticSlug: 'ON_RIGHT_TRACK',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 dias atrás
    },
    {
      name: 'Gabriela Martins Rocha',
      email: 'gabriela.rocha@email.com',
      phone: '71987654327',
      score: 38,
      diagnosticSlug: 'IN_CONSTRUCTION',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
    },
    {
      name: 'Henrique Barbosa Nunes',
      email: 'henrique.nunes@email.com',
      phone: '81987654328',
      score: 15,
      diagnosticSlug: 'STARTING_POINT',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 dias atrás
    },
    {
      name: 'Isabela Carvalho Gomes',
      email: 'isabela.gomes@email.com',
      phone: '91987654329',
      score: 78,
      diagnosticSlug: 'ON_RIGHT_TRACK',
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 dias atrás
    },
    {
      name: 'João Pedro Almeida',
      email: 'joao.almeida@email.com',
      phone: '11987654330',
      score: 95,
      diagnosticSlug: 'FINAL_STRETCH',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 dias atrás
    },
    {
      name: 'Karen Fernandes Dias',
      email: 'karen.dias@email.com',
      phone: '21987654331',
      score: 52,
      diagnosticSlug: 'ON_RIGHT_TRACK',
      createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), // 11 dias atrás
    },
    {
      name: 'Lucas Ribeiro Cardoso',
      email: 'lucas.cardoso@email.com',
      phone: '31987654332',
      score: 28,
      diagnosticSlug: 'STARTING_POINT',
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 dias atrás
    },
    {
      name: 'Mariana Teixeira Correia',
      email: 'mariana.correia@email.com',
      phone: '41987654333',
      score: 68,
      diagnosticSlug: 'ON_RIGHT_TRACK',
      createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), // 13 dias atrás
    },
    {
      name: 'Nicolas Araújo Pinto',
      email: 'nicolas.pinto@email.com',
      phone: '51987654334',
      score: 42,
      diagnosticSlug: 'IN_CONSTRUCTION',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 dias atrás
    },
  ];

  for (const lead of leads) {
    const diagnostic = diagnosticMap[lead.diagnosticSlug as keyof typeof diagnosticMap];
    await prisma.lead.create({
      data: {
        ...lead,
        diagnosticTitle: diagnostic.title,
        diagnosticMessage: diagnostic.message,
      },
    });
  }
  console.log(`${leads.length} leads diversificados criados.`);

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
