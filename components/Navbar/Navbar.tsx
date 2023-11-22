import Image from "next/image";
import Link from "next/link";
import styles from "./Navbar.module.css";
import { Web3Button } from '@web3modal/react'

/**
 * Navigation bar that shows up on all pages.
 * Rendered in _app.tsx file above the page content.
 */
export function Navbar() {

  return (
    <div className={styles.navContainer}>
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <Link href="/" className={`${styles.homeLink} ${styles.navLeft}`}>
            <Image
              src="/kyx_Dark1.png"
              width={155}
              height={48}
              alt="NFT marketplace sample logo"
            />
          </Link>
        </div>

        <div className={styles.navRight}>
          <div className={styles.navConnect}>
          <Web3Button icon="show" label="Connect Wallet" balance="show"/>
          </div>

        </div>
      </nav>
    </div>
  );
}
