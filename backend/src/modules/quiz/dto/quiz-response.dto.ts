export class AlternativeResponseDto {
  id: string;
  text: string;
}

export class QuestionResponseDto {
  id: string;
  order: number;
  text: string;
  alternatives: AlternativeResponseDto[];
}

export class QuizResponseDto {
  id: string;
  questions: QuestionResponseDto[];
}
