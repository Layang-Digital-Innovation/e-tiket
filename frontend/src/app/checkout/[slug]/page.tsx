'use client';

import { use, useState, useEffect } from 'react';
import { useEventBySlug } from '@/hooks/useEvents';
import { useCreateOrder } from '@/hooks/useOrders';
import PublicLayout from '@/components/layouts/PublicLayout';
import { useRouter } from 'next/navigation';
import { CheckoutState, TicketCategory, AttendeeData, CreateOrderRequest, OrderItem, AttendeeDetail } from '@/types';
import { Check, ChevronLeft, ChevronRight, User, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: event, isLoading } = useEventBySlug(slug);
  const createOrderMutation = useCreateOrder();
  
  const [checkoutState, setCheckoutState] = useState<CheckoutState | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [attendees, setAttendees] = useState<AttendeeData[]>([]);
  const [buyer, setBuyer] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load checkout data from sessionStorage
    const savedCheckout = sessionStorage.getItem('checkout');
    if (savedCheckout) {
      const parsed = JSON.parse(savedCheckout);
      setCheckoutState(parsed);
      
      // Initialize attendees based on selected tickets
      if (event?.ticketCategories) {
        const initialAttendees: AttendeeData[] = [];
        Object.entries(parsed.selectedTickets).forEach(([categoryId, quantity]) => {
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
        setAttendees(initialAttendees);
      }
    } else {
      // Redirect back if no checkout data
      router.push(`/events/${slug}`);
    }
  }, [event, slug, router]);

  const getTotalPrice = () => {
    if (!event?.ticketCategories || !checkoutState) return 0;
    return Object.entries(checkoutState.selectedTickets).reduce((total, [categoryId, quantity]) => {
      const category = event.ticketCategories?.find((t: TicketCategory) => t.id === categoryId);
      return total + (category ? category.price * quantity : 0);
    }, 0);
  };

  const getTotalTickets = () => {
    if (!checkoutState) return 0;
    return Object.values(checkoutState.selectedTickets).reduce((total, qty) => total + qty, 0);
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

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleSubmitOrder = async () => {
    if (!event || !checkoutState || isSubmitting) return;
    
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
      sessionStorage.removeItem('checkout');

      console.log(response);
      
      // Redirect to payment URL
      window.location.href = response.data.paymentUrl;
      
      // Redirect to order success page or events list
      // router.push('/events');
    } catch (error: any) {
      console.error('Failed to create order:', error);
      alert(error.message || 'Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !checkoutState || !event) {
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
    { number: 1, title: 'Data Peserta', icon: User },
    { number: 2, title: 'Data Pembeli', icon: User },
    { number: 3, title: 'Pembayaran', icon: CreditCard },
  ];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        currentStep >= step.number
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <step.icon className="h-6 w-6" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        currentStep >= step.number ? 'text-blue-600' : 'text-gray-600'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-4 ${
                        currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                {/* Step 1: Attendee Data */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Data Peserta
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Isi data untuk {getTotalTickets()} peserta
                    </p>
                    
                    <div className="space-y-6">
                      {attendees.map((attendee, index) => {
                        const category = event.ticketCategories?.find(
                          (t: TicketCategory) => t.id === attendee.ticketCategoryId
                        );
                        
                        return (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-4">
                              Peserta {index + 1} - {category?.name}
                            </h3>
                            
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
                                    setAttendees(newAttendees);
                                  }}
                                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors[`attendee_${index}_name`] ? 'border-red-500' : 'border-gray-300'
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
                                    setAttendees(newAttendees);
                                  }}
                                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors[`attendee_${index}_email`] ? 'border-red-500' : 'border-gray-300'
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
                                    setAttendees(newAttendees);
                                  }}
                                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors[`attendee_${index}_phone`] ? 'border-red-500' : 'border-gray-300'
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
                )}

                {/* Step 2: Buyer Data */}
                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Data Pembeli
                    </h2>
                    <p className="text-gray-600 mb-6">
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
                          onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.buyer_name ? 'border-red-500' : 'border-gray-300'
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
                          onChange={(e) => setBuyer({ ...buyer, email: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.buyer_email ? 'border-red-500' : 'border-gray-300'
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
                          onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.buyer_phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="08xxxxxxxxxx"
                        />
                        {errors.buyer_phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.buyer_phone}</p>
                        )}
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                        <p className="text-sm text-blue-800">
                          💡 <strong>Tips:</strong> Pastikan email dan nomor HP yang Anda masukkan aktif. 
                          Tiket elektronik akan dikirim ke email ini.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Pembayaran
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          ⚠️ Fitur pembayaran online sedang dalam pengembangan. 
                          Untuk saat ini, silakan hubungi penyelenggara untuk proses pembayaran.
                        </p>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-4">
                          Ringkasan Pesanan
                        </h3>
                        
                        <div className="space-y-3">
                          {Object.entries(checkoutState.selectedTickets).map(([categoryId, quantity]) => {
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

                        <div className="border-t border-gray-200 mt-4 pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-900">Total</span>
                            <span className="text-2xl font-bold text-blue-600">
                              {formatCurrency(getTotalPrice())}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Data Pembeli
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-600">Nama: <span className="font-medium text-gray-900">{buyer.name}</span></p>
                          <p className="text-gray-600">Email: <span className="font-medium text-gray-900">{buyer.email}</span></p>
                          <p className="text-gray-600">No. HP: <span className="font-medium text-gray-900">{buyer.phone}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="flex items-center px-6 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    Kembali
                  </button>

                  {currentStep < 3 ? (
                    <button
                      onClick={handleNext}
                      className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      Lanjutkan
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Memproses...' : 'Konfirmasi Pesanan'}
                    </button>
                  )}
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
