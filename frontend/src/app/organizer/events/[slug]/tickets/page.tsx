'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEventBySlug } from '@/hooks/useEvents';
import { useTicketCategories, useCreateTicketCategory, useUpdateTicketCategory, useDeleteTicketCategory, useToggleTicketCategory } from '@/hooks/useTickets';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Loader2, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { TicketCategory } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

const ticketFormSchema = z.object({
  name: z.string().min(1, 'Nama tiket wajib diisi'),
  description: z.string().min(1, 'Deskripsi tiket wajib diisi'),
  price: z.coerce.number().min(0, 'Harga harus lebih dari atau sama dengan 0'),
  maxQuantity: z.coerce.number().min(1, 'Kuantitas minimal 1'),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

// Helper function to strip HTML tags and get plain text
const stripHtml = (html: string): string => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export default function EOTicketManagementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: event, isLoading: eventLoading } = useEventBySlug(slug);
  const { data: tickets = [], isLoading: ticketsLoading, error: ticketsError } = useTicketCategories(event?.id || '', !!event?.id);
  const createTicketMutation = useCreateTicketCategory();
  const updateTicketMutation = useUpdateTicketCategory();
  const deleteTicketMutation = useDeleteTicketCategory();
  const toggleTicketMutation = useToggleTicketCategory();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketCategory | null>(null);

  const createForm = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      maxQuantity: 1,
    },
  });

  const editForm = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      maxQuantity: 1,
    },
  });

  const onCreateSubmit = async (values: TicketFormValues) => {
    if (!event?.id) return;

    try {
      await createTicketMutation.mutateAsync({
        eventId: event.id,
        name: values.name,
        description: values.description,
        price: values.price,
        maxQuantity: values.maxQuantity,
      });
      createForm.reset();
      setShowCreateDialog(false);
    } catch (error: any) {
      console.error('Failed to create ticket:', error);
      alert(error.message || 'Gagal membuat tiket. Silakan coba lagi.');
    }
  };

  const onEditSubmit = async (values: TicketFormValues) => {
    if (!event?.id || !selectedTicket) return;

    try {
      await updateTicketMutation.mutateAsync({
        id: selectedTicket.id,
        eventId: event.id,
        data: {
          name: values.name,
          description: values.description,
          price: values.price,
          maxQuantity: values.maxQuantity,
        },
      });
      editForm.reset();
      setShowEditDialog(false);
      setSelectedTicket(null);
    } catch (error: any) {
      console.error('Failed to update ticket:', error);
      alert(error.message || 'Gagal mengupdate tiket. Silakan coba lagi.');
    }
  };

  const handleEditClick = (ticket: TicketCategory) => {
    setSelectedTicket(ticket);
    editForm.reset({
      name: ticket.name,
      description: ticket.description || '',
      price: ticket.price,
      maxQuantity: ticket.maxQuantity,
    });
    setShowEditDialog(true);
  };

  const handleDeleteClick = (ticket: TicketCategory) => {
    setSelectedTicket(ticket);
    setShowDeleteAlert(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTicket) return;

    try {
      await deleteTicketMutation.mutateAsync(selectedTicket.id);
      setShowDeleteAlert(false);
      setSelectedTicket(null);
    } catch (error: any) {
      console.error('Failed to delete ticket:', error);
      alert(error.message || 'Gagal menghapus tiket. Silakan coba lagi.');
    }
  };

  // Loading State
  if (eventLoading || ticketsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data tiket...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (ticketsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gagal Memuat Data</h2>
          <p className="text-gray-600 mb-4">{ticketsError.message || 'Terjadi kesalahan'}</p>
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
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/eo/events" className="text-gray-700 hover:text-gray-900">
                  My Events
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link href={`/organizer/events/${slug}`} className="text-gray-700 hover:text-gray-900">
                    Event Detail
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">Kelola Tiket</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kelola Tiket</h1>
              <p className="mt-2 text-gray-600">
                Kelola jenis tiket dan harga untuk event Anda
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Tiket
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">🎫</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Jenis Tiket
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {tickets.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">✅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Tiket Terjual
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {tickets.reduce((sum, ticket) => sum + ticket.sold, 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">📦</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Tiket Tersisa
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {tickets.reduce((sum, ticket) => sum + (ticket.maxQuantity - ticket.sold), 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">💰</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Pendapatan
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.sold), 0))}
                      </dd>
                      <dd className="text-xs text-gray-500 mt-1">
                        *Belum dipotong biaya
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Daftar Tiket
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Kelola semua jenis tiket untuk event ini
              </p>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800">
                  <span className="font-semibold">ℹ️ Catatan:</span> Pendapatan yang ditampilkan adalah pendapatan kotor (gross revenue). Pendapatan bersih akan dipotong dengan biaya payment gateway, biaya platform, dan pajak yang berlaku.
                </p>
              </div>
            </div>
            <ul className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              ticket.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {ticket.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {ticket.name}
                            </p>
                          </div>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500">
                              <p className="line-clamp-2">{stripHtml(ticket.description || '')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-8">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(ticket.price)}
                          </p>
                          <p className="text-sm text-gray-500">Harga</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {ticket.sold} / {ticket.maxQuantity}
                          </p>
                          <p className="text-sm text-gray-500">Terjual / Total</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            {formatCurrency(ticket.price * ticket.sold)}
                          </p>
                          <p className="text-sm text-gray-500">Pendapatan</p>
                        </div>
                        <div className="text-right">
                          <div className="w-24">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>{Math.round((ticket.sold / ticket.maxQuantity) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(ticket.sold / ticket.maxQuantity) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant={ticket.isActive ? 'destructive' : 'default'}
                            onClick={() => toggleTicketMutation.mutate(ticket.id)}
                            disabled={toggleTicketMutation.isPending}
                          >
                            {ticket.isActive ? (
                              <ToggleRight className="mr-1 h-4 w-4" />
                            ) : (
                              <ToggleLeft className="mr-1 h-4 w-4" />
                            )}
                            {ticket.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(ticket)}
                          >
                            <Edit className="mr-1 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteClick(ticket)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl! w-[90vw] max-h-[90vh] overflow-y-auto rounded">
           <ScrollArea>
          <DialogHeader>
            <DialogTitle>Tambah Tiket Baru</DialogTitle>
            <DialogDescription>
              Buat kategori tiket baru untuk event Anda
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Tiket *</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: VIP, Regular, Early Bird" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Tiket *</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Gunakan rich text editor untuk memformat deskripsi tiket
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga (Rp) *</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="150.000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="maxQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kuantitas Maksimal *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={createTicketMutation.isPending}>
                  {createTicketMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {createTicketMutation.isPending ? 'Menyimpan...' : 'Tambah Tiket'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Ticket Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl! w-[90vw] max-h-[90vh] overflow-y-auto rounded">
          <ScrollArea>
          <DialogHeader>
            <DialogTitle>Edit Tiket</DialogTitle>
            <DialogDescription>
              Update informasi kategori tiket
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Tiket *</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: VIP, Regular, Early Bird" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Tiket *</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Gunakan rich text editor untuk memformat deskripsi tiket
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga (Rp) *</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="150.000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="maxQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kuantitas Maksimal *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={updateTicketMutation.isPending}>
                  {updateTicketMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {updateTicketMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
          </ScrollArea>
        </DialogContent>
        
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tiket?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus tiket <strong>{selectedTicket?.name}</strong>?
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait tiket ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteTicketMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteTicketMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {deleteTicketMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}