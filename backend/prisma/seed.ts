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
    text: 'Em uma progressão aritmética, o primeiro termo é 5 e a razão é 3. Qual é o décimo termo dessa sequência?',
    alternatives: [
      { text: '32', score: 10 },
      { text: '35', score: 6 },
      { text: '29', score: 4 },
      { text: '38', score: 2 },
      { text: '27', score: 0 },
    ],
  },
  {
    order: 2,
    text: 'Leia o trecho: "A menina, olhando pela janela, via o vento brincar com as folhas." Qual é a função sintática da expressão "olhando pela janela"?',
    alternatives: [
      { text: 'Adjunto adverbial de lugar', score: 10 },
      { text: 'Oração subordinada adverbial temporal', score: 7 },
      { text: 'Complemento nominal', score: 3 },
      { text: 'Vocativo', score: 1 },
      { text: 'Sujeito simples', score: 0 },
    ],
  },
  {
    order: 3,
    text: 'A fotossíntese é um processo essencial para a vida na Terra. Qual é a principal finalidade desse processo para as plantas?',
    alternatives: [
      { text: 'Produzir glicose (energia) a partir de luz, água e gás carbônico', score: 10 },
      { text: 'Absorver nutrientes do solo através das raízes', score: 4 },
      { text: 'Realizar a respiração celular nas folhas', score: 3 },
      { text: 'Transportar seiva bruta para todas as partes da planta', score: 2 },
      { text: 'Eliminar o excesso de água pelas folhas', score: 0 },
    ],
  },
  {
    order: 4,
    text: 'Um corpo de massa 4 kg está sujeito a uma força resultante de 20 N. Qual é a aceleração adquirida pelo corpo?',
    alternatives: [
      { text: '5 m/s²', score: 10 },
      { text: '4 m/s²', score: 6 },
      { text: '20 m/s²', score: 3 },
      { text: '80 m/s²', score: 1 },
      { text: '0,2 m/s²', score: 0 },
    ],
  },
  {
    order: 5,
    text: 'A Revolução Industrial, iniciada na Inglaterra no século XVIII, teve como principal consequência inicial:',
    alternatives: [
      { text: 'A transformação do processo produtivo com o uso de máquinas e a consolidação do capitalismo industrial', score: 10 },
      { text: 'O fim imediato do trabalho assalariado em toda a Europa', score: 3 },
      { text: 'A queda da burguesia e o fortalecimento da nobreza feudal', score: 2 },
      { text: 'A abolição das colônias europeias na América', score: 1 },
      { text: 'O desenvolvimento exclusivo da agricultura de subsistência', score: 0 },
    ],
  },
  {
    order: 6,
    text: 'Qual fator natural explica a grande concentração de chuvas na região da Floresta Amazônica?',
    alternatives: [
      { text: 'A evapotranspiração intensa da própria floresta, que mantém o ciclo hidrológico local', score: 10 },
      { text: 'A proximidade com o deserto do Atacama', score: 2 },
      { text: 'A altitude elevada da Cordilheira dos Andes', score: 4 },
      { text: 'A ausência de rios na região', score: 0 },
      { text: 'As correntes marítimas frias do Atlântico Sul', score: 3 },
    ],
  },
  {
    order: 7,
    text: 'Em uma reação de neutralização, um ácido reage com uma base. Quais são os produtos formados nesse tipo de reação?',
    alternatives: [
      { text: 'Sal e água', score: 10 },
      { text: 'Ácido e base', score: 1 },
      { text: 'Óxido e gás carbônico', score: 3 },
      { text: 'Metal e hidrogênio', score: 2 },
      { text: 'Água e oxigênio', score: 0 },
    ],
  },
  {
    order: 8,
    text: 'O texto abaixo apresenta uma figura de linguagem: "Aquele homem é um touro." Qual figura de linguagem foi utilizada?',
    alternatives: [
      { text: 'Metáfora', score: 10 },
      { text: 'Hipérbole', score: 5 },
      { text: 'Ironia', score: 3 },
      { text: 'Eufemismo', score: 2 },
      { text: 'Pleonasmo', score: 0 },
    ],
  },
  {
    order: 9,
    text: 'Sobre a escravidão no Brasil colonial, é correto afirmar que:',
    alternatives: [
      { text: 'Ela foi a base da mão de obra na produção açucareira e mineradora, com forte resistência dos escravizados', score: 10 },
      { text: 'Ela foi extinta imediatamente após a chegada dos portugueses', score: 1 },
      { text: 'Ela utilizava apenas trabalhadores livres assalariados', score: 0 },
      { text: 'Ela ocorreu apenas na região Sul do país', score: 2 },
      { text: 'Ela impedia o tráfico negreiro desde o século XVI', score: 3 },
    ],
  },
  {
    order: 10,
    text: 'Uma função quadrática é dada por f(x) = x² - 4x + 3. Quais são as raízes dessa função?',
    alternatives: [
      { text: 'x = 1 e x = 3', score: 10 },
      { text: 'x = -1 e x = -3', score: 4 },
      { text: 'x = 4 e x = 3', score: 3 },
      { text: 'x = 0 e x = 3', score: 5 },
      { text: 'x = 1 e x = -4', score: 0 },
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
