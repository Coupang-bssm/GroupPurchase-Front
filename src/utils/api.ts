import axios, { AxiosInstance, AxiosError } from 'axios';
import { extractErrorResponse } from './errorHandler';
import type {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  MeResponse,
  LogoutResponse,
  Product,
  CreateProductRequest,
  CreateProductResponse,
  DeleteProductResponse,
  GroupPurchase,
  CreateGroupPurchaseRequest,
  CreateGroupPurchaseResponse,
  UpdateGroupPurchaseRequest,
  GroupPurchaseListResponse,
  JoinGroupPurchaseResponse,
  ApproveJoinResponse,
  DeleteGroupPurchaseResponse,
  Comment,
  CreateCommentRequest,
  CreateCommentResponse,
  UpdateCommentRequest,
  DeleteCommentResponse,
} from '@/types';

// API 기본 URL (환경 변수로 관리 가능)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://grouppurchase-back.onrender.com';

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const errorResponse = extractErrorResponse(error);

    // 401 에러: 인증 실패 시 로그아웃 처리
    if (errorResponse.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 404 에러: 리소스를 찾을 수 없음
    if (errorResponse.status === 404) {
      // 특정 페이지에서는 에러를 그대로 전달하여 각 페이지에서 처리
      return Promise.reject(error);
    }

    // 기타 에러는 그대로 전달
    return Promise.reject(error);
  }
);

// 인증 API
export const authAPI = {
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const response = await apiClient.post<SignupResponse>('/api/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', data);
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  },

  me: async (): Promise<MeResponse> => {
    const response = await apiClient.get<MeResponse>('/api/auth/me');
    return response.data;
  },

  logout: async (): Promise<LogoutResponse> => {
    const response = await apiClient.post<LogoutResponse>('/api/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return response.data;
  },
};

// 상품 API
export const productAPI = {
  create: async (data: CreateProductRequest): Promise<CreateProductResponse> => {
    const response = await apiClient.post<CreateProductResponse>('/api/products', data);
    return response.data;
  },

  getList: async (lastId?: number, size: number = 10): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (lastId !== undefined) {
      params.append('lastId', lastId.toString());
    }
    params.append('size', size.toString());
    const response = await apiClient.get<Product[]>(`/api/products?${params.toString()}`);
    return response.data;
  },

  getById: async (productId: number): Promise<Product> => {
    const response = await apiClient.get<Product>(`/api/products/${productId}`);
    return response.data;
  },

  delete: async (productId: number): Promise<DeleteProductResponse> => {
    const response = await apiClient.delete<DeleteProductResponse>(`/api/products/${productId}`);
    return response.data;
  },
};

// 공동구매 API
export const groupPurchaseAPI = {
  create: async (data: CreateGroupPurchaseRequest): Promise<CreateGroupPurchaseResponse> => {
    const response = await apiClient.post<CreateGroupPurchaseResponse>('/api/group-purchase', data);
    return response.data;
  },

  getList: async (page: number = 0, size: number = 10): Promise<GroupPurchaseListResponse> => {
    const response = await apiClient.get<GroupPurchaseListResponse>(
      `/api/group-purchase?page=${page}&size=${size}`
    );
    return response.data;
  },

  getById: async (gpId: number): Promise<GroupPurchase> => {
    const response = await apiClient.get<GroupPurchase>(`/api/group-purchase/${gpId}`);
    return response.data;
  },

  createInviteLink: async (gpId: number): Promise<string> => {
    const response = await apiClient.post<string>(`/api/group-purchase/${gpId}/invite-link`);
    return response.data;
  },

  join: async (gpId: number): Promise<JoinGroupPurchaseResponse> => {
    const response = await apiClient.post<JoinGroupPurchaseResponse>(
      `/api/group-purchase/${gpId}/join`
    );
    return response.data;
  },

  approveJoin: async (joinId: number): Promise<ApproveJoinResponse> => {
    const response = await apiClient.patch<ApproveJoinResponse>(
      `/api/group-purchase/join/${joinId}/approve`
    );
    return response.data;
  },

  update: async (gpId: number, data: UpdateGroupPurchaseRequest): Promise<void> => {
    const response = await apiClient.put(`/api/group-purchase/${gpId}`, data);
    return response.data;
  },

  delete: async (gpId: number): Promise<DeleteGroupPurchaseResponse> => {
    const response = await apiClient.delete<DeleteGroupPurchaseResponse>(
      `/api/group-purchase/${gpId}`
    );
    return response.data;
  },
};

// 댓글 API
export const commentAPI = {
  create: async (gpId: number, data: CreateCommentRequest): Promise<CreateCommentResponse> => {
    const response = await apiClient.post<CreateCommentResponse>(`/api/comments/${gpId}`, data);
    return response.data;
  },

  getList: async (groupPurchaseId: number): Promise<Comment[]> => {
    const response = await apiClient.get<Comment[]>(
      `/api/comments?groupPurchaseId=${groupPurchaseId}`
    );
    return response.data;
  },

  getById: async (commentId: number): Promise<Comment> => {
    const response = await apiClient.get<Comment>(`/api/comments/${commentId}`);
    return response.data;
  },

  update: async (commentId: number, data: UpdateCommentRequest): Promise<void> => {
    await apiClient.put(`/api/comments/${commentId}`, data);
  },

  delete: async (commentId: number): Promise<DeleteCommentResponse> => {
    const response = await apiClient.delete<DeleteCommentResponse>(`/api/comments/${commentId}`);
    return response.data;
  },
};

