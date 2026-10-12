package lk.ijse.movieticket.service;

import lk.ijse.movieticket.dto.request.PaymentProcessRequest;
import lk.ijse.movieticket.dto.request.PaymentRequest;
import lk.ijse.movieticket.dto.response.PageResponse;
import lk.ijse.movieticket.dto.response.PaymentResponse;
import lk.ijse.movieticket.dto.response.PaymentStatusResponse;
import lk.ijse.movieticket.enums.PaymentStatus;

public interface PaymentService {

    PaymentResponse createPayment(PaymentRequest request);

    PaymentResponse processPayment(Long paymentId, PaymentProcessRequest request);

    PaymentResponse getPaymentById(Long id);

    PaymentStatusResponse getPaymentStatus(Long id);

    PaymentResponse getPaymentByBookingId(Long bookingId);

    PageResponse<PaymentResponse> getAllPayments(PaymentStatus status, int page, int size);

    PageResponse<PaymentResponse> getMyPayments(int page, int size);
}
