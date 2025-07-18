import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { toast } from 'sonner';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';

// Placeholder function for updating events
async function updateEventOnServer(eventInfo: any): Promise<{ title: string }> {
  // This will be replaced with actual Google Calendar API calls
  console.log('Updating event:', eventInfo);
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { title: eventInfo.title };
}

export function CalendarView() {
  const { events, loading, error, refetch } = useCalendarEvents();

  const handleEventDrop = (dropInfo: any) => {
    const promise = updateEventOnServer(dropInfo.event);

    toast.promise(promise, {
      loading: 'Rescheduling event...',
      success: (data) => `${data.title} has been moved successfully!`,
      error: 'Error: Could not move the event.',
    });
  };

  const handleDateClick = (clickInfo: any) => {
    toast.info(`Creating a new event for ${clickInfo.dateStr}`);
    // Logic to open a modal for new event creation would go here
  };

  if (error) {
    return (
      <div className="p-6 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">Family Calendar</h1>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive">Error loading calendar events: {error}</p>
            <button 
              onClick={refetch}
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">Family Calendar</h1>
        
        <div className="bg-card rounded-lg shadow-sm border">
          {loading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            eventDrop={handleEventDrop}
            dateClick={handleDateClick}
            events={events}
            height="auto"
            dayMaxEvents={3}
            moreLinkClick="popover"
            eventDisplay="block"
            displayEventTime={true}
          />
        </div>
      </div>
    </div>
  );
}