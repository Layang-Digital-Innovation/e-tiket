'use client';

import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAllEvents } from '@/hooks/useAdmin';
import { DataTable } from '@/components/table/DataTable';
import { eventColumns } from '@/components/table/columns/event-column';
import { Event, EventOrganizer } from '@/types';
import { EventDetailDialog, UserDetailDialog } from '@/components/dialog';



export default function AdminEventsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Dialog states
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedUser, setSelectedUser] = useState<EventOrganizer | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const apiStatusFilter = statusFilter === "all" ? undefined : statusFilter;

  const { data: eventsResponse, isLoading, error } = useAllEvents({
    page,
    limit,
    status: apiStatusFilter,
    search: debouncedSearch.trim() || undefined,
  })

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  // Dialog handlers
  const handleViewEventDetail = (event: Event) => {
    console.log('handleViewEventDetail called with:', event);
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  const handleViewUserDetail = (user: EventOrganizer) => {
    console.log('handleViewUserDetail called with:', user);
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading events</p>
          <p className="text-sm text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Events</h1>
          <p className="text-gray-600">Pantau dan kelola semua event di platform</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Event
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
          <CardDescription>
            Cari event berdasarkan nama, deskripsi, atau filter berdasarkan status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari nama event atau deskripsi..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {/* Status Filter */}
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar Events</CardTitle>
          <CardDescription>
            Total {eventsResponse?.pagination?.total || 0} event ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data...</p>
              </div>
            </div>
          ) : (
            <>
             <DataTable 
               columns={eventColumns({ 
                 onViewEventDetail: handleViewEventDetail,
                 onViewUserDetail: handleViewUserDetail
               })} 
               data={eventsResponse?.data || []}
             />

              {/* Pagination */}
              {eventsResponse?.data && eventsResponse.pagination.total > eventsResponse.pagination.limit && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Menampilkan {((eventsResponse.pagination.page - 1) * eventsResponse.pagination.limit) + 1} sampai{' '}
                    {Math.min(eventsResponse.pagination.page * eventsResponse.pagination.limit, eventsResponse.pagination.total)} dari{' '}
                    {eventsResponse.pagination.total} hasil
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === Math.ceil(eventsResponse.pagination.total / eventsResponse.pagination.limit)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EventDetailDialog
        event={selectedEvent}
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
      />
    </div>
  );
}