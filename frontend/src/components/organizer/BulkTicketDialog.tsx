'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateBulkTicket } from '@/hooks/useTickets';
import { TicketCategory } from '@/types';

interface AttendeeFormData {
    fullName: string;
    email: string;
    phoneNumber?: string;
    identityType?: string;
    identityNumber?: string;
    gender?: string;
    address?: string;
    birthDate?: string;
}

interface BulkTicketFormData {
    categoryId: string;
    attendees: AttendeeFormData[];
}

interface BulkTicketDialogProps {
    eventId: string;
    eventSlug: string;
    categories: TicketCategory[];
}

export function BulkTicketDialog({ eventId, eventSlug, categories }: BulkTicketDialogProps) {
    const [open, setOpen] = useState(false);
    const createBulkTicket = useCreateBulkTicket();

    const { register, control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<BulkTicketFormData>({
        defaultValues: {
            categoryId: '',
            attendees: [
                {
                    fullName: '',
                    email: '',
                    phoneNumber: '',
                    identityType: '',
                    identityNumber: '',
                    gender: '',
                    address: '',
                    birthDate: '',
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'attendees',
    });

    const onSubmit = async (data: BulkTicketFormData) => {
        if (!data.categoryId) {
            toast.error('Pilih kategori tiket terlebih dahulu');
            return;
        }

        if (data.attendees.length === 0) {
            toast.error('Tambahkan minimal satu peserta');
            return;
        }

        // Filter out empty optional fields
        const cleanedAttendees = data.attendees.map(attendee => {
            const cleaned: any = {
                fullName: attendee.fullName,
                email: attendee.email,
            };

            if (attendee.phoneNumber) cleaned.phoneNumber = attendee.phoneNumber;
            if (attendee.identityType) cleaned.identityType = attendee.identityType;
            if (attendee.identityNumber) cleaned.identityNumber = attendee.identityNumber;
            if (attendee.gender) cleaned.gender = attendee.gender;
            if (attendee.address) cleaned.address = attendee.address;
            if (attendee.birthDate) cleaned.birthDate = attendee.birthDate;

            return cleaned;
        });

        createBulkTicket.mutate(
            {
                categoryId: data.categoryId,
                attendees: cleanedAttendees,
                eventSlug,
            },
            {
                onSuccess: () => {
                    toast.success(`Berhasil membuat ${data.attendees.length} tiket!`);
                    setOpen(false);
                    reset();
                },
                onError: (error: any) => {
                    toast.error(`Gagal membuat tiket: ${error.message || 'Terjadi kesalahan'}`);
                },
            }
        );
    };

    const addAttendee = () => {
        append({
            fullName: '',
            email: '',
            phoneNumber: '',
            identityType: '',
            identityNumber: '',
            gender: '',
            address: '',
            birthDate: '',
        });
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            reset();
        }
    };

    // Filter active categories
    const activeCategories = categories.filter(cat => cat.isActive);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Create Bulk Ticket</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Buat Tiket Manual</DialogTitle>
                    <DialogDescription>
                        Buat beberapa tiket sekaligus untuk peserta yang mendaftar secara manual
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Category Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="categoryId">Kategori Tiket *</Label>
                        <Select
                            value={watch('categoryId')}
                            onValueChange={(value) => setValue('categoryId', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori tiket" />
                            </SelectTrigger>
                            <SelectContent>
                                {activeCategories.length === 0 ? (
                                    <div className="p-2 text-sm text-gray-500">
                                        Tidak ada kategori tiket aktif
                                    </div>
                                ) : (
                                    activeCategories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name} - Rp {category.price.toLocaleString('id-ID')}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {errors.categoryId && (
                            <p className="text-sm text-red-600">{errors.categoryId.message}</p>
                        )}
                    </div>

                    {/* Attendees */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Data Peserta</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addAttendee}
                                className="flex items-center space-x-1"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Tambah Peserta</span>
                            </Button>
                        </div>

                        {fields.map((field, index) => (
                            <div key={field.id} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-sm">Peserta {index + 1}</h4>
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => remove(index)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor={`attendees.${index}.fullName`}>
                                            Nama Lengkap *
                                        </Label>
                                        <Input
                                            {...register(`attendees.${index}.fullName`, {
                                                required: 'Nama lengkap wajib diisi',
                                            })}
                                            placeholder="Masukkan nama lengkap"
                                        />
                                        {errors.attendees?.[index]?.fullName && (
                                            <p className="text-sm text-red-600">
                                                {errors.attendees[index]?.fullName?.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor={`attendees.${index}.email`}>Email *</Label>
                                        <Input
                                            {...register(`attendees.${index}.email`, {
                                                required: 'Email wajib diisi',
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message: 'Format email tidak valid',
                                                },
                                            })}
                                            type="email"
                                            placeholder="email@example.com"
                                        />
                                        {errors.attendees?.[index]?.email && (
                                            <p className="text-sm text-red-600">
                                                {errors.attendees[index]?.email?.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone Number */}
                                    <div className="space-y-2">
                                        <Label htmlFor={`attendees.${index}.phoneNumber`}>
                                            Nomor Telepon
                                        </Label>
                                        <Input
                                            {...register(`attendees.${index}.phoneNumber`)}
                                            placeholder="08xxxxxxxxxx"
                                        />
                                    </div>

                                    {/* Gender */}
                                    <div className="space-y-2">
                                        <Label htmlFor={`attendees.${index}.gender`}>Jenis Kelamin</Label>
                                        <Select
                                            value={watch(`attendees.${index}.gender`) || ''}
                                            onValueChange={(value) => setValue(`attendees.${index}.gender`, value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih jenis kelamin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Laki-laki</SelectItem>
                                                <SelectItem value="female">Perempuan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Identity Type */}
                                    <div className="space-y-2">
                                        <Label htmlFor={`attendees.${index}.identityType`}>
                                            Jenis Identitas
                                        </Label>
                                        <Select
                                            value={watch(`attendees.${index}.identityType`) || ''}
                                            onValueChange={(value) => setValue(`attendees.${index}.identityType`, value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih jenis identitas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ktp">KTP</SelectItem>
                                                <SelectItem value="sim">SIM</SelectItem>
                                                <SelectItem value="passport">Passport</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Identity Number */}
                                    <div className="space-y-2">
                                        <Label htmlFor={`attendees.${index}.identityNumber`}>
                                            Nomor Identitas
                                        </Label>
                                        <Input
                                            {...register(`attendees.${index}.identityNumber`)}
                                            placeholder="Nomor identitas"
                                        />
                                    </div>

                                    {/* Birth Date */}
                                    <div className="space-y-2">
                                        <Label htmlFor={`attendees.${index}.birthDate`}>
                                            Tanggal Lahir
                                        </Label>
                                        <Input
                                            {...register(`attendees.${index}.birthDate`)}
                                            type="date"
                                        />
                                    </div>

                                    {/* Address */}
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor={`attendees.${index}.address`}>Alamat</Label>
                                        <Input
                                            {...register(`attendees.${index}.address`)}
                                            placeholder="Alamat lengkap"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={createBulkTicket.isPending}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={createBulkTicket.isPending}>
                            {createBulkTicket.isPending ? 'Membuat Tiket...' : 'Buat Tiket'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
