import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { status: string; service: string; timestamp: string } {
    return {
      status: 'ok',
      service: 'enem-lead-quiz-api',
      timestamp: new Date().toISOString(),
    };
  }
}
