'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEventBySlug, useUpdateEvent } from '@/hooks/useEvents';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EventType, RedeemStrategy } from '@/types';

const eventFormSchema = z.object({
  title: z.string().min(1, 'Judul event wajib diisi'),
  description: z.string().min(1, 'Deskripsi event wajib diisi'),
  location: z.string().min(1, 'Lokasi event wajib diisi'),
  startDate: z.date({
    required_error: 'Tanggal mulai wajib diisi',
  }),
  endDate: z.date({
    required_error: 'Tanggal selesai wajib diisi',
  }),
  startTime: z.string().min(1, 'Waktu mulai wajib diisi'),
  endTime: z.string().min(1, 'Waktu selesai wajib diisi'),
  eventType: z.nativeEnum(EventType, { required_error: 'Jenis event wajib dipilih' }),
  imageUrl: z.string().optional(),
  termsAndConditions: z.string().optional(),
  status: z.enum(['draft', 'published', 'cancelled']),
}).refine(data => {
  const startDateTime = new Date(data.startDate);
  const endDateTime = new Date(data.endDate);
  return startDateTime <= endDateTime;
}, {
  message: 'Tanggal selesai harus setelah atau sama dengan tanggal mulai',
  path: ['endDate'],
});

export default function EditEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: event, isLoading: eventLoading } = useEventBySlug(slug);
  const updateEventMutation = useUpdateEvent();

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      startDate: new Date(),
      endDate: new Date(),
      startTime: '08:00',
      endTime: '17:00',
      eventType: EventType.CONCERT,
      imageUrl: '',
      termsAndConditions: '',
      status: 'draft',
    },
  });

  // Populate form when event data is loaded
  useEffect(() => {
    if (event) {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      
      form.reset({
        title: event.title || '',
        description: event.description || '',
        location: event.location || '',
        startDate: startDate,
        endDate: endDate,
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
        eventType: ((event as any).eventType as EventType) || EventType.CONCERT,
        imageUrl: event.imageUrl || '',
        termsAndConditions: event.termsAndConditions || '',
        status: event.status || 'draft',
      });
    }
  }, [event, form]);

  const onSubmit = async (values: z.infer<typeof eventFormSchema>) => {
    if (!event?.id) return;

    try {
      const startDateTime = new Date(values.startDate);
      startDateTime.setHours(
        parseInt(values.startTime.split(':')[0]),
        parseInt(values.startTime.split(':')[1])
      );
      
      const endDateTime = new Date(values.endDate);
      endDateTime.setHours(
        parseInt(values.endTime.split(':')[0]),
        parseInt(values.endTime.split(':')[1])
      );

      await updateEventMutation.mutateAsync({
        id: event.id,
        slug: slug,
        data: {
          title: values.title,
          description: values.description,
          location: values.location,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          eventType: values.eventType,
          imageUrl: values.imageUrl || undefined,
          termsAndConditions: values.termsAndConditions || undefined,
          status: values.status,
        },
      });

      router.push(`/organizer/events/${event.slug}`);
    } catch (error: any) {
      console.error('Failed to update event:', error);
      alert(error.message || 'Gagal mengupdate event. Silakan coba lagi.');
    }
  };

  // Loading State
  if (eventLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data event...</p>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-5xl mb-4">📅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Tidak Ditemukan</h2>
          <Link
            href="/organizer/events"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Kembali ke Daftar Event
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/organizer/events">My Events</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/organizer/events/${slug}`}>{event.title}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
            <p className="mt-2 text-muted-foreground">
              Update informasi event Anda
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Dasar</CardTitle>
                  <CardDescription>Informasi utama tentang event Anda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Event *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jenis event" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(EventType).map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul Event *</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan judul event" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deskripsi Event *</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Jelaskan detail event Anda dengan format yang menarik..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Gambar Event</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                          Opsional. Masukkan URL gambar untuk poster event
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="termsAndConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Syarat dan Ketentuan</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value || ''}
                            onChange={field.onChange}
                            placeholder="Masukkan syarat dan ketentuan event (opsional)..."
                          />
                        </FormControl>
                        <FormDescription>
                          Opsional. Syarat dan ketentuan yang berlaku untuk event ini
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status Event *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih status event" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Draft: Event belum dipublikasi | Published: Event aktif | Cancelled: Event dibatalkan
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Date & Time */}
              <Card>
                <CardHeader>
                  <CardTitle>Lokasi dan Waktu</CardTitle>
                  <CardDescription>Tentukan lokasi dan jadwal event Anda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lokasi Event *</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan alamat lengkap venue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Tanggal Mulai *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pilih tanggal</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date: Date) =>
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Tanggal Selesai *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pilih tanggal</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date: Date) =>
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Waktu Mulai *</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Waktu Selesai *</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  asChild
                >
                  <Link href={`/organizer/events/${slug}`}>
                    Batal
                  </Link>
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || updateEventMutation.isPending}
                >
                  {(form.formState.isSubmitting || updateEventMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {(form.formState.isSubmitting || updateEventMutation.isPending) ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
