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

  // Limpar leads existentes
  await prisma.lead.deleteMany();
  console.log('Leads antigos removidos.');

  // Criar leads diversificados
  const diagnosticMap = {
    STARTING_POINT: {
      title: 'Ponto de Partida',
      message: 'Você está começando. Uma rotina estruturada faz a maior diferença agora.',
    },
    IN_CONSTRUCTION: {
      title: 'Em Construção',
      message: 'Você já tem base, mas falta consistência para chegar na nota de corte.',
    },
    ON_RIGHT_TRACK: {
      title: 'Bom Caminho',
      message: 'Sua preparação está sólida. O ganho agora vem de ajuste fino.',
    },
    FINAL_STRETCH: {
      title: 'Reta Final',
      message: 'Você está muito bem posicionado. O foco é manter o ritmo e não perder pontos bobos.',
    },
  };

  // Datas verdadeiramente aleatórias dentro das últimas 2 semanas (0-14 dias),
  // sem distribuição uniforme entre os dias.
  const randomDate = () =>
    new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000);

  const leads = [
    // STARTING_POINT (0-30) - 8 leads
    {
      name: 'Ana Beatriz Souza Lima',
      email: 'ana.souza@gmail.com',
      phone: '11912345678',
      score: 12,
      diagnosticSlug: 'STARTING_POINT',
      createdAt: randomDate(),
    },
    {
      name: 'Carlos Eduardo Martins',
      email: 'carlos.martins@hotmail.com',
      phone: '21923456789',
      score: 18,
      diagnosticSlug: 'STARTING_POINT',
      createdAt: randomDate(),
    },
    {
      name: 'Fernanda Oliveira Ribeiro',
      email: 'fernanda.ribeiro@outlook.com',
      phone: '31934567890',
      score: 24,
      diagnosticSlug: 'STARTING_POINT',
      createdAt: randomDate(),
    },
    {
      name: 'Gabriel Santos Ferreira',
      email: 'gabriel.ferreira@uol.com.br',
      phone: '41945678901',
      score: 7,
      diagnosticSlug: 'STARTING_POINT',
      createdAt: randomDate(),
    },
    {
      name: 'Juliana Costa Barbosa',
      email: 'juliana.barbosa@yahoo.com',
      phone: '51956789012',
      score: 27,
      diagnosticSlug: 'STARTING_POINT',
      createdAt: randomDate(),
    },
    {
      name: 'Rafael Almeida Nogueira',
      email: 'rafael.nogueira@icloud.com',
      phone: '61967890123',
      score: 15,
      diagnosticSlug: 'STARTING_POINT',
      createdAt: randomDate(),
    },
    {
      name: 'Larissa Pereira Monteiro',
      email: 'larissa.monteiro@bol.com.br',
      phone: '71978901234',
      score: 5,
      diagnosticSlug: 'STARTING_POINT',
      createdAt: randomDate(),
    },
    {
      name: 'Thiago Rodrigues Carvalho',
      email: 'thiago.carvalho@terra.com.br',
      phone: '81989012345',
      score: 21,
      diagnosticSlug: 'STARTING_POINT',
      createdAt: randomDate(),
    },

    // IN_CONSTRUCTION (31-55) - 9 leads
    {
      name: 'Camila Fernandes Azevedo',
      email: 'camila.azevedo@gmail.com',
      phone: '91901234567',
      score: 33,
      diagnosticSlug: 'IN_CONSTRUCTION',
      createdAt: randomDate(),
    },
    {
      name: 'Matheus Araújo Castro',
      email: 'matheus.castro@hotmail.com',
      phone: '11913579246',
      score: 38,
      diagnosticSlug: 'IN_CONSTRUCTION',
      createdAt: randomDate(),
    },
    {
      name: 'Bianca Gomes Teixeira',
      email: 'bianca.teixeira@outlook.com',
      phone: '21924681357',
      score: 42,
      diagnosticSlug: 'IN_CONSTRUCTION',
      createdAt: randomDate(),
    },
    {
      name: 'Vinícius Moraes Rocha',
      email: 'vinicius.rocha@yahoo.com',
      phone: '31935792468',
      score: 47,
      diagnosticSlug: 'IN_CONSTRUCTION',
      createdAt: randomDate(),
    },
    {
      name: 'Patrícia Cardoso Farias',
      email: 'patricia.farias@uol.com.br',
      phone: '41946813579',
      score: 35,
      diagnosticSlug: 'IN_CONSTRUCTION',
      createdAt: randomDate(),
    },
    {
      name: 'Leonardo Pinto Vasconcelos',
      email: 'leonardo.vasconcelos@icloud.com',
      phone: '51957924680',
      score: 52,
      diagnosticSlug: 'IN_CONSTRUCTION',
      createdAt: randomDate(),
    },
    {
      name: 'Aline Rocha Mendonça',
      email: 'aline.mendonca@bol.com.br',
      phone: '61968035791',
      score: 44,
      diagnosticSlug: 'IN_CONSTRUCTION',
      createdAt: randomDate(),
    },
    {
      name: 'Gustavo Nunes Prado',
      email: 'gustavo.prado@terra.com.br',
      phone: '71979146802',
      score: 39,
      diagnosticSlug: 'IN_CONSTRUCTION',
      createdAt: randomDate(),
    },
    {
      name: 'Sabrina Melo Cunha',
      email: 'sabrina.cunha@gmail.com',
      phone: '81980257913',
      score: 31,
      diagnosticSlug: 'IN_CONSTRUCTION',
      createdAt: randomDate(),
    },

    // ON_RIGHT_TRACK (56-80) - 9 leads
    {
      name: 'Diego Barbosa Sales',
      email: 'diego.sales@hotmail.com',
      phone: '91991368024',
      score: 58,
      diagnosticSlug: 'ON_RIGHT_TRACK',
      createdAt: randomDate(),
    },
    {
      name: 'Isabela Campos Duarte',
      email: 'isabela.duarte@outlook.com',
      phone: '11902479135',
      score: 63,
      diagnosticSlug: 'ON_RIGHT_TRACK',
      createdAt: randomDate(),
    },
    {
      name: 'Felipe Moreira Santana',
      email: 'felipe.santana@yahoo.com',
      phone: '21913580246',
      score: 67,
      diagnosticSlug: 'ON_RIGHT_TRACK',
      createdAt: randomDate(),
    },
    {
      name: 'Letícia Freitas Barros',
      email: 'leticia.barros@uol.com.br',
      phone: '31924691357',
      score: 72,
      diagnosticSlug: 'ON_RIGHT_TRACK',
      createdAt: randomDate(),
    },
    {
      name: 'André Cavalcanti Gomes',
      email: 'andre.gomes@icloud.com',
      phone: '41935702468',
      score: 76,
      diagnosticSlug: 'ON_RIGHT_TRACK',
      createdAt: randomDate(),
    },
    {
      name: 'Marina Dias Peixoto',
      email: 'marina.peixoto@bol.com.br',
      phone: '51946813579',
      score: 60,
      diagnosticSlug: 'ON_RIGHT_TRACK',
      createdAt: randomDate(),
    },
    {
      name: 'Rodrigo Fonseca Andrade',
      email: 'rodrigo.andrade@terra.com.br',
      phone: '61957924680',
      score: 69,
      diagnosticSlug: 'ON_RIGHT_TRACK',
      createdAt: randomDate(),
    },
    {
      name: 'Vanessa Lima Quintana',
      email: 'vanessa.quintana@gmail.com',
      phone: '71968035791',
      score: 74,
      diagnosticSlug: 'ON_RIGHT_TRACK',
      createdAt: randomDate(),
    },
    {
      name: 'Bruno Tavares Neves',
      email: 'bruno.neves@hotmail.com',
      phone: '81979146802',
      score: 57,
      diagnosticSlug: 'ON_RIGHT_TRACK',
      createdAt: randomDate(),
    },

    // FINAL_STRETCH (81-100) - 8 leads
    {
      name: 'Marcela Viana Coutinho',
      email: 'marcela.coutinho@outlook.com',
      phone: '91980257913',
      score: 82,
      diagnosticSlug: 'FINAL_STRETCH',
      createdAt: randomDate(),
    },
    {
      name: 'Pedro Henrique Batista',
      email: 'pedro.batista@yahoo.com',
      phone: '11991368024',
      score: 87,
      diagnosticSlug: 'FINAL_STRETCH',
      createdAt: randomDate(),
    },
    {
      name: 'Natália Aguiar Fontes',
      email: 'natalia.fontes@uol.com.br',
      phone: '21902479135',
      score: 91,
      diagnosticSlug: 'FINAL_STRETCH',
      createdAt: randomDate(),
    },
    {
      name: 'João Vitor Ramos Silveira',
      email: 'joaovitor.silveira@icloud.com',
      phone: '31913580246',
      score: 95,
      diagnosticSlug: 'FINAL_STRETCH',
      createdAt: randomDate(),
    },
    {
      name: 'Renata Barbosa Lopes',
      email: 'renata.lopes@bol.com.br',
      phone: '41924691357',
      score: 84,
      diagnosticSlug: 'FINAL_STRETCH',
      createdAt: randomDate(),
    },
    {
      name: 'Eduardo Correia Muniz',
      email: 'eduardo.muniz@terra.com.br',
      phone: '51935702468',
      score: 89,
      diagnosticSlug: 'FINAL_STRETCH',
      createdAt: randomDate(),
    },
    {
      name: 'Beatriz Gonçalves Ferraz',
      email: 'beatriz.ferraz@gmail.com',
      phone: '61946813579',
      score: 98,
      diagnosticSlug: 'FINAL_STRETCH',
      createdAt: randomDate(),
    },
    {
      name: 'Otávio Siqueira Brandão',
      email: 'otavio.brandao@hotmail.com',
      phone: '71957924680',
      score: 83,
      diagnosticSlug: 'FINAL_STRETCH',
      createdAt: randomDate(),
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
