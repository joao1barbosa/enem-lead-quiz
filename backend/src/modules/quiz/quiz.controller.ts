import { Controller, Get } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizResponseDto } from './dto/quiz-response.dto';

@Controller('api/quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('active')
  async getActiveQuiz(): Promise<{ quiz: QuizResponseDto }> {
    const quiz = await this.quizService.getActiveQuiz();
    return { quiz };
  }
}
