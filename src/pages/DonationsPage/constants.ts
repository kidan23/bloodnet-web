// Constants for the Donation module
export enum DonationStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  DEFERRED = 'deferred',
  PENDING = 'pending',
  FAILED = 'failed'
}

export enum DonationType {
  WHOLE_BLOOD = 'whole_blood',
  PLATELETS = 'platelets',
  PLASMA = 'plasma',
  RED_CELLS = 'red_cells',
  WHITE_CELLS = 'white_cells',
  STEM_CELLS = 'stem_cells',
  BONE_MARROW = 'bone_marrow',
  CORD_BLOOD = 'cord_blood',
  OTHER = 'other'
}

export enum CollectionMethod {
  PHLEBOTOMY = 'phlebotomy',
  APHERESIS = 'apheresis',
  OTHER = 'other'
}

export const donationStatusOptions = [
  { label: 'Scheduled', value: DonationStatus.SCHEDULED },
  { label: 'Completed', value: DonationStatus.COMPLETED },
  { label: 'Cancelled', value: DonationStatus.CANCELLED },
  { label: 'No Show', value: DonationStatus.NO_SHOW },
  { label: 'Deferred', value: DonationStatus.DEFERRED },
  { label: 'Pending', value: DonationStatus.PENDING },
  { label: 'Failed', value: DonationStatus.FAILED }
];

export const donationTypeOptions = [
  { label: 'Whole Blood', value: DonationType.WHOLE_BLOOD },
  { label: 'Platelets', value: DonationType.PLATELETS },
  { label: 'Plasma', value: DonationType.PLASMA },
  { label: 'Red Cells', value: DonationType.RED_CELLS },
  { label: 'White Cells', value: DonationType.WHITE_CELLS },
  { label: 'Stem Cells', value: DonationType.STEM_CELLS },
  { label: 'Bone Marrow', value: DonationType.BONE_MARROW },
  { label: 'Cord Blood', value: DonationType.CORD_BLOOD },
  { label: 'Other', value: DonationType.OTHER }
];

export const collectionMethodOptions = [
  { label: 'Phlebotomy', value: CollectionMethod.PHLEBOTOMY },
  { label: 'Apheresis', value: CollectionMethod.APHERESIS },
  { label: 'Other', value: CollectionMethod.OTHER }
];
