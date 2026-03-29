import { TruckIcon, ShieldCheckIcon, ChatBubbleLeftRightIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

const BENEFITS = [
  {
    icon: TruckIcon,
    title: "Envío a todo el Perú",
    description: "Gratis desde S/ 120. Despacho en 24–48 h hábiles vía Shalom y Olva Courier.",
    accent: "bg-blue-50 text-blue-600",
  },
  {
    icon: ShieldCheckIcon,
    title: "Pago 100% seguro",
    description: "Acepta Yape, transferencia bancaria y pago contra entrega en Lima.",
    accent: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: "Asesoría experta",
    description: "Te ayudamos a elegir la resina, molde o pigmento ideal para tu proyecto.",
    accent: "bg-violet-50 text-violet-600",
  },
  {
    icon: ArrowPathIcon,
    title: "Devoluciones fáciles",
    description: "30 días para cambios o devoluciones. Sin complicaciones.",
    accent: "bg-orange-50 text-orange-600",
  },
];

export default function Benefits() {
  return (
    <section className="mx-auto max-w-screen-2xl px-4 md:px-6 my-10">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {BENEFITS.map(({ icon: Icon, title, description, accent }) => (
            <div key={title} className="flex items-start gap-4 p-6 group hover:bg-gray-50 transition">
              <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${accent}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
