'use client';

import { use, useState, useEffect } from 'react';
import { useEventBySlug } from '@/hooks/useEvents';
import { useCreateOrder } from '@/hooks/useOrders';
import PublicLayout from '@/components/layouts/PublicLayout';
import { useRouter } from 'next/navigation';
import { CheckoutState, TicketCategory, AttendeeData, CreateOrderRequest, OrderItem, AttendeeDetail } from '@/types';
import { Check, ChevronLeft, ChevronRight, User, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { useCheckoutStore } from '@/store/checkout.store';
import { Button } from '@/components/ui/button';

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: event, isLoading } = useEventBySlug(slug);
  const createOrderMutation = useCreateOrder(slug);

  const {
    checkoutSession,
    currentStep,
    paymentUrl,
    setStep,
    setPaymentUrl,
    setCheckoutSession,
    updateAttendees,
    updateBuyer,
    clearCheckoutSession,
    reset,
    timeLeft,
    timerActive,
    startTimer,
    decrementTimer,
    stopTimer,
  } = useCheckoutStore();

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived data from store
  const buyer = checkoutSession?.buyer || { name: '', email: '', phone: '' };
  const attendees = checkoutSession?.attendees || [];

  useEffect(() => {
    // Check if we have a valid checkout session for this event
    if (checkoutSession && checkoutSession.eventSlug !== slug) {
      // Clear session if it's for a different event
      clearCheckoutSession();
    } else if (!checkoutSession && currentStep !== 3) {
      // No checkout session and not in payment step, redirect back to event page
      router.push(`/events/${slug}`);
    } else if (checkoutSession && attendees.length === 0 && event?.ticketCategories) {
      // Initialize attendees based on selected tickets if not already initialized
      const initialAttendees: AttendeeData[] = [];
      Object.entries(checkoutSession.selectedTickets).forEach(([categoryId, quantity]) => {
        const category = event.ticketCategories?.find((t: TicketCategory) => t.id === categoryId);
        if (category) {
          for (let i = 0; i < (quantity as number); i++) {
            initialAttendees.push({
              name: '',
              email: '',
              phone: '',
              ticketCategoryId: categoryId,
            });
          }
        }
      });
      if (initialAttendees.length > 0) {
        updateAttendees(initialAttendees);
      }
    }

    // Handle restored state after app restart
    if (checkoutSession && currentStep === 3 && paymentUrl && !timerActive) {
      // If we're in payment step with restored state, check if time is still valid
      if (timeLeft > 300) {
        // More than 5 minutes left, allow manual continuation
        console.log('Payment timer restored after app restart - time remaining:', timeLeft);
      } else if (timeLeft > 0) {
        // Less than 5 minutes but still time left, auto-start timer for urgency
        console.log('Payment time running low, auto-starting timer');
        startTimer(timeLeft);
      } else {
        // Time completely expired during restart, clear session
        console.log('Payment time expired during app restart, clearing session');
        clearCheckoutSession();
        router.push(`/events/${slug}`);
      }
    }
  }, [checkoutSession, slug, clearCheckoutSession, router, attendees.length, event?.ticketCategories, updateAttendees, currentStep, paymentUrl, timerActive, timeLeft, startTimer]);

  // Countdown timer for step 3 (moved to global store level)

  // Handle timer expiration
  useEffect(() => {

    if (currentStep === 3 && timeLeft === 0 && timerActive) {
      // Time expired, stop timer and show message
      stopTimer();
      toast.error('Waktu pembayaran telah habis. Silakan buat pesanan baru.');

      const redirectTimer = setTimeout(() => {
        clearCheckoutSession();
        router.push(`/events/${slug}`);
      }, 3000);
      return () => clearTimeout(redirectTimer);
    }
  }, [currentStep, timeLeft, timerActive, stopTimer, clearCheckoutSession, router, slug]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalPrice = () => {
    if (!event?.ticketCategories || !checkoutSession) return 0;
    return Object.entries(checkoutSession.selectedTickets).reduce((total, [categoryId, quantity]) => {
      const category = event.ticketCategories?.find((t: TicketCategory) => t.id === categoryId);
      return total + (category ? category.price * quantity : 0);
    }, 0);
  };

  const getTotalTickets = () => {
    if (!checkoutSession) return 0;
    return Object.values(checkoutSession.selectedTickets).reduce((total, qty) => total + qty, 0);
  };

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};

    attendees.forEach((attendee, index) => {
      if (!attendee.name.trim()) {
        newErrors[`attendee_${index}_name`] = 'Nama wajib diisi';
      }
      if (!attendee.email.trim()) {
        newErrors[`attendee_${index}_email`] = 'Email wajib diisi';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendee.email)) {
        newErrors[`attendee_${index}_email`] = 'Email tidak valid';
      }
      if (!attendee.phone.trim()) {
        newErrors[`attendee_${index}_phone`] = 'No. HP wajib diisi';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!buyer.name.trim()) {
      newErrors.buyer_name = 'Nama pembeli wajib diisi';
    }
    if (!buyer.email.trim()) {
      newErrors.buyer_email = 'Email pembeli wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email)) {
      newErrors.buyer_email = 'Email tidak valid';
    }
    if (!buyer.phone.trim()) {
      newErrors.buyer_phone = 'No. HP pembeli wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (validateStep1() && validateStep2()) {
        setStep(2);
      }
    } else if (currentStep === 2) {
      // Create order and proceed to step 3
      await handleSubmitOrder();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleSubmitOrder = async () => {
    if (!event || !checkoutSession || isSubmitting) return;

    setIsSubmitting(true);



    try {
      // Group attendees by category
      const itemsMap = new Map<string, AttendeeDetail[]>();

      attendees.forEach((attendee) => {
        const categoryId = attendee.ticketCategoryId;
        if (!itemsMap.has(categoryId)) {
          itemsMap.set(categoryId, []);
        }

        itemsMap.get(categoryId)!.push({
          fullName: attendee.name,
          email: attendee.email,
          phoneNumber: attendee.phone,
          identityType: attendee.identityType,
          identityNumber: attendee.identityNumber,
        });
      });

      // Prepare order items with attendee details
      const items: OrderItem[] = Array.from(itemsMap.entries()).map(
        ([categoryId, detailAtendee]) => ({
          categoryId,
          quantity: detailAtendee.length,
          detailAtendee,
        })
      );

      // Prepare order data
      const orderData: CreateOrderRequest = {
        buyerFullName: buyer.name,
        buyerEmail: buyer.email,
        buyerPhoneNumber: buyer.phone,
        buyerIdentityType: undefined, // Optional, bisa ditambahkan field di form
        buyerIdentityNumber: undefined, // Optional, bisa ditambahkan field di form
        items,
      };

      // Submit order
      const response = await createOrderMutation.mutateAsync(orderData);

      // Clear checkout data
      // clearCheckoutSession();

      const totalPrice = getTotalPrice();

      if (totalPrice === 0) {
        router.push("/payment/success")
        clearCheckoutSession()
        return;
      }

      console.log(response);



      // Set payment URL and proceed to step 3
      setPaymentUrl(response.data.paymentUrl);
      setStep(3);

      // Start payment timer (60 minutes = 3600 seconds)
      startTimer(60 * 60);

      // Redirect to order success page or events list
      // router.push('/events');
    } catch (error: any) {
      console.error('Failed to create order:', error);
      toast.error(error.message || 'Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || (!checkoutSession && currentStep !== 3) || !event) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat checkout...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const steps = [
    { number: 1, title: 'Data Pembeli & Peserta', icon: User },
    { number: 2, title: 'Konfirmasi Pesanan', icon: Check },
    { number: 3, title: 'Pembayaran', icon: CreditCard },
  ];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          {/* Progress Steps */}
          <div className="mb-12">
            {/* Mobile Current Step Label */}
            <div className="block sm:hidden text-center mb-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Langkah {currentStep} dari {steps.length}
              </span>
              <h2 className="mt-3 text-xl font-bold text-gray-900">
                {steps[currentStep - 1].title}
              </h2>
            </div>

            <div className="relative max-w-4xl mx-auto px-4">
              {/* Background connecting line */}
              <div className="absolute top-1/2 left-4 right-4 h-1.5 bg-gray-100 -translate-y-1/2 rounded-full -z-10">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out rounded-full"
                  style={{
                    width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {/* Steps */}
              <div className="flex w-full justify-between">
                {steps.map((step) => {
                  const isActive = currentStep === step.number;
                  const isCompleted = currentStep > step.number;

                  return (
                    <div key={step.number} className="flex flex-col items-center group">
                      {/* Step Circle */}
                      <div
                        className={`
                          relative flex items-center justify-center transition-all duration-500 ease-out
                          w-10 h-10 sm:w-14 sm:h-14 rounded-full border-4 border-white
                          ${isActive
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 scale-110 ring-4 ring-blue-50'
                            : isCompleted
                              ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                              : 'bg-gray-100 text-gray-400'
                          }
                        `}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
                        ) : (
                          <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}

                        {/* Active Indicator Dot (Mobile) */}
                        {isActive && (
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full sm:hidden" />
                        )}
                      </div>

                      {/* Step Title (Desktop) */}
                      <span
                        className={`
                          hidden sm:block mt-4 text-sm font-medium transition-all duration-300 text-center px-2
                          ${isActive
                            ? 'text-blue-700 font-bold translate-y-0 opacity-100'
                            : isCompleted
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }
                        `}
                      >
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                {/* Step 1: Attendee & Buyer Data */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Data Pembeli & Peserta
                    </h2>
                    <p className="text-gray-600 mb-8">
                      Lengkapi data pembeli dan semua peserta yang akan menghadiri event
                    </p>

                    <div className="space-y-8">
                      {/* Buyer Data Section */}
                      <div className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Data Pembeli
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          Tiket dan invoice akan dikirim ke email pembeli
                        </p>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nama Lengkap *
                            </label>
                            <input
                              type="text"
                              value={buyer.name}
                              onChange={(e) => updateBuyer({ ...buyer, name: e.target.value })}
                              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.buyer_name ? 'border-red-500' : 'border-gray-300'
                                }`}
                              placeholder="Masukkan nama lengkap"
                            />
                            {errors.buyer_name && (
                              <p className="text-red-500 text-sm mt-1">{errors.buyer_name}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email *
                            </label>
                            <input
                              type="email"
                              value={buyer.email}
                              onChange={(e) => updateBuyer({ ...buyer, email: e.target.value })}
                              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.buyer_email ? 'border-red-500' : 'border-gray-300'
                                }`}
                              placeholder="email@example.com"
                            />
                            {errors.buyer_email && (
                              <p className="text-red-500 text-sm mt-1">{errors.buyer_email}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              No. HP *
                            </label>
                            <input
                              type="tel"
                              value={buyer.phone}
                              onChange={(e) => updateBuyer({ ...buyer, phone: e.target.value })}
                              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.buyer_phone ? 'border-red-500' : 'border-gray-300'
                                }`}
                              placeholder="08xxxxxxxxxx"
                            />
                            {errors.buyer_phone && (
                              <p className="text-red-500 text-sm mt-1">{errors.buyer_phone}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Attendee Data Section */}
                      <div className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Data Peserta ({getTotalTickets()} peserta)
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          Isi data untuk semua peserta yang akan menghadiri event
                        </p>

                        <div className="space-y-6">
                          {attendees.map((attendee, index) => {
                            const category = event.ticketCategories?.find(
                              (t: TicketCategory) => t.id === attendee.ticketCategoryId
                            );

                            return (
                              <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-4">
                                  Peserta {index + 1} - {category?.name}
                                </h4>

                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Nama Lengkap *
                                    </label>
                                    <input
                                      type="text"
                                      value={attendee.name}
                                      onChange={(e) => {
                                        const newAttendees = [...attendees];
                                        newAttendees[index].name = e.target.value;
                                        updateAttendees(newAttendees);
                                      }}
                                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`attendee_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                      placeholder="Masukkan nama lengkap"
                                    />
                                    {errors[`attendee_${index}_name`] && (
                                      <p className="text-red-500 text-sm mt-1">
                                        {errors[`attendee_${index}_name`]}
                                      </p>
                                    )}
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Email *
                                    </label>
                                    <input
                                      type="email"
                                      value={attendee.email}
                                      onChange={(e) => {
                                        const newAttendees = [...attendees];
                                        newAttendees[index].email = e.target.value;
                                        updateAttendees(newAttendees);
                                      }}
                                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`attendee_${index}_email`] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                      placeholder="email@example.com"
                                    />
                                    {errors[`attendee_${index}_email`] && (
                                      <p className="text-red-500 text-sm mt-1">
                                        {errors[`attendee_${index}_email`]}
                                      </p>
                                    )}
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      No. HP *
                                    </label>
                                    <input
                                      type="tel"
                                      value={attendee.phone}
                                      onChange={(e) => {
                                        const newAttendees = [...attendees];
                                        newAttendees[index].phone = e.target.value;
                                        updateAttendees(newAttendees);
                                      }}
                                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`attendee_${index}_phone`] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                      placeholder="08xxxxxxxxxx"
                                    />
                                    {errors[`attendee_${index}_phone`] && (
                                      <p className="text-red-500 text-sm mt-1">
                                        {errors[`attendee_${index}_phone`]}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          💡 <strong>Tips:</strong> Pastikan semua data yang Anda masukkan sudah benar dan lengkap.
                          Data peserta akan digunakan untuk akses masuk event.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Payment */}
                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Pembayaran
                    </h2>
                    <p className="text-gray-600 mb-8">
                      Periksa kembali detail pesanan sebelum melanjutkan pembayaran
                    </p>

                    <div className="space-y-6">
                      {/* Order Summary */}
                      <div className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Ringkasan Pesanan
                        </h3>

                        <div className="space-y-3 mb-4">
                          {Object.entries(checkoutSession!.selectedTickets).map(([categoryId, quantity]) => {
                            const category = event.ticketCategories?.find((t: TicketCategory) => t.id === categoryId);
                            if (!category) return null;

                            return (
                              <div key={categoryId} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  {category.name} x {quantity}
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {formatCurrency(category.price * quantity)}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-900">Total</span>
                            <span className="text-2xl font-bold text-blue-600">
                              {formatCurrency(getTotalPrice())}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            {getTotalTickets()} tiket
                          </p>
                        </div>
                      </div>

                      {/* Buyer Data Summary */}
                      <div className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Data Pembeli
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-600">Nama: <span className="font-medium text-gray-900">{buyer.name}</span></p>
                          <p className="text-gray-600">Email: <span className="font-medium text-gray-900">{buyer.email}</span></p>
                          <p className="text-gray-600">No. HP: <span className="font-medium text-gray-900">{buyer.phone}</span></p>
                        </div>
                      </div>

                      {/* Attendees Summary */}
                      <div className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Data Peserta ({attendees.length} peserta)
                        </h3>
                        <div className="space-y-3">
                          {attendees.map((attendee, index) => {
                            const category = event.ticketCategories?.find(
                              (t: TicketCategory) => t.id === attendee.ticketCategoryId
                            );
                            return (
                              <div key={index} className="border border-gray-100 rounded-lg p-3">
                                <p className="font-medium text-gray-900">{attendee.name}</p>
                                <p className="text-sm text-gray-600">{attendee.email}</p>
                                <p className="text-sm text-gray-600">{attendee.phone}</p>
                                <p className="text-xs text-gray-500 mt-1">Tiket: {category?.name}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800">
                          ✅ <strong>Data sudah lengkap!</strong> Klik buat pesanan untuk melanjutkan pembayaran.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment with Countdown */}
                {currentStep === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Lakukan Pembayaran
                    </h2>
                    <p className="text-gray-600 mb-8">
                      Pesanan Anda telah dibuat. Silakan lakukan pembayaran sebelum waktu habis.
                    </p>

                    <div className="space-y-6">
                      {/* Countdown Timer */}
                      <div className="text-center">
                        <div className="text-4xl font-bold text-red-600 mb-2">
                          {formatTime(timeLeft)}
                        </div>
                        <p className="text-gray-600">Waktu tersisa untuk pembayaran</p>
                      </div>

                      {/* Payment Instructions */}
                      <div className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Instruksi Pembayaran
                        </h3>
                        <div className="space-y-3 text-sm text-gray-600">
                          <p>1. Klik tombol Bayar Sekarang di bawah</p>
                          <p>2. Anda akan diarahkan ke halaman pembayaran Xendit</p>
                          <p>3. Pilih metode pembayaran yang diinginkan</p>
                          <p>4. Selesaikan pembayaran sebelum waktu habis</p>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Ringkasan Pesanan
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-600">Total Pembayaran: <span className="font-semibold text-gray-900">{formatCurrency(getTotalPrice())}</span></p>
                          <p className="text-gray-600">Jumlah Tiket: <span className="font-semibold text-gray-900">{getTotalTickets()} tiket</span></p>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          ⚠️ <strong>Penting:</strong> Jangan tutup halaman ini selama proses pembayaran. Jika waktu habis, pesanan akan dibatalkan.
                        </p>
                      </div>

                      {/* Payment Button */}
                      <div className="flex justify-center">
                        <button
                          onClick={() => {
                            if (paymentUrl) {
                              window.location.href = paymentUrl;
                            }
                          }}
                          disabled={!paymentUrl}
                          className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Bayar Sekarang
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 1 || isSubmitting || currentStep === 3}
                    className="flex items-center px-6 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    Kembali
                  </button>

                  {currentStep < 3 ? (
                    <Button
                      onClick={handleNext}
                      disabled={isSubmitting || currentStep === 3}
                      className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      {currentStep === 1 ? 'Lanjutkan ke Konfirmasi' : 'Buat Pesanan'}
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Ringkasan
                </h3>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Event</p>
                    <p className="font-semibold text-gray-900">{event.title}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Total Tiket</p>
                    <p className="font-semibold text-gray-900">{getTotalTickets()} tiket</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(getTotalPrice())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
