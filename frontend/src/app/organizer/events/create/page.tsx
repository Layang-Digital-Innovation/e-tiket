'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService } from '@/services/api';
import { CreateEventRequest, EventTypeApi, RedeemStrategyApi, DeliveryModeApi } from '@/types/api';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { error } from 'console';
import { useCreateEvent } from '@/hooks';
import { DeliveryMode, EventType } from '@/types';

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
  deliveryMode: z.nativeEnum(DeliveryMode),
  webinarJoinUrl: z.string().optional(),
  termsAndConditions: z.string().optional(),
}).refine(data => {
  const startDateTime = new Date(data.startDate);
  const endDateTime = new Date(data.endDate);
  const [startHourStr, startMinuteStr] = data.startTime.split(':');
  const [endHourStr, endMinuteStr] = data.endTime.split(':');
  const startTotalMinutes =
    parseInt(startHourStr, 10) * 60 + (startMinuteStr ? parseInt(startMinuteStr, 10) : 0);
  const endTotalMinutes =
    parseInt(endHourStr, 10) * 60 + (endMinuteStr ? parseInt(endMinuteStr, 10) : 0);
  return (
    startDateTime <= endDateTime &&
    (startDateTime < endDateTime || startTotalMinutes <= endTotalMinutes)
  );
}, {
  message: 'Tanggal selesai harus setelah atau sama dengan tanggal mulai, dan jika sama maka waktu selesai tidak boleh lebih awal dari waktu mulai',
  path: ['endDate'],
});

export default function CreateEventPage() {
  const router = useRouter();
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
      webinarJoinUrl: '',
      deliveryMode: DeliveryMode.ONLINE,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const createEventMutation = useCreateEvent();

  const onSubmit = async (values: z.infer<typeof eventFormSchema>) => {
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

      const eventData: CreateEventRequest = {
        title: values.title,
        description: values.description,
        location: values.location,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        eventType: values.eventType,
        imageUrl: values.imageUrl || undefined,
        termsAndConditions: values.termsAndConditions || undefined,
        webinarJoinUrl: values.webinarJoinUrl || undefined,
        deliveryMode: values.deliveryMode || DeliveryMode.ONLINE,
      };

      await createEventMutation.mutateAsync(eventData);
      router.push('/organizer/events');
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-screen-lg mx-auto py-6 sm:px-6 lg:px-10">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Buat Event Baru</h1>
            <p className="mt-2 text-gray-600">
              Isi informasi lengkap untuk event yang akan Anda buat
            </p>
          </div>

          <div className="bg-white shadow rounded-lg">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, (error) => {
                console.error('Failed to create event:', error);
                alert('Gagal membuat event. Silakan coba lagi.');
              })} className="space-y-6 p-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Dasar</h3>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="eventType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jenis Event *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jenis event" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(EventTypeApi).map((type) => (
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

                    {
                      form.watch('eventType') === EventType.SEMINAR && (
                        <>
                        <FormField
                          control={form.control}
                          name="webinarJoinUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL Webinar *</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan URL webinar" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="deliveryMode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Metode Pelaksanaan</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih metode pelaksanaan" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.values(DeliveryModeApi).map((mode) => (
                                      <SelectItem key={mode} value={mode}>
                                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        </>
                      )
                        
                      
                    }

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
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Lokasi dan Waktu</h3>
                  
                  <div className="grid grid-cols-1 gap-6">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    date < new Date() || date < new Date("1900-01-01")
                                  }
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
                                    date < new Date() || date < new Date("1900-01-01")
                                  }
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <Link href="/eo/events" className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Batal
                  </Link>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Membuat Event...' : 'Buat Event'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}