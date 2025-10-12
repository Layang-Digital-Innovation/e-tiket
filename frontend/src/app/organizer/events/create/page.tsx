'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/header';
import { apiService } from '@/services/api';
import { CreateEventRequest } from '@/types/api';

interface EventFormData {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  price: number;
  imageUrl: string;
  category: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    maxCapacity: 0,
    price: 0,
    imageUrl: '',
    category: '',
  });

  const [errors, setErrors] = useState<Partial<EventFormData>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxCapacity' || name === 'price' ? Number(value) : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof EventFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EventFormData> = {};

    if (!formData.title.trim()) newErrors.title = 'Judul event wajib diisi';
    if (!formData.description.trim()) newErrors.description = 'Deskripsi event wajib diisi';
    if (!formData.location.trim()) newErrors.location = 'Lokasi event wajib diisi';
    if (!formData.startDate) newErrors.startDate = 'Tanggal mulai wajib diisi';
    if (!formData.endDate) newErrors.endDate = 'Tanggal selesai wajib diisi';
    if (!formData.startTime) newErrors.startTime = 'Waktu mulai wajib diisi';
    if (!formData.endTime) newErrors.endTime = 'Waktu selesai wajib diisi';
    if (formData.maxCapacity <= 0) newErrors.maxCapacity = 'Kapasitas harus lebih dari 0';
    if (formData.price < 0) newErrors.price = 'Harga tidak boleh negatif';
    if (!formData.category) newErrors.category = 'Kategori event wajib dipilih';

    // Validate dates
    if (formData.startDate && formData.endDate) {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      
      if (startDateTime >= endDateTime) {
        newErrors.endDate = 'Tanggal dan waktu selesai harus setelah tanggal dan waktu mulai';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Combine date and time
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      const eventData: CreateEventRequest = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        maxCapacity: formData.maxCapacity,
        price: formData.price,
        imageUrl: formData.imageUrl || undefined,
        category: formData.category,
        status: 'DRAFT' // Default status
      };

      await apiService.createEvent(eventData);
      alert('Event berhasil dibuat!');
      router.push('/eo/events');
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Gagal membuat event. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link
                href="/eo/events"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Kembali ke Daftar Event
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Buat Event Baru
            </h1>
            <p className="mt-2 text-gray-600">
              Isi informasi lengkap untuk event yang akan Anda buat
            </p>
          </div>

          {/* Form */}
          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Informasi Dasar
                </h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Judul Event *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                        errors.title ? 'border-red-300' : ''
                      }`}
                      placeholder="Masukkan judul event"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Deskripsi Event *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                        errors.description ? 'border-red-300' : ''
                      }`}
                      placeholder="Jelaskan detail event Anda"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Kategori Event *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                        errors.category ? 'border-red-300' : ''
                      }`}
                    >
                      <option value="">Pilih kategori</option>
                      <option value="music">Musik</option>
                      <option value="workshop">Workshop</option>
                      <option value="conference">Konferensi</option>
                      <option value="festival">Festival</option>
                      <option value="sports">Olahraga</option>
                      <option value="food">Kuliner</option>
                      <option value="art">Seni</option>
                      <option value="technology">Teknologi</option>
                      <option value="business">Bisnis</option>
                      <option value="other">Lainnya</option>
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                      URL Gambar Event
                    </label>
                    <input
                      type="url"
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Opsional. Masukkan URL gambar untuk poster event
                    </p>
                  </div>
                </div>
              </div>

              {/* Location and Date */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Lokasi dan Waktu
                </h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Lokasi Event *
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                        errors.location ? 'border-red-300' : ''
                      }`}
                      placeholder="Masukkan alamat lengkap venue"
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                        Tanggal Mulai *
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                          errors.startDate ? 'border-red-300' : ''
                        }`}
                      />
                      {errors.startDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                        Tanggal Selesai *
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                          errors.endDate ? 'border-red-300' : ''
                        }`}
                      />
                      {errors.endDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                        Waktu Mulai *
                      </label>
                      <input
                        type="time"
                        id="startTime"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                          errors.startTime ? 'border-red-300' : ''
                        }`}
                      />
                      {errors.startTime && (
                        <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                        Waktu Selesai *
                      </label>
                      <input
                        type="time"
                        id="endTime"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                          errors.endTime ? 'border-red-300' : ''
                        }`}
                      />
                      {errors.endTime && (
                        <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Capacity and Pricing */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Kapasitas dan Harga
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="maxCapacity" className="block text-sm font-medium text-gray-700">
                      Kapasitas Maksimal *
                    </label>
                    <input
                      type="number"
                      id="maxCapacity"
                      name="maxCapacity"
                      min="1"
                      value={formData.maxCapacity || ''}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                        errors.maxCapacity ? 'border-red-300' : ''
                      }`}
                      placeholder="Jumlah peserta maksimal"
                    />
                    {errors.maxCapacity && (
                      <p className="mt-1 text-sm text-red-600">{errors.maxCapacity}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Harga Dasar (Rp) *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      min="0"
                      value={formData.price || ''}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                        errors.price ? 'border-red-300' : ''
                      }`}
                      placeholder="0"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      Masukkan 0 untuk event gratis
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Link
                  href="/eo/events"
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Membuat Event...' : 'Buat Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}