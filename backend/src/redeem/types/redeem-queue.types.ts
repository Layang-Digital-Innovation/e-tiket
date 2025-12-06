export interface GenerateRedeemItemsJobData {
  ticketCategoryId: string;
  quantity: number;
  organizerId: string; // For authorization tracking
}
