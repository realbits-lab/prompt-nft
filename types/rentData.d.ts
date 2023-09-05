export type rentData = {
  nftAddress: string;
  tokenId: bigint;
  rentFee: bigint;
  feeTokenAddress: string;
  rentFeeByToken: bigint;
  isRentByToken: boolean;
  rentDuration: bigint;
  renterAddress: string;
  renteeAddress: string;
  serviceAddress: string;
  rentStartTimestamp: bigint;
};
