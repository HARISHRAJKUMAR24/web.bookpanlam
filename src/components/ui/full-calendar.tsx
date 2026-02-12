"use client";

import { useState, useMemo, useEffect } from "react";
import ReactFullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput } from "@fullcalendar/core";

interface Props {
  events: EventInput[];
}

const FullCalendar = ({ events }: Props) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Check screen size for responsive adjustments
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  /* Get unique doctors */
  const doctorList = useMemo(() => {
    return Array.from(
      new Set(
        events
          .map((e: any) => e.extendedProps?.doctor_name)
          .filter(Boolean)
      )
    );
  }, [events]);

  /* Default select first doctor */
  const [selectedDoctor, setSelectedDoctor] = useState<string>(
    doctorList[0] || ""
  );

  /* Update selected doctor when doctorList changes */
  useEffect(() => {
    if (doctorList.length > 0 && !selectedDoctor) {
      setSelectedDoctor(doctorList[0]);
    }
  }, [doctorList, selectedDoctor]);

  /* Filter doctor events */
  const doctorEvents = useMemo(() => {
    return events.filter(
      (e: any) =>
        e.extendedProps?.doctor_name === selectedDoctor
    );
  }, [events, selectedDoctor]);

  /* 🔴 Leave Background */
  const leaveEvents = useMemo(() => {
    const leaveSet = new Set();
    const leaveArray: any[] = [];

    doctorEvents.forEach((event: any) => {
      const leaveDates = event.extendedProps?.leave_dates || [];

      leaveDates.forEach((date: string) => {
        const key = `${selectedDoctor}-${date}`;

        if (!leaveSet.has(key)) {
          leaveSet.add(key);

          const nextDay = new Date(date);
          nextDay.setDate(nextDay.getDate() + 1);

          leaveArray.push({
            id: `leave-${key}`,
            start: date,
            end: nextDay.toISOString().split("T")[0],
            allDay: true,
            display: "background",
            backgroundColor: "#ef4444",
          });
        }
      });
    });

    return leaveArray;
  }, [doctorEvents, selectedDoctor]);

  /* 🟢 Appointment Background */
  const appointmentBackgroundEvents = doctorEvents.map((event: any) => {
    const date = event.start.split("T")[0];

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    return {
      id: `appointment-${event.id}`,
      start: date,
      end: nextDay.toISOString().split("T")[0],
      allDay: true,
      display: "background",
      backgroundColor: "#22c55e",
    };
  });

  const finalEvents = [
    ...appointmentBackgroundEvents,
    ...leaveEvents,
  ];

  // Custom calendar options based on screen size
  const calendarOptions = useMemo(() => {
    // Base options
    const options: any = {
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth",
      },
      eventDisplay: "background" as const,
      height: "auto",
      aspectRatio: 1.35,
    };

    // Mobile options
    if (isMobile) {
      options.headerToolbar = {
        left: "prev,next",
        center: "title",
        right: "today",
      };
      options.titleFormat = {
        month: 'short',
        year: 'numeric'
      };
      options.dayHeaderFormat = {
        weekday: 'narrow'
      };
      options.aspectRatio = 0.8;
      options.contentHeight = 400;
    }
    // Tablet options
    else if (isTablet) {
      options.titleFormat = {
        month: 'short',
        year: 'numeric'
      };
      options.dayHeaderFormat = {
        weekday: 'short'
      };
      options.aspectRatio = 1;
      options.contentHeight = 500;
    }
    // Desktop options
    else {
      options.titleFormat = {
        month: 'long',
        year: 'numeric'
      };
      options.dayHeaderFormat = {
        weekday: 'long'
      };
      options.contentHeight = 600;
    }

    return options;
  }, [isMobile, isTablet]);

  return (
    <div className="w-full mx-auto px-2 sm:px-3 md:px-4">
      {/* Doctor Selector - Responsive */}
      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3">
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto">
          <label className="text-xs sm:text-sm font-medium text-gray-600 sm:hidden">
            Select Doctor:
          </label>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="w-full sm:w-auto border rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            {doctorList.length > 0 ? (
              doctorList.map((doc, index) => (
                <option key={index} value={doc}>
                  {doc}
                </option>
              ))
            ) : (
              <option value="">No doctors available</option>
            )}
          </select>
        </div>

        {/* Legend - Visible on tablet and desktop */}
        <div className="hidden sm:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600">Appointments</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-600">Leave</span>
          </div>
        </div>
      </div>

      {/* Mobile Legend - Visible only on mobile */}
      <div className="sm:hidden flex items-center justify-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-green-500 rounded"></div>
          <span className="text-xs text-gray-600">Appointments</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-red-500 rounded"></div>
          <span className="text-xs text-gray-600">Leave</span>
        </div>
      </div>

      {/* Calendar - Responsive Container */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-3 sm:p-4 md:p-5">
          <style jsx global>{`
            /* FullCalendar Responsive Styles */
            .fc {
              font-size: ${isMobile ? '12px' : isTablet ? '13px' : '14px'} !important;
            }
            
            .fc-toolbar {
              display: flex !important;
              flex-wrap: wrap !important;
              align-items: center !important;
              justify-content: space-between !important;
              gap: 0.25rem !important;
              margin-bottom: 0.75rem !important;
            }
            
            /* Center the title and adjust button spacing */
            .fc-toolbar-chunk {
              display: flex !important;
              align-items: center !important;
              gap: 0.2rem !important;
            }
            
            /* Specific styling for prev/next buttons container */
            .fc-toolbar-chunk:first-child {
              display: flex !important;
              gap: 0.2rem !important;
            }
            
            /* Style for all buttons */
            .fc-prev-button,
            .fc-next-button,
            .fc-today-button,
            .fc-dayGridMonth-button {
              margin: 0 !important;
              padding: 0.2rem 0.4rem !important;
              font-size: 0.7rem !important;
              line-height: 1.2 !important;
              border-radius: 0.25rem !important;
              font-weight: 500 !important;
              text-transform: capitalize !important;
              box-shadow: none !important;
            }
            
            /* Add gap between prev and next buttons */
            .fc-prev-button + .fc-next-button {
              margin-left: 0.2rem !important;
            }
            
            /* Mobile specific toolbar */
            @media (max-width: 640px) {
              .fc-toolbar {
                flex-direction: column !important;
                align-items: stretch !important;
                gap: 0.35rem !important;
              }
              
              .fc-toolbar-chunk {
                justify-content: center !important;
                width: 100% !important;
              }
              
              /* Title at the top */
              .fc-toolbar-chunk:nth-child(2) {
                order: 1 !important;
                margin-bottom: 0.1rem !important;
              }
              
              /* Prev/Next buttons in the middle */
              .fc-toolbar-chunk:first-child {
                order: 2 !important;
              }
              
              /* Today button at the bottom */
              .fc-toolbar-chunk:last-child {
                order: 3 !important;
                margin-top: 0.1rem !important;
              }
              
              /* Ultra compact buttons on mobile */
              .fc-prev-button,
              .fc-next-button,
              .fc-today-button,
              .fc-dayGridMonth-button {
                padding: 0.15rem 0.4rem !important;
                font-size: 0.65rem !important;
                min-width: 50px !important;
                min-height: 26px !important;
              }
              
              .fc-today-button {
                flex: 0 1 auto !important;
                width: auto !important;
                min-width: 60px !important;
              }
              
              /* Make prev/next buttons equal width */
              .fc-prev-button,
              .fc-next-button {
                min-width: 50px !important;
              }
            }
            
            .fc-toolbar-title {
              font-size: ${isMobile ? '0.9rem' : isTablet ? '1rem' : '1.25rem'} !important;
              font-weight: 600 !important;
              margin: 0 0.2rem !important;
            }
            
            .fc-button {
              padding: ${isMobile ? '0.15rem 0.4rem' : '0.3rem 0.6rem'} !important;
              font-size: ${isMobile ? '0.65rem' : '0.75rem'} !important;
              border-radius: ${isMobile ? '0.25rem' : '0.375rem'} !important;
              font-weight: 500 !important;
              display: inline-flex !important;
              align-items: center !important;
              justify-content: center !important;
              gap: 0.2rem !important;
              text-transform: capitalize !important;
              min-height: ${isMobile ? '26px' : '32px'} !important;
            }
            
            .fc-daygrid-day-number {
              font-size: ${isMobile ? '0.65rem' : '0.875rem'} !important;
              padding: ${isMobile ? '2px' : '8px'} !important;
            }
            
            .fc-daygrid-day-frame {
              min-height: ${isMobile ? '32px' : isTablet ? '60px' : '80px'} !important;
            }
            
            .fc-col-header-cell-cushion {
              font-size: ${isMobile ? '0.6rem' : '0.8rem'} !important;
              font-weight: 600 !important;
              padding: ${isMobile ? '4px 1px' : '8px 4px'} !important;
              text-transform: uppercase;
              color: #4b5563;
            }
            
            /* Background event styles */
            .fc-daygrid-bg-harness .fc-bg-event {
              opacity: 0.25 !important;
            }
            
            .fc-day-today {
              background-color: #f3f4f6 !important;
            }
            
            /* Better touch targets for mobile */
            @media (max-width: 640px) {
              .fc-daygrid-day-frame {
                cursor: pointer;
              }
              
              .fc-daygrid-day-number {
                display: inline-block;
                width: 22px;
                height: 22px;
                text-align: center;
                line-height: 22px;
                padding: 0 !important;
                margin: 1px;
                font-size: 0.6rem !important;
              }
            }
          `}</style>

          <ReactFullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            {...calendarOptions}
            events={finalEvents}
            dayMaxEvents={isMobile ? 1 : 2}
            dayMaxEventRows={isMobile ? 1 : 2}
            moreLinkContent={(args) => {
              return isMobile
                ? <span className="text-xs font-medium px-1">+{args.num}</span>
                : <span className="text-xs font-medium px-1.5 py-0.5 bg-gray-100 rounded">+{args.num} more</span>;
            }}
            buttonText={{
              today: 'Today',
              month: 'Month'
            }}
          />
        </div>
      </div>

    </div>
  );
};

export default FullCalendar;