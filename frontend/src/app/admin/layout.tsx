import AdminLayout from "@/components/layouts/AdminLayout"

export default function Admin ({ children }: { children: React.ReactNode })  {
    return (
        <AdminLayout>
            {children}
        </AdminLayout>
    )
}
