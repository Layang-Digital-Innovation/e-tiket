"use client";

import { use } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEventBySlug } from "@/hooks/useEvents";
import { useTicketCategories } from "@/hooks/useTickets";
import { useGenerateRedeemItems } from "@/hooks/useRedeem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const schema = z.object({
  ticketCategoryId: z.string().min(1, "Kategori tiket wajib dipilih"),
  quantity: z
    .number({ invalid_type_error: "Jumlah harus angka" })
    .int("Harus bilangan bulat")
    .min(1, "Minimal 1")
    .max(10000, "Maksimal 10000"),
});

type FormValues = z.infer<typeof schema>;

export default function RedeemItemsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: event, isLoading: eventLoading } = useEventBySlug(slug);
  const { data: categories = [], isLoading: catLoading } = useTicketCategories(event?.id || "", !!event?.id);
  const generateMutation = useGenerateRedeemItems();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ticketCategoryId: "", quantity: 100 },
  });

  const onSubmit = async (values: FormValues) => {
    await generateMutation.mutateAsync(values);
    form.reset({ ...values, quantity: 100 });
  };

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
                <BreadcrumbPage>Redeem Items</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Kelola Redeem Items</h1>
            <p className="mt-2 text-muted-foreground">Generate kode untuk percetakan wristband/BIB sebelum event.</p>
          </div>

          {/* Form Generate */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Redeem Items</CardTitle>
              <CardDescription>Pilih kategori tiket dan jumlah kode yang akan di-generate</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="ticketCategoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategori Tiket</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={catLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={catLoading ? "Memuat kategori..." : "Pilih kategori"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
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
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jumlah</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={10000}
                            value={field.value}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            placeholder="100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-end">
                    <Button type="submit" disabled={generateMutation.isPending} className="w-full">
                      {generateMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {generateMutation.isPending ? "Menggenerate..." : "Generate Codes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Placeholder for future list/stats */}
          <div className="mt-6 text-sm text-muted-foreground">
            Setelah generate, Anda dapat mencetak QR codes dari sistem backend atau ekspor data sesuai kebutuhan.
          </div>
        </div>
      </div>
    </div>
  );
}
