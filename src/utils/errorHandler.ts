import { AxiosError } from 'axios';
import type { ErrorResponse } from '@/types';

/**
 * Axios 에러에서 백엔드 에러 응답 추출
 */
export function extractErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    const response = axiosError.response;

    if (response?.data) {
      return {
        status: response.status,
        message: response.data.message || response.data.message || '알 수 없는 오류가 발생했습니다.',
        errorCode: response.data.errorCode,
      };
    }

    // 네트워크 에러 등
    if (axiosError.message) {
      return {
        status: 0,
        message: '네트워크 오류가 발생했습니다. 연결을 확인해주세요.',
      };
    }
  }

  return {
    status: 500,
    message: '알 수 없는 오류가 발생했습니다.',
  };
}

/**
 * 에러 메시지를 사용자 친화적으로 변환
 */
export function getErrorMessage(error: unknown, defaultMessage: string = '오류가 발생했습니다.'): string {
  const errorResponse = extractErrorResponse(error);
  return errorResponse.message || defaultMessage;
}

/**
 * HTTP 상태 코드에 따른 기본 에러 메시지
 */
export function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return '잘못된 요청입니다.';
    case 401:
      return '인증이 필요합니다. 다시 로그인해주세요.';
    case 403:
      return '권한이 없습니다.';
    case 404:
      return '요청한 리소스를 찾을 수 없습니다.';
    case 409:
      return '이미 존재하는 데이터입니다.';
    case 500:
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    default:
      return '오류가 발생했습니다.';
  }
}

