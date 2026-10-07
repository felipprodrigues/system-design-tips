"use client";

import { useRef } from "react";
import Image from "next/image";
import { Coffee } from "lucide-react";
import styles from "./BuyMeACoffee.module.css";

const BMC_URL = "https://buymeacoffee.com/devrodrigus";

/* Native <dialog> — showModal() gives the backdrop, Esc-to-close and focus
   trapping for free, so there is no modal library here. */
export default function BuyMeACoffee() {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        className={styles.btn}
        onClick={() => ref.current?.showModal()}
        aria-label="Buy me a coffee"
      >
        <Coffee size={15} />
      </button>

      <dialog ref={ref} className={styles.dialog} onClick={(e) => {
        // Clicking the backdrop lands on the <dialog> itself, never a child.
        if (e.target === ref.current) ref.current?.close();
      }}>
        <div className={styles.inner}>
          <h2 className={styles.title}>Support the project</h2>
          <p className={styles.sub}>
            System Design Bits is free and always will be. If it helped, a coffee helps back.
          </p>
          <Image
            src="/bmc-qr-code.png"
            alt="Buy Me a Coffee QR code"
            width={220}
            height={220}
            className={styles.qr}
          />
          <a className={styles.link} href={BMC_URL} target="_blank" rel="noopener noreferrer">
            <Coffee size={18} strokeWidth={2.2} />
            Buy me a coffee
          </a>
          <button className={styles.close} onClick={() => ref.current?.close()}>
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}
