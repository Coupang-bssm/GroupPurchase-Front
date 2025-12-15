// 인증 관련 타입
export interface SignupRequest {
  username: string;
  password: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface SignupResponse {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  tokenType: string;
  accessToken: string;
  refreshToken: string;
}

export interface MeResponse {
  id: number;
  username: string;
  email: string;
}

export interface LogoutResponse {
  message: string;
}

// 상품 관련 타입
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface CreateProductResponse {
  message: string;
}

export interface DeleteProductResponse {
  productId: number;
  message: string;
}

// 공동구매 관련 타입
export interface GroupPurchase {
  id: number;
  productId: number;
  hostUserId: number;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  deadline: string;
  status: 'OPEN' | 'CLOSED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupPurchaseRequest {
  productId: number;
  title: string;
  description: string;
  targetCount: number;
  deadline: string;
}

export interface CreateGroupPurchaseResponse {
  message: string;
}

export interface UpdateGroupPurchaseRequest {
  title?: string;
  description?: string;
  targetCount?: number;
  deadline?: string;
  status?: 'OPEN' | 'CLOSED' | 'COMPLETED';
}

export interface GroupPurchaseListResponse {
  content: GroupPurchase[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      unsorted: boolean;
      sorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  numberOfElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}

export interface JoinGroupPurchaseResponse {
  'group-purchase-id': number;
  joinId: number;
  message: string;
}

export interface ApproveJoinResponse {
  joinId: number;
  message: string;
}

export interface DeleteGroupPurchaseResponse {
  'group-purchase-id': number;
  message: string;
}

// 댓글 관련 타입
export interface Comment {
  id: number;
  content: string;
  userId: number;
  parentId: number | null;
  createdAt: string;
  children: Comment[];
}

export interface CreateCommentRequest {
  content: string;
  parentId?: number | null;
}

export interface CreateCommentResponse {
  message: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface DeleteCommentResponse {
  message: string;
  commentId: number;
}

// JWT 토큰 페이로드 타입
export interface JwtPayload {
  sub: string;
  role: 'ADMIN' | 'USER';
  iat: number;
  exp: number;
}

