'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, RotateCcw, Info } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsAppTemplateDialogProps {
    eventTitle?: string;
    onTemplateChange?: (template: string) => void;
    currentTemplate?: string;
}

const DEFAULT_TEMPLATE = `Halo {name}, kami dari panitia event {event}. Kami ingin menginformasikan bahwa...`;

const TEMPLATE_VARIABLES = [
    { key: '{name}', description: 'Nama lengkap peserta' },
    { key: '{event}', description: 'Nama event' },
    { key: '{ticketCode}', description: 'Kode tiket' },
    { key: '{category}', description: 'Kategori tiket' },
];

export function WhatsAppTemplateDialog({
    eventTitle = 'Event',
    onTemplateChange,
    currentTemplate = DEFAULT_TEMPLATE
}: WhatsAppTemplateDialogProps) {
    const [open, setOpen] = useState(false);
    const [template, setTemplate] = useState(currentTemplate);
    const [previewText, setPreviewText] = useState('');

    useEffect(() => {
        setTemplate(currentTemplate);
    }, [currentTemplate]);

    useEffect(() => {
        // Generate preview with sample data
        const preview = template
            .replace(/{name}/g, 'John Doe')
            .replace(/{event}/g, eventTitle)
            .replace(/{ticketCode}/g, 'TKT-12345')
            .replace(/{category}/g, 'VIP');
        setPreviewText(preview);
    }, [template, eventTitle]);

    const handleSave = () => {
        if (!template.trim()) {
            toast.error('Template tidak boleh kosong');
            return;
        }

        // Save to localStorage
        localStorage.setItem('whatsapp_template', template);

        // Notify parent component
        if (onTemplateChange) {
            onTemplateChange(template);
        }

        toast.success('Template berhasil disimpan');
        setOpen(false);
    };

    const handleReset = () => {
        setTemplate(DEFAULT_TEMPLATE);
        toast.info('Template direset ke default');
    };

    const insertVariable = (variable: string) => {
        setTemplate(prev => prev + variable);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                    <Edit className="h-4 w-4" />
                    <span>Edit Template WA</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Template Pesan WhatsApp</DialogTitle>
                    <DialogDescription>
                        Sesuaikan template pesan follow-up WhatsApp untuk peserta event Anda
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Template Variables Info */}
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center space-x-2">
                                <Info className="h-4 w-4 text-blue-600" />
                                <span>Variabel Template</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-xs text-gray-600 mb-2">
                                Klik variabel di bawah untuk menambahkannya ke template:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {TEMPLATE_VARIABLES.map((variable) => (
                                    <Button
                                        key={variable.key}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => insertVariable(variable.key)}
                                        className="text-xs bg-white hover:bg-blue-100"
                                        title={variable.description}
                                    >
                                        {variable.key}
                                    </Button>
                                ))}
                            </div>
                            <div className="mt-3 space-y-1">
                                {TEMPLATE_VARIABLES.map((variable) => (
                                    <div key={variable.key} className="text-xs text-gray-600">
                                        <code className="bg-white px-1 py-0.5 rounded">{variable.key}</code>
                                        {' → '}{variable.description}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Template Editor */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="template">Template Pesan</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                className="text-xs flex items-center space-x-1"
                            >
                                <RotateCcw className="h-3 w-3" />
                                <span>Reset ke Default</span>
                            </Button>
                        </div>
                        <Textarea
                            id="template"
                            value={template}
                            onChange={(e) => setTemplate(e.target.value)}
                            placeholder="Masukkan template pesan WhatsApp..."
                            className="min-h-[150px] font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500">
                            {template.length} karakter
                        </p>
                    </div>

                    {/* Preview */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Preview Pesan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                    {previewText || 'Preview akan muncul di sini...'}
                                </p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Preview menggunakan data contoh
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Batal
                    </Button>
                    <Button onClick={handleSave}>
                        Simpan Template
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
