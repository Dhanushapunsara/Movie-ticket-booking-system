// Types mirror the backend DTOs.

export type Role = 'ADMIN' | 'CUSTOMER';
export type MovieStatus = 'UPCOMING' | 'NOW_SHOWING' | 'ENDED';
export type TheatreStatus = 'ACTIVE' | 'INACTIVE';
export type ShowStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'ONLINE_BANKING' | 'CASH';

export const MOVIE_STATUSES: MovieStatus[] = ['UPCOMING', 'NOW_SHOWING', 'ENDED'];
export const THEATRE_STATUSES: TheatreStatus[] = ['ACTIVE', 'INACTIVE'];
export const SHOW_STATUSES: ShowStatus[] = ['SCHEDULED', 'COMPLETED', 'CANCELLED'];
export const BOOKING_STATUSES: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED'];
export const PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
export const PAYMENT_METHODS: PaymentMethod[] = ['CREDIT_CARD', 'DEBIT_CARD', 'ONLINE_BANKING', 'CASH'];

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: Role;
  createdAt: string | null;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresAt: string;
  user: User;
}

export interface Movie {
  id: number;
  title: string;
  description: string | null;
  durationMinutes: number;
  language: string;
  genre: string;
  releaseDate: string | null;
  posterUrl: string | null;
  status: MovieStatus;
}

export interface Theatre {
  id: number;
  name: string;
  location: string;
  capacity: number;
  status: TheatreStatus;
}

export interface Show {
  id: number;
  movieId: number;
  movieTitle: string;
  moviePosterUrl: string | null;
  movieDurationMinutes: number;
  movieLanguage: string;
  movieGenre: string;
  theatreId: number;
  theatreName: string;
  theatreLocation: string;
  capacity: number;
  showDate: string;
  showTime: string;
  endTime: string;
  ticketPrice: number;
  status: ShowStatus;
  bookedSeats: number;
  availableSeats: number;
  bookable: boolean;
}

export interface SeatRow {
  row: string;
  seats: string[];
}

export interface SeatAvailability {
  showId: number;
  capacity: number;
  seatsPerRow: number;
  rows: SeatRow[];
  bookedSeats: string[];
  availableSeats: number;
  ticketPrice: number;
  bookable: boolean;
}

export interface Booking {
  id: number;
  userId: number;
  customerName: string;
  customerEmail: string;
  showId: number;
  movieId: number;
  movieTitle: string;
  moviePosterUrl: string | null;
  theatreName: string;
  theatreLocation: string;
  showDate: string;
  showTime: string;
  ticketPrice: number;
  seatNumbers: string[];
  numberOfTickets: number;
  totalAmount: number;
  bookingDate: string;
  status: BookingStatus;
  paymentId: number | null;
  paymentStatus: PaymentStatus | null;
  cancellable: boolean;
  payable: boolean;
}

export interface Payment {
  id: number;
  bookingId: number;
  bookingStatus: BookingStatus;
  userId: number;
  customerName: string;
  movieTitle: string;
  seatNumbers: string[];
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paymentDate: string | null;
  transactionReference: string | null;
  createdAt: string;
}

export interface PaymentStatusInfo {
  paymentId: number;
  bookingId: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  totalCustomers: number;
  totalMovies: number;
  nowShowingMovies: number;
  totalTheatres: number;
  totalShows: number;
  scheduledShows: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedPayments: number;
  totalRevenue: number;
}

export interface ApiError {
  timestamp?: string;
  status: number;
  error?: string;
  message: string;
  path?: string;
  validationErrors?: Record<string, string>;
}

// ---- Request bodies ----

export interface SignUpRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface UserUpdateRequest {
  fullName: string;
  phone?: string;
  role?: Role;
  password?: string;
}

export interface MovieRequest {
  title: string;
  description?: string;
  durationMinutes: number;
  language: string;
  genre: string;
  releaseDate?: string | null;
  posterUrl?: string;
  status: MovieStatus;
}

export interface TheatreRequest {
  name: string;
  location: string;
  capacity: number;
  status: TheatreStatus;
}

export interface ShowRequest {
  movieId: number;
  theatreId: number;
  showDate: string;
  showTime: string;
  ticketPrice: number;
  status?: ShowStatus;
}

export interface BookingRequest {
  showId: number;
  seatNumbers: string[];
  numberOfTickets: number;
}

export interface PaymentRequest {
  bookingId: number;
  paymentMethod: PaymentMethod;
}
