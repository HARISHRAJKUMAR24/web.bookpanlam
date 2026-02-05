"use client";

import { useState } from "react";
import ReactFullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput } from "@fullcalendar/core";

interface Props {
  events: EventInput[];
}

const FullCalendar = ({ events }: Props) => {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Count appointment stats for specific doctor
  const getDoctorStats = (doctorName: string) => {
    const doctorEvents = events.filter(
      (e: any) => e.extendedProps?.doctor_name === doctorName
    );

    return {
      total: doctorEvents.length,
      paid: doctorEvents.filter((e: any) => e.extendedProps.status === "paid")
        .length,
      pending: doctorEvents.filter(
        (e: any) => e.extendedProps.status === "pending"
      ).length,
      refund: doctorEvents.filter(
        (e: any) => e.extendedProps.status === "refund"
      ).length,
      cancelled: doctorEvents.filter(
        (e: any) => e.extendedProps.status === "cancelled"
      ).length,
    };
  };

  return (
    <div className="w-full mx-auto">

      {/* EVENT POPUP */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">

            {/* Header */}
            <div className="flex items-center gap-4">
              <img
                src={selectedEvent.extendedProps.doctor_image}
                className="w-16 h-16 rounded-full object-cover border"
              />
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedEvent.extendedProps.doctor_name}
                </h2>
                <p className="text-gray-600 text-sm">
                  {selectedEvent.extendedProps.specialization}
                </p>
              </div>
            </div>

            {/* Doctor Stats */}
            <div className="grid grid-cols-2 gap-3 mt-5 text-center">
              {(() => {
                const s = getDoctorStats(
                  selectedEvent.extendedProps.doctor_name
                );
                return (
                  <>
                    <div>
                      <p className="font-bold">{s.total}</p>
                      <span className="text-gray-500 text-xs">Total</span>
                    </div>
                    <div>
                      <p className="font-bold">{s.paid}</p>
                      <span className="text-gray-500 text-xs">Paid</span>
                    </div>
                    <div>
                      <p className="font-bold">{s.pending}</p>
                      <span className="text-gray-500 text-xs">Pending</span>
                    </div>
                    <div>
                      <p className="font-bold">{s.refund}</p>
                      <span className="text-gray-500 text-xs">Refund</span>
                    </div>
                    <div>
                      <p className="font-bold">{s.cancelled}</p>
                      <span className="text-gray-500 text-xs">Cancelled</span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Appointment Details */}
            <div className="mt-5 border-t pt-4 text-sm text-gray-700 space-y-2">
              <p><b>Service:</b> {selectedEvent.extendedProps.service_name}</p>
              <p><b>Status:</b> {selectedEvent.extendedProps.status}</p>
              <p><b>Amount:</b> ₹{selectedEvent.extendedProps.amount}</p>
              <p><b>Start:</b> {selectedEvent.startStr}</p>
              <p><b>End:</b> {selectedEvent.endStr}</p>
            </div>

            <div className="text-right mt-4">
              <button
                onClick={() => setSelectedEvent(null)}
                className="bg-primary text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP VIEW */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <ReactFullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            height="auto"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "timeGridWeek,timeGridDay",
            }}
            events={events}
            eventClick={(info) => {
              info.jsEvent.preventDefault();
              setSelectedEvent(info.event);
            }}
   eventContent={(arg) => {
  const p = arg.event.extendedProps;

  return {
    html: `
      <div style="display:flex;align-items:center;gap:6px;padding:2px;">
        <img src="${p.doctor_image}" 
             style="width:18px;height:18px;border-radius:50%;object-fit:cover;" />
        <span style="font-size:12px;font-weight:600;">${p.doctor_name}</span>
      </div>
    `
  };
}}

          />
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="block lg:hidden">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <ReactFullCalendar
            plugins={[listPlugin, interactionPlugin]}
            initialView="listWeek"
            height="auto"
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "",
            }}
            events={events}
            eventClick={(info) => {
              info.jsEvent.preventDefault();
              setSelectedEvent(info.event);
            }}
          />
        </div>
      </div>

    </div>
  );
};

export default FullCalendar;
