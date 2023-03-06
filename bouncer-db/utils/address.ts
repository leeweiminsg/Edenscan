// Converts address to human readable format
export const stripLeftPaddingAddress = (address: string): string => {
  return "0x" + address.slice(-40);
};

// Converts address from human readable format back to db address (64 bytes)
export const addLeftPaddingAddress = (address: string): string => {
  return "0x" + "0".repeat(24) + address.slice(2, address.length);
};
