import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  date: z.string().min(1, "Event date is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().optional(),

  country: z.string().min(1, "Country required"),
  state: z.string().min(1, "State required"),
  city: z.string().min(1, "City required"),

  organizer: z.string().min(1, "Organizer required"),

  event_info: z.string().optional(),
  event_comfort: z.string().optional(),
  features: z.string().optional(),
  map_link: z.string().optional(),
  things_to_know: z.string().optional(),
  terms: z.string().optional(),

  videos: z.array(z.string()).optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;
