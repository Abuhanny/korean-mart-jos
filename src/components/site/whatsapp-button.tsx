import { MessageCircle } from "lucide-react";
import { whatsappGeneralContactLink } from "@/lib/whatsapp";

export function WhatsAppFloatingButton({ whatsappNumber }: { whatsappNumber: string }) {
  return (
    <a
      href={whatsappGeneralContactLink(whatsappNumber)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" fill="white" />
    </a>
  );
}
