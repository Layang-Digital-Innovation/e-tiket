# Rich Text Editor - Cursor Position Fix

## Masalah
Saat mengedit text di rich text editor (terutama saat memblok/select text), text yang lain ikut berubah atau cursor position hilang.

## Penyebab
`useEffect` yang meng-update content editor setiap kali `value` prop berubah menyebabkan:
1. **Infinite loop** - `onUpdate` trigger `onChange` → parent update `value` → `useEffect` trigger `setContent` → repeat
2. **Cursor reset** - Setiap `setContent` me-reset cursor position ke awal
3. **Selection loss** - Text yang di-select hilang karena content di-replace

## Solusi

### 1. Menambahkan `isUpdatingRef` Flag
```typescript
const isUpdatingRef = useRef(false);
```

Flag ini mencegah `useEffect` dari meng-update content saat user sedang mengetik.

### 2. Update `onUpdate` Handler
```typescript
onUpdate: ({ editor }: { editor: any }) => {
  isUpdatingRef.current = true;
  onChange(editor.getHTML());
  setTimeout(() => {
    isUpdatingRef.current = false;
  }, 0);
},
```

Set flag ke `true` saat update, kemudian reset ke `false` setelah event loop selesai.

### 3. Improve `useEffect` Logic
```typescript
useEffect(() => {
  if (editor && !isUpdatingRef.current && value !== editor.getHTML()) {
    const { from, to } = editor.state.selection;
    editor.commands.setContent(value, false);
    // Restore cursor position if possible
    if (from !== undefined) {
      editor.commands.setTextSelection({ 
        from: Math.min(from, editor.state.doc.content.size), 
        to: Math.min(to, editor.state.doc.content.size) 
      });
    }
  }
}, [value, editor]);
```

**Improvements:**
- Check `!isUpdatingRef.current` untuk skip update saat user mengetik
- Save cursor position sebelum `setContent`
- Restore cursor position setelah `setContent`
- Use `Math.min` untuk ensure position tidak melebihi document size

## Hasil

✅ **User dapat mengetik dengan lancar** tanpa text ter-reset
✅ **Cursor position tetap** di tempat yang benar
✅ **Text selection preserved** saat formatting
✅ **Tidak ada infinite loop** antara parent dan editor
✅ **Smooth editing experience** seperti editor profesional

## Testing

1. Ketik text di editor → cursor harus tetap di posisi yang benar
2. Select/blok text → selection tidak hilang
3. Apply formatting (bold, italic, dll) → text yang di-select ter-format dengan benar
4. Edit text di tengah paragraph → text lain tidak berubah
5. Undo/Redo → history bekerja dengan baik

## Technical Details

### Why `setTimeout(..., 0)`?
Menggunakan `setTimeout` dengan delay 0 untuk memastikan flag di-reset **setelah** event loop selesai, sehingga `useEffect` tidak ter-trigger pada update cycle yang sama.

### Why Save/Restore Cursor Position?
`setContent` me-replace seluruh document, yang menyebabkan cursor position hilang. Dengan save/restore, user experience tetap smooth.

### Why `Math.min`?
Saat content berubah (misalnya text dihapus), cursor position lama mungkin melebihi document size baru. `Math.min` memastikan position tetap valid.
