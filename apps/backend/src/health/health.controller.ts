import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { HealthResponse } from '@wordforge/shared-types';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Check API and Database status' })
  @ApiResponse({ status: 200, description: 'Health check response' })
  async check(): Promise<HealthResponse> {
    const isDbConnected = this.dataSource.isInitialized;
    return {
      status: 'ok',
      database: isDbConnected ? 'connected' : 'disconnected',
    };
  }
}
