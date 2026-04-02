CREATE TABLE "TallerSlot" (
    "id" TEXT NOT NULL,
    "cursoNombre" TEXT NOT NULL,
    "cursoNivel" TEXT NOT NULL DEFAULT 'Basico',
    "fecha" TIMESTAMP(3) NOT NULL,
    "duracionHoras" INTEGER NOT NULL DEFAULT 2,
    "precio" DECIMAL(10,2) NOT NULL,
    "cupoMax" INTEGER NOT NULL DEFAULT 6,
    "notaAdmin" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TallerSlot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TallerInscripcion" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "notas" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TallerInscripcion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TallerSlot_fecha_idx" ON "TallerSlot"("fecha");
CREATE INDEX "TallerInscripcion_slotId_idx" ON "TallerInscripcion"("slotId");
CREATE INDEX "TallerInscripcion_email_idx" ON "TallerInscripcion"("email");

ALTER TABLE "TallerInscripcion" ADD CONSTRAINT "TallerInscripcion_slotId_fkey"
    FOREIGN KEY ("slotId") REFERENCES "TallerSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
