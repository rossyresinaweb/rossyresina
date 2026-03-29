export type CourseMode = "Presencial" | "Virtual" | "Hibrido";
export type CourseLevel = "Basico" | "Intermedio" | "Avanzado";

export type CourseItem = {
  id: string;
  title: string;
  summary: string;
  cover: string;
  mode: CourseMode;
  level: CourseLevel;
  city: string;
  venue: string;
  startAt: string;
  durationHours: number;
  totalSeats: number;
  soldSeats: number;
  price: number;
  oldPrice?: number;
  tags: string[];
};

export const courseCatalog: CourseItem[] = [];

export const getCourseAvailability = (course: CourseItem) => {
  const remaining = Math.max(0, course.totalSeats - course.soldSeats);
  if (remaining === 0) return { label: "Agotado", tone: "soldout" as const };
  if (remaining <= 6) return { label: "Últimas vacantes", tone: "warning" as const };
  return { label: "Disponible", tone: "available" as const };
};

export const findCourseById = (id: string) =>
  courseCatalog.find((item) => String(item.id) === String(id));

