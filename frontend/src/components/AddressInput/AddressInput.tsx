"use client";

import { useState } from "react";
import { Search, Loader2, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import styles from "./AddressInput.module.css";

interface AddressInputProps {
  onSubmit: (address: string, network: string) => void;
  isLoading?: boolean;
}

const NETWORKS = [
  { id: "mainnet", name: "Ethereum Mainnet", icon: "🔷" },
  { id: "polygon", name: "Polygon", icon: "🟣" },
  { id: "arbitrum", name: "Arbitrum", icon: "🔵" },
  { id: "optimism", name: "Optimism", icon: "🔴" },
  { id: "bsc", name: "BNB Chain", icon: "🟡" },
  { id: "base", name: "Base", icon: "🔵" },
  { id: "sepolia", name: "Sepolia Testnet", icon: "⚫" },
];

export default function AddressInput({ onSubmit, isLoading = false }: AddressInputProps) {
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("mainnet");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateAddress = (value: string) => {
    // Basic Ethereum address validation
    const isValidFormat = /^0x[a-fA-F0-9]{40}$/.test(value);
    setIsValid(value.length === 0 ? null : isValidFormat);
    return isValidFormat;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    validateAddress(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAddress(address)) {
      onSubmit(address, network);
    }
  };

  const getEtherscanUrl = () => {
    const explorers: Record<string, string> = {
      mainnet: "https://etherscan.io/address/",
      polygon: "https://polygonscan.com/address/",
      arbitrum: "https://arbiscan.io/address/",
      optimism: "https://optimistic.etherscan.io/address/",
      bsc: "https://bscscan.com/address/",
      base: "https://basescan.org/address/",
      sepolia: "https://sepolia.etherscan.io/address/",
    };
    return explorers[network] + address;
  };

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      {/* Network Selector */}
      <div className={styles.networkSelector}>
        <label className={styles.label}>Select Network</label>
        <div className={styles.networks}>
          {NETWORKS.map((net) => (
            <button
              key={net.id}
              type="button"
              onClick={() => setNetwork(net.id)}
              className={`${styles.networkButton} ${
                network === net.id ? styles.active : ""
              }`}
            >
              <span className={styles.networkIcon}>{net.icon}</span>
              <span className={styles.networkName}>{net.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Address Input */}
      <div className={styles.inputWrapper}>
        <label className={styles.label}>Contract Address</label>
        <div className={styles.inputGroup}>
          <div className={styles.inputContainer}>
            <input
              type="text"
              value={address}
              onChange={handleChange}
              placeholder="0x..."
              className={`${styles.input} ${
                isValid === true ? styles.valid : ""
              } ${isValid === false ? styles.invalid : ""}`}
              disabled={isLoading}
            />
            
            {/* Validation Icon */}
            {isValid !== null && (
              <div className={styles.validationIcon}>
                {isValid ? (
                  <CheckCircle size={20} className={styles.validIcon} />
                ) : (
                  <XCircle size={20} className={styles.invalidIcon} />
                )}
              </div>
            )}
          </div>

          {/* View on Explorer */}
          {isValid && (
            <a
              href={getEtherscanUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.explorerLink}
            >
              <ExternalLink size={18} />
            </a>
          )}
        </div>

        {/* Helper Text */}
        {isValid === false && address.length > 0 && (
          <p className={styles.helperError}>
            Invalid address format. Must be a valid Ethereum address (0x...)
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isValid || isLoading}
        className={`btn btn-primary ${styles.submitButton}`}
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className={styles.spinner} />
            <span>Fetching Contract...</span>
          </>
        ) : (
          <>
            <Search size={20} />
            <span>Audit Contract</span>
          </>
        )}
      </button>
    </form>
  );
}
