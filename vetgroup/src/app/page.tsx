"use client";

import Sidebar from "@/components/Elements/Sidebar/sidebar.component";
import ProductContainer from "@/components/ProductComponents/ProductContainer/productContainer.component";
import { useEffect, useRef, useState } from "react";
import "./../styles/main.scss";

const contacts = [
  {
    phone: "37444001071",
    label: "Message us",
  },
  {
    phone: "37444001017",
    label: "Ask a question",
  },
];

export default function Home() {
  const [activeContactIndex, setActiveContactIndex] = useState<number | null>(
    null
  );
  const contactContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contactContainerRef.current &&
        !contactContainerRef.current.contains(event.target as Node)
      ) {
        setActiveContactIndex(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <main className="flex">
      <Sidebar current_user={null} />
      <div className="main_container">
        <ProductContainer />
      </div>

      <div className="contacts" ref={contactContainerRef}>
        {contacts.map((contact, index) => (
          <div
            key={index}
            className={`contact ${
              activeContactIndex === index ? "expanded" : ""
            }`}
            onClick={(e) => {
              if (window.innerWidth <= 768) {
                if (activeContactIndex !== index) {
                  e.preventDefault();
                  setActiveContactIndex(index);
                }
              }
            }}
          >
            <a
              href={`https://wa.me/${contact.phone}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                width="24"
                height="24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.967-.94 1.165-.173.198-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.67-.51-.173-.007-.372-.009-.571-.009s-.52.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.617h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.842 9.842 0 0 1 6.993 2.899 9.825 9.825 0 0 1 2.896 6.991c-.003 5.45-4.437 9.884-9.888 9.884zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .162 5.332.159 11.888c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.876 11.876 0 0 0 5.683 1.447h.005c6.553 0 11.887-5.333 11.89-11.889a11.821 11.821 0 0 0-3.49-8.424z" />
              </svg>
              <span>{contact.label}</span>
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
