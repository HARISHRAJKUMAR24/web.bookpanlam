export async function saveSeatLayout(eventId: number, layout: any) {
  const res = await fetch(`http://localhost/manager.bookpanlam/public/seller/events/save_seat_layout.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event_id: eventId, layout }),
  });
  return res.json();
}

export async function loadSeatLayout(eventId: number) {
  const res = await fetch(`http://localhost/manager.bookpanlam/public/seller/events/get_seat_layout.php?event_id=${eventId}`);
  return res.json();
}
