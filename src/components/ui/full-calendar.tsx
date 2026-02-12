"use client";

import { useState, useMemo } from "react";
import ReactFullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput } from "@fullcalendar/core";

interface Props {
  events: EventInput[];
}

const FullCalendar = ({ events }: Props) => {

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

  return (
    <div className="w-full mx-auto">

      {/* Doctor Selector */}
      <div className="mb-4 flex justify-end">
        <select
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm shadow-sm"
        >
          {doctorList.map((doc, index) => (
            <option key={index} value={doc}>
              {doc}
            </option>
          ))}
        </select>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <ReactFullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth",
          }}
          events={finalEvents}
        />
      </div>
    </div>
  );
};

export default FullCalendar;
