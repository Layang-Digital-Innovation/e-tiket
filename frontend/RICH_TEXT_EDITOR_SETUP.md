# Rich Text Editor Setup - Tiptap Integration

## 📦 Installation

Jalankan command berikut untuk install dependencies yang diperlukan:

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-text-align @tiptap/extension-underline
```

Atau jika menggunakan yarn:

```bash
yarn add @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-text-align @tiptap/extension-underline
```

**Note:** Tiptap fully supports React 19, tidak seperti react-quill yang masih terbatas di React 18.

## 📁 File yang Dibuat

### 1. **RichTextEditor Component** (`src/components/ui/rich-text-editor.tsx`)
Komponen wrapper untuk Tiptap editor dengan konfigurasi toolbar yang sudah disesuaikan.

**Features:**
- ✅ Built with Tiptap - modern, extensible, dan support React 19
- ✅ Toolbar lengkap dengan icon dari Lucide React
- ✅ Formatting options: headers (H1-H3), bold, italic, underline, strikethrough
- ✅ Lists: bullet list & ordered list
- ✅ Text alignment: left, center, right
- ✅ Link support dengan prompt dialog
- ✅ Undo/Redo functionality
- ✅ Custom styling yang match dengan design system
- ✅ Placeholder support
- ✅ Disabled state support

### 2. **RichTextDisplay Component** (`src/components/ui/rich-text-display.tsx`)
Komponen untuk menampilkan HTML content dari rich text editor dengan styling yang konsisten.

**Features:**
- ✅ Prose styling dari Tailwind
- ✅ Safe HTML rendering dengan `dangerouslySetInnerHTML`
- ✅ Custom className support

## 🔧 Implementasi

### Sudah Diupdate:
- ✅ **Create Event Form** (`src/app/organizer/events/create/page.tsx`)
  - Field `description` sudah menggunakan `RichTextEditor`

### Cara Menggunakan di Form Lain:

```tsx
import { RichTextEditor } from '@/components/ui/rich-text-editor';

// Dalam FormField
<FormField
  control={form.control}
  name="description"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Deskripsi</FormLabel>
      <FormControl>
        <RichTextEditor
          value={field.value}
          onChange={field.onChange}
          placeholder="Tulis deskripsi..."
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Cara Menampilkan HTML Content:

```tsx
import { RichTextDisplay } from '@/components/ui/rich-text-display';

// Untuk menampilkan content
<RichTextDisplay content={event.description} />
```

## 🎨 Toolbar Features

Editor dilengkapi dengan toolbar berikut:
- **Headers**: H1, H2, H3
- **Text Formatting**: Bold, Italic, Underline, Strikethrough
- **Lists**: Ordered list, Bullet list
- **Alignment**: Left, Center, Right
- **Links**: Insert hyperlinks dengan dialog prompt
- **Undo/Redo**: Undo dan Redo changes

Semua button toolbar menggunakan icon dari **Lucide React** untuk konsistensi dengan design system.

## 📝 Contoh Penggunaan Lengkap

### Di Form (Create/Edit):
```tsx
'use client';

import { useForm } from 'react-hook-form';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

export default function MyForm() {
  const form = useForm({
    defaultValues: {
      description: '',
    },
  });

  return (
    <form>
      <RichTextEditor
        value={form.watch('description')}
        onChange={(value) => form.setValue('description', value)}
        placeholder="Tulis deskripsi..."
      />
    </form>
  );
}
```

### Di Display Page:
```tsx
import { RichTextDisplay } from '@/components/ui/rich-text-display';

export default function EventDetail({ event }) {
  return (
    <div>
      <h2>Deskripsi Event</h2>
      <RichTextDisplay content={event.description} />
    </div>
  );
}
```

## 🔒 Security Note

Komponen `RichTextDisplay` menggunakan `dangerouslySetInnerHTML` untuk render HTML. 
Pastikan content yang ditampilkan berasal dari sumber terpercaya (database Anda sendiri).

Jika menerima content dari user eksternal, pertimbangkan untuk:
1. Sanitize HTML di backend sebelum menyimpan
2. Gunakan library seperti `DOMPurify` untuk sanitize di frontend

## 🎯 Next Steps

Jika ingin menggunakan rich text editor di halaman lain:

1. **Edit Event Form** - Tambahkan RichTextEditor di form edit event
2. **Event Detail Page** - Gunakan RichTextDisplay untuk menampilkan deskripsi
3. **Ticket Description** - Bisa juga digunakan untuk deskripsi ticket jika diperlukan

## 🐛 Troubleshooting

### Error: "Cannot find module '@tiptap/...'"
Pastikan semua dependencies sudah terinstall dengan benar:
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-text-align @tiptap/extension-underline
```

### Editor tidak muncul atau blank
Pastikan komponen menggunakan `'use client'` directive di bagian atas file.

### Styling tidak sesuai
Tiptap menggunakan Tailwind CSS untuk styling. Pastikan Tailwind sudah dikonfigurasi dengan benar di project Anda.

### TypeScript errors
Tiptap sudah include TypeScript definitions, tidak perlu install @types terpisah.

## 🌟 Keunggulan Tiptap vs React-Quill

- ✅ **React 19 Support**: Tiptap fully support React 19
- ✅ **Modern & Lightweight**: Lebih ringan dan performant
- ✅ **Extensible**: Mudah untuk menambah custom extensions
- ✅ **TypeScript First**: Built-in TypeScript support
- ✅ **Headless**: Full control atas UI dan styling
- ✅ **Active Development**: Aktif di-maintain dan update regular
