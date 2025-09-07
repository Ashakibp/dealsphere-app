import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function successResponse<T>(data: T, message?: string, status = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      message
    } as ApiResponse<T>,
    { status }
  );
}

export function errorResponse(error: string | Error, status = 400): NextResponse {
  const errorMessage = error instanceof Error ? error.message : error;
  
  return NextResponse.json(
    {
      success: false,
      error: errorMessage
    } as ApiResponse,
    { status }
  );
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message?: string
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      message
    },
    { status: 200 }
  );
}

export function validationErrorResponse(errors: Record<string, string[]>): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      validationErrors: errors
    },
    { status: 422 }
  );
}