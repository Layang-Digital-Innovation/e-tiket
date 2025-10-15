import OrganizerLayout from "@/components/layouts/OrganizerLayout"

export default function Organizer ({ children }: { children: React.ReactNode })  {
    return (
        <OrganizerLayout>
            {children}
        </OrganizerLayout>
    )
}
