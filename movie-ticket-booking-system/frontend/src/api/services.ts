import api from './client';
import type {
  AuthResponse, Booking, BookingRequest, BookingStatus, DashboardStats, Movie, MovieRequest, MovieStatus,
  Page, Payment, PaymentRequest, PaymentStatus, PaymentStatusInfo, SeatAvailability, Show, ShowRequest,
  ShowStatus, SignInRequest, SignUpRequest, Theatre, TheatreRequest, TheatreStatus, User, UserUpdateRequest,
} from '../types';

/** Removes empty values so they are not sent as query parameters. */
function clean<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as Partial<T>;
}

// ---------------- Auth ----------------
export const authApi = {
  signUp: (body: SignUpRequest) => api.post<AuthResponse>('/auth/signup', body).then((r) => r.data),
  signIn: (body: SignInRequest) => api.post<AuthResponse>('/auth/signin', body).then((r) => r.data),
};

// ---------------- Users ----------------
export const userApi = {
  list: () => api.get<User[]>('/users').then((r) => r.data),
  get: (id: number) => api.get<User>(`/users/${id}`).then((r) => r.data),
  me: () => api.get<User>('/users/me').then((r) => r.data),
  update: (id: number, body: UserUpdateRequest) => api.put<User>(`/users/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete(`/users/${id}`),
};

// ---------------- Movies ----------------
export interface MovieQuery {
  title?: string;
  language?: string;
  genre?: string;
  status?: MovieStatus | '';
  page?: number;
  size?: number;
  sort?: string;
}

export const movieApi = {
  list: (q: MovieQuery = {}) => api.get<Page<Movie>>('/movies', { params: clean(q) }).then((r) => r.data),
  get: (id: number) => api.get<Movie>(`/movies/${id}`).then((r) => r.data),
  shows: (id: number, upcomingOnly = true) =>
    api.get<Page<Show>>(`/movies/${id}/shows`, { params: { upcomingOnly, size: 100 } }).then((r) => r.data),
  create: (body: MovieRequest) => api.post<Movie>('/movies', body).then((r) => r.data),
  update: (id: number, body: MovieRequest) => api.put<Movie>(`/movies/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete(`/movies/${id}`),
};

// ---------------- Theatres ----------------
export const theatreApi = {
  list: (status?: TheatreStatus) =>
    api.get<Theatre[]>('/theatres', { params: clean({ status }) }).then((r) => r.data),
  get: (id: number) => api.get<Theatre>(`/theatres/${id}`).then((r) => r.data),
  create: (body: TheatreRequest) => api.post<Theatre>('/theatres', body).then((r) => r.data),
  update: (id: number, body: TheatreRequest) => api.put<Theatre>(`/theatres/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete(`/theatres/${id}`),
};

// ---------------- Shows ----------------
export interface ShowQuery {
  movieId?: number | '';
  theatreId?: number | '';
  date?: string;
  status?: ShowStatus | '';
  upcomingOnly?: boolean;
  page?: number;
  size?: number;
}

export const showApi = {
  list: (q: ShowQuery = {}) => api.get<Page<Show>>('/shows', { params: clean(q) }).then((r) => r.data),
  get: (id: number) => api.get<Show>(`/shows/${id}`).then((r) => r.data),
  seats: (id: number) => api.get<SeatAvailability>(`/shows/${id}/seats`).then((r) => r.data),
  create: (body: ShowRequest) => api.post<Show>('/shows', body).then((r) => r.data),
  update: (id: number, body: ShowRequest) => api.put<Show>(`/shows/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete(`/shows/${id}`),
};

// ---------------- Bookings ----------------
export const bookingApi = {
  create: (body: BookingRequest) => api.post<Booking>('/bookings', body).then((r) => r.data),
  get: (id: number) => api.get<Booking>(`/bookings/${id}`).then((r) => r.data),
  mine: (page = 0, size = 10) =>
    api.get<Page<Booking>>('/bookings/my-bookings', { params: { page, size } }).then((r) => r.data),
  all: (status: BookingStatus | '' = '', page = 0, size = 10) =>
    api.get<Page<Booking>>('/bookings', { params: clean({ status, page, size }) }).then((r) => r.data),
  cancel: (id: number) => api.put<Booking>(`/bookings/${id}/cancel`).then((r) => r.data),
  updateStatus: (id: number, status: BookingStatus) =>
    api.put<Booking>(`/bookings/${id}/status`, { status }).then((r) => r.data),
};

// ---------------- Payments ----------------
export const paymentApi = {
  create: (body: PaymentRequest) => api.post<Payment>('/payments', body).then((r) => r.data),
  process: (id: number, simulateFailure = false) =>
    api.put<Payment>(`/payments/${id}/process`, { simulateFailure }).then((r) => r.data),
  get: (id: number) => api.get<Payment>(`/payments/${id}`).then((r) => r.data),
  status: (id: number) => api.get<PaymentStatusInfo>(`/payments/${id}/status`).then((r) => r.data),
  byBooking: (bookingId: number) => api.get<Payment>(`/payments/booking/${bookingId}`).then((r) => r.data),
  all: (status: PaymentStatus | '' = '', page = 0, size = 10) =>
    api.get<Page<Payment>>('/payments', { params: clean({ status, page, size }) }).then((r) => r.data),
  mine: (page = 0, size = 10) =>
    api.get<Page<Payment>>('/payments/my-payments', { params: { page, size } }).then((r) => r.data),
};

// ---------------- Admin ----------------
export const adminApi = {
  stats: () => api.get<DashboardStats>('/admin/stats').then((r) => r.data),
};
