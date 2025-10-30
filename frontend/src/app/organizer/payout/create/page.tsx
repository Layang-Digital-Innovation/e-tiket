'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/auth.store';
import { useMyEvents } from '@/hooks/useEvents';
import { useCreatePayout } from '@/hooks/usePayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { BankType } from '@/types';
import { CurrencyInput } from '@/components/ui/currency-input';

const BANK_TYPES: { value: BankType; label: string }[] = [
  { value: 'bca', label: 'BCA' },
  { value: 'mandiri', label: 'Mandiri' },
  { value: 'bni', label: 'BNI' },
  { value: 'cimb', label: 'CIMB' },
  { value: 'permata', label: 'Permata' },
  { value: 'other', label: 'Lainnya' },
];

const formSchema = z.object({
  eventId: z.string().optional(),
  netAmount: z.number().positive('Nominal payout harus lebih dari 0'),
  bankAccountName: z.string().min(1, 'Nama rekening harus diisi'),
  bankAccountNumber: z.string().min(1, 'Nomor rekening harus diisi'),
  bankType: z.enum(['bca', 'mandiri', 'bni', 'cimb', 'permata', 'other']),
  bankBranch: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreatePayoutPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { data: eventsResponse } = useMyEvents();
  const events = eventsResponse?.data || [];
  const createPayoutMutation = useCreatePayout();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventId: 'all',
      netAmount: 0,
      bankAccountName: '',
      bankAccountNumber: '',
      bankType: 'bca' as const,
      bankBranch: '',
      notes: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const payoutData = {
        eventId: values.eventId === 'all' ? undefined : values.eventId,
        netAmount: values.netAmount,
        bankAccountName: values.bankAccountName,
        bankAccountNumber: values.bankAccountNumber,
        bankType: values.bankType as BankType,
        bankBranch: values.bankBranch || undefined,
        notes: values.notes || undefined,
      };

      await createPayoutMutation.mutateAsync(payoutData);
      router.push('/organizer/payout');
    } catch (error: any) {
      form.setError('root', {
        message: error.message || 'Gagal membuat payout',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/organizer/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/organizer/payout">Payout</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Buat Payout Baru</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="mb-8">
            <Link
              href="/organizer/payout"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Buat Permintaan Payout</h1>
            <p className="text-gray-600 mt-2">Isi formulir di bawah untuk membuat permintaan pencairan dana</p>
          </div>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Payout</CardTitle>
              <CardDescription>Informasi rekening dan nominal pencairan</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Event Selection */}
                  <FormField
                    control={form.control}
                    name="eventId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event (Opsional)</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih event" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">Semua Event</SelectItem>
                            {events?.map((event) => (
                              <SelectItem key={event.id} value={event.id}>
                                {event.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Pilih event spesifik atau biarkan kosong untuk payout umum
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Net Amount */}
                  <FormField
                    control={form.control}
                    name="netAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nominal Pencairan *</FormLabel>
                        <FormControl>
                          <CurrencyInput
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Bank Account Name */}
                  <FormField
                    control={form.control}
                    name="bankAccountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Pemilik Rekening *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nama lengkap pemilik rekening"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Bank Type */}
                  <FormField
                    control={form.control}
                    name="bankType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank *</FormLabel>
                        <Select value={field.value}  onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue  />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BANK_TYPES.map((bank) => (
                              <SelectItem key={bank.value}  value={bank.value}>
                                {bank.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Bank Account Number */}
                  <FormField
                    control={form.control}
                    name="bankAccountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Rekening *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nomor rekening"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Bank Branch */}
                  <FormField
                    control={form.control}
                    name="bankBranch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cabang Bank (Opsional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Cabang bank"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan (Opsional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Catatan tambahan untuk payout ini"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Error */}
                  {form.formState.errors.root && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-800 text-sm">{form.formState.errors.root.message}</p>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <Link
                      href="/organizer/payout"
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Batal
                    </Link>
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting || createPayoutMutation.isPending}
                    >
                      {form.formState.isSubmitting || createPayoutMutation.isPending ? 'Menyimpan...' : 'Buat Payout'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
