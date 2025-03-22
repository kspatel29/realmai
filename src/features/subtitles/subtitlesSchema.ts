
import { z } from "zod";

export const subtitlesFormSchema = z.object({
  language: z.string().default("en"),
  model_name: z.string().default("small"),
  vad_filter: z.boolean().default(true),
});

export type SubtitlesFormValues = z.infer<typeof subtitlesFormSchema>;
