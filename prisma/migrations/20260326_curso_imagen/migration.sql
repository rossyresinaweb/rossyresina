-- Agregar tabla Curso, CursoFecha y campo imagen
-- Primero crear tablas si no existen (por si la migración anterior no se aplicó)

CREATE TABLE IF NOT EXISTS "Curso" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nivel" TEXT NOT NULL DEFAULT 'Basico',
    "descripcion" TEXT NOT NULL DEFAULT '',
    "modalidad" TEXT NOT NULL DEFAULT 'Presencial',
    "ciudad" TEXT NOT NULL DEFAULT '',
    "sede" TEXT NOT NULL DEFAULT '',
    "duracionHoras" INTEGER NOT NULL DEFAULT 2,
    "precio" DECIMAL(10,2) NOT NULL,
    "precioAnterior" DECIMAL(10,2),
    "cupoMax" INTEGER NOT NULL DEFAULT 6,
    "imagen" TEXT NOT NULL DEFAULT '',
    "notaAdmin" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CursoFecha" (
    "id" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CursoFecha_pkey" PRIMARY KEY ("id")
);

-- Agregar columna imagen si la tabla ya existía sin ella
ALTER TABLE "Curso" ADD COLUMN IF NOT EXISTS "imagen" TEXT NOT NULL DEFAULT '';

-- Índices
CREATE INDEX IF NOT EXISTS "CursoFecha_cursoId_idx" ON "CursoFecha"("cursoId");
CREATE INDEX IF NOT EXISTS "CursoFecha_fecha_idx" ON "CursoFecha"("fecha");

-- FK de CursoFecha -> Curso
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CursoFecha_cursoId_fkey'
  ) THEN
    ALTER TABLE "CursoFecha" ADD CONSTRAINT "CursoFecha_cursoId_fkey"
      FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Actualizar TallerInscripcion para que apunte a CursoFecha (si no tiene la FK aún)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'TallerInscripcion' AND column_name = 'fechaId'
  ) THEN
    ALTER TABLE "TallerInscripcion" ADD COLUMN "fechaId" TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "TallerInscripcion_fechaId_idx" ON "TallerInscripcion"("fechaId");
CREATE INDEX IF NOT EXISTS "TallerInscripcion_email_idx" ON "TallerInscripcion"("email");
