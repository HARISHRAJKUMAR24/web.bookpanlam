import FullCalendar from "@/components/ui/full-calendar";
import { getCalendar } from "@/lib/api/appointments";

const Calendar = async () => {
  const events = await getCalendar();

  return <FullCalendar events={events} />;
};

export default Calendar;
