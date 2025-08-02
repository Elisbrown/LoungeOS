"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

type Event = {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  capacity: number;
}

export function DashboardCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch events from database
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        throw new Error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load events"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.start_date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  // Get upcoming events (next 7 days)
  const getUpcomingEvents = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate >= today && eventDate <= nextWeek;
    }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return currentDate.getFullYear() === today.getFullYear() &&
           currentDate.getMonth() === today.getMonth() &&
           day === today.getDate();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return currentDate.getFullYear() === selectedDate.getFullYear() &&
           currentDate.getMonth() === selectedDate.getMonth() &&
           day === selectedDate.getDate();
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const renderCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-8" />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(dayDate);
      const hasEvents = dayEvents.length > 0;
      
      days.push(
        <div key={day} className="relative">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 font-normal",
              isToday(day) && "bg-primary text-primary-foreground hover:bg-primary/90",
              isSelected(day) && !isToday(day) && "bg-accent text-accent-foreground",
              "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => setSelectedDate(dayDate)}
          >
            {day}
          </Button>
          {hasEvents && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold">{getMonthName(currentDate)}</h3>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {daysOfWeek.map(day => (
            <div key={day} className="text-xs font-medium text-muted-foreground py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 pt-4 border-t">
        <Button 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => window.location.href = '/dashboard/events'}
        >
          <Plus className="h-3 w-3" />
          Add Event
        </Button>
        {selectedDate && (
          <div className="text-sm text-muted-foreground">
            Selected: {selectedDate.toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Upcoming Events</h4>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading events...</div>
          ) : getUpcomingEvents().length === 0 ? (
            <div className="text-sm text-muted-foreground">No events scheduled</div>
          ) : (
            <div className="space-y-2">
              {getUpcomingEvents().slice(0, 3).map(event => (
                <div key={event.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{event.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {new Date(event.start_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {event.location && (
                        <>
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {getUpcomingEvents().length > 3 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{getUpcomingEvents().length - 3} more events
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 